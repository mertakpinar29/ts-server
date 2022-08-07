import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";
import { DataSource } from "typeorm";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
  orm: DataSource;
  req: Request & { session: Session & Partial<SessionData> };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
};
