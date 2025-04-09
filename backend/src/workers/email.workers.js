import { Worker } from "bullmq";
import redisClient from "../../config/redis.config.js";
import { sendInvitationEmail } from "../services/rso.services.js";

// Create a worker to process emails
const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    console.log("Processing Job: ", job.id);

    const { inviteeEmail, rsoName, inviteToken } = job.data;
    try {
      await sendInvitationEmail(inviteeEmail, rsoName, inviteToken);
      console.log(`✅ Email sent to ${inviteeEmail}`);
    } catch (err) {
      console.error("Error sending email:", err);
      throw err;
    }
  },
  { connection: redisClient, removeOnComplete: true, removeOnFail: false }
);

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

export default emailWorker;
