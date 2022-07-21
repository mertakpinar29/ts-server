import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

// MiddlewareFn is a special type that comes from graphql
// Runs before resolver
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("Authentication required");
  }

  return next();
};
