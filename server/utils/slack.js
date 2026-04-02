import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

console.log(
  "Checking ENV Loader:",
  process.env.SLACK_SUBMISSIONS_WEBHOOK_URL ? "FOUND" : "NOT FOUND",
);

export const sendSubmissionSlackNotification = async (message) => {
  const webhookUrl = process.env.SLACK_SUBSMISSIONS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("Slack Webhook URL is missing in .env");
    return;
  }

  try {
    // Slack expects a JSON object with a 'text' property
    await axios.post(webhookUrl, { text: message });
  } catch (error) {
    console.error("Failed to send Slack notification:", error.message);
  }
};

export const sendSupportSlackNotification = async (message) => {
  const webhookUrl = process.env.SLACK_REQUESTS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("Slack Webhook URL is missing in .env");
    return;
  }

  try {
    // Slack expects a JSON object with a 'text' property
    await axios.post(webhookUrl, { text: message });
  } catch (error) {
    console.error("Failed to send Slack notification:", error.message);
  }
};
