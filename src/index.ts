import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
//import { Post } from './entities/Post'
import typeOrmConfig from "./type-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import { createUserLoader } from "./utils/createUserLoader";

const main = async () => {
  const orm = await typeOrmConfig.initialize();

  const app = express();

  app.set("trust proxy", !__prod__);
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        /* used as any solves the problem with package @types/connect-redis */
        client: redis as any,
        disableTouch: true,
      }),
      // cookie will hold the session id
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        /* sameSite: "none" when using apollo studio */
        sameSite: "lax",
        secure: __prod__,
      },
      secret: "secretkey",
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    // context defines object that is accessible from all resolvers
    context: ({ req, res }): MyContext => ({
      orm,
      req,
      res,
      redis,
      userLoader: createUserLoader(),
    }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: ["https://studio.apollographql.com", "http://localhost:3000"],
      credentials: true,
    },
  });

  app.listen(5000, () => {
    console.log("Server running on localhost:5000");
  });
};

main().catch((err) => console.error(err));
