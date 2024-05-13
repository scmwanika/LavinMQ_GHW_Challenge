// Dependencies
import { AMQPClient } from "@cloudamqp/amqp-client";
import {} from "dotenv/config";
const cloudAMQPURL = process.env.CLOUDAMQP_URL;
const connection = new AMQPClient(cloudAMQPURL);

async function startProducer() {
  try {
    // Setup a connection to the LavinMQ server
    await connection.connect();
    const channel = await connection.channel();

    // Define the exchange
    await channel.exchangeDeclare("slack_notifications", "direct");
    // Define queues
    const queHr = await channel.queue("hr_queue");
    const queMart = await channel.queue("marketing_queue");
    const queSupp = await channel.queue("support_queue");
    // Bind queues to exchange
    await channel.queueBind("hr_queue", "slack_notifications", "hr");
    await channel.queueBind(
      "marketing_queue",
      "slack_notifications",
      "marketing"
    );
    await channel.queueBind("support_queue", "slack_notifications", "support");

    // Publish a message to queue HR
    async function sendHR(routingKey, body) {
      const message = body;
      const jsonMessage = JSON.stringify(message);
      // amqp-client function expects: publish(exchange, routingKey, message, options)
      await queHr.publish("New message in HR", { routingKey }, jsonMessage);
    }

    // Publish a message to queue Marketing
    async function sendMarketing(routingKey, body) {
      const message = body;
      const jsonMessage = JSON.stringify(message);
      // amqp-client function expects: publish(exchange, routingKey, message, options)
      await queMart.publish(
        "New message in Marketing",
        { routingKey },
        jsonMessage
      );
    }

    // Publish a message to queue Support
    async function sendSupport(routingKey, body) {
      const message = body;
      const jsonMessage = JSON.stringify(message);
      // amqp-client function expects: publish(exchange, routingKey, message, options)
      await queSupp.publish(
        "New message in Support",
        { routingKey },
        jsonMessage
      );
    }

    // Send some messages to the queues
    sendHR();
    sendMarketing();
    sendSupport();

    setTimeout(() => {
      // Close the connection
      connection.close();
      process.exit(0);
    }, 500);
    // Catch error
  } catch (error) {
    console.error(error);
  }
}
// Start services
startProducer();
