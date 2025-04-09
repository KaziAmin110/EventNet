import { Queue } from "bullmq";
import redisClient from "../../config/redis.config.js";

// Create Email Queue
export const emailQueue = new Queue("emailQueue", {
  connection: redisClient,
});
