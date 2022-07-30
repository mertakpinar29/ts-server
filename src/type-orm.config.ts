import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import dotenv from "dotenv";
import { User } from "./entities/User";
import { DataSource } from "typeorm";
import path from "path";
import { Updoot } from "./entities/Updoot";
dotenv.config();

export default new DataSource({
  migrations: [path.join(__dirname, "./migrations/*")],
  entities: [Post, User, Updoot],
  database: "lireddit2",
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  type: "postgres",
  host: "localhost",
  port: 9999,
  logging: true,
  synchronize: true,
});
