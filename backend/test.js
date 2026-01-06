import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import dotenv from 'dotenv'
dotenv.config()
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY){
  console.log("oops not there")
  console.log(process.env.AWS_ACCESS_KEY_ID)
}
const client = new SQSClient({
  region: "us-east-1", // change if needed
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken:process.env.AWS_SESSION_TOKEN
  },
});

const QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/557690613141/eob2erav2-input";

async function testSQS() {
  try {
    const command = new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify({
        test: "hello from SQS",
        time: new Date().toISOString(),
        webHookUrl : "https://nonatomically-transformational-melida.ngrok-free.dev/api/knowledge-base-sqs-upload"
      }),
    });

    const res = await client.send(command);
    console.log("✅ Message sent:", res.MessageId);
  } catch (err) {
    console.error("❌ SQS error:", err);
  }
}

testSQS();
