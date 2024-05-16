// Dependencies
import { AMQPClient } from "@cloudamqp/amqp-client";
import {} from "dotenv/config";
const cloudAMQPURL = process.env.CLOUDAMQP_URL;
const connection = new AMQPClient(cloudAMQPURL);

async function startConsumer() {
  // Setup a connection to the LavinMQ server
  await connection.connect();
  const channel = await connection.channel();

  // Define queues
  const queHr = await channel.queue("hr_queue");
  const queMart = await channel.queue("marketing_queue");
  const queSupp = await channel.queue("support_queue");

  // Subscribe to message
  async function receiveMessage() {
    try {
      await queHr.subscribe({ noAck: false }, async (msg) => {
        msg.ack();
      });
      await queMart.subscribe({ noAck: false }, async (msg) => {
        msg.ack();
      });
      await queSupp.subscribe({ noAck: false }, async (msg) => {
        msg.ack();
      });
    } catch (err) {
      // error handling
    }
  }

  // Receive message from queue
  receiveMessage();

  // When the process is terminated, close the connection
  process.on("SIGINT", () => {
    channel.close();
    connection.close();
    console.log("Connection closed");
    process.exit(0);
  });
}
// Start services
startConsumer();
