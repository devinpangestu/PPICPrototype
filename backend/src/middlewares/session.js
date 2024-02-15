import session from "express-session";
import "dotenv/config";
import env from "../utils/validateEnv.js";
// import redisClient from "../config/redis.js";
// import RedisStore from "connect-redis";

export default session({
  // store: new RedisStore({ client: redisClient }),
  secret: env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  name: "sessionId",
  proxy: true,
  rolling: true,
  cookie: {
    secure: true, // if true: only transmit cookie over https, in prod, always activate this
    maxAge: 1000 * 60 * 30, // session max age in milliseconds
    sameSite: "none",
  },
});
