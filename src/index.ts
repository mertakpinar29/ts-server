import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
import { __prod__ } from './constants'
//import { Post } from './entities/Post'
import mikroOrmConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import * as redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { MyContext } from './types'


const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig)
    await orm.getMigrator().up()

    /* 
        const emFork = orm.em.fork()
        const post = emFork.create(Post, { title: "Hello World" })
        await emFork.persistAndFlush(post)
    */

    const app = express()
    

    app.set("trust proxy", !__prod__)
    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient({ legacyMode: true })
    await redisClient.connect()
    
 
    app.use(session({
        name: "qid",
        store: new RedisStore({ 
            client: redisClient,
            disableTouch: true
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
            httpOnly: true,
            sameSite: "none",
            secure: true
        },
        secret: "secretkey",
        resave: false,
        saveUninitialized: false
    }))

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        // context defines object that is accessible from all resolvers
        context: ({ req, res }): MyContext => ({ em: orm.em.fork(), req, res }) 
    })
    
    await apolloServer.start()
    apolloServer.applyMiddleware({ app, cors: {
        origin: 'https://studio.apollographql.com',
        credentials: true,
    } })

    app.listen(5000, () => {
        console.log("Server running on localhost:5000")
    })
}

main().catch(err => console.error(err)) 
