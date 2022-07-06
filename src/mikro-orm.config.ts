import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from '@mikro-orm/core'
import dotenv from 'dotenv'
import path from "path";
import { User } from "./entities/User";
dotenv.config()

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post, User],
    dbName: 'lireddit',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    debug: !__prod__,
    type: 'postgresql',
    port: 9999,
} as Parameters<typeof MikroORM.init>[0]