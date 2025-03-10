// redisClient.js (ES6 module format)
import { createClient } from "redis";

const client = createClient({
  // Your Redis configuration here
});

client.on("connect", () => {
  console.log("Redis client connected");
});

client.on("error", (err) => {
  console.error("Redis client error:", err);
});

export default redis_client; // Export the Redis client as the default export
