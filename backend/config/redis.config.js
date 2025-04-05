import { createClient } from "redis";
import { REDIS_DEVELOPER_PASSWORD } from "./env.js";

const redisClient = createClient({
  password: REDIS_DEVELOPER_PASSWORD,
  socket: {
    host: "redis-14184.c52.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 14184,
  },
});

// redisClient.on("error", (err) => console.log("Redis Client Error", err));
// redisClient.on("connect", () => console.log("Redis Connected Successfully!"));
// await redisClient.connect();
export default redisClient;
