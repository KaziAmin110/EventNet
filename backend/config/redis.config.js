import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    port: 6379,
  },
});

redisClient.on("connect", () => console.log("Redis Connected Succesfully"));
redisClient.on("error", (err) => console.error("Redis Error: ", err));

// Ensure Redis Connects before exporting
await redisClient.connect();

export default redisClient;
