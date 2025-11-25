const amqp = require("amqplib");

class ConsumerService {
  constructor() {
    this.listeners = [];
  }

  addListener(...listeners) {
    this.listeners.push(...listeners);
  }

  async init() {
    try {
      const connection = await amqp.connect(
        process.env.RABBITMQ_SERVER || "amqp://localhost"
      );

      const channel = await connection.createChannel();
      this.listeners.forEach(async (listener) => {
        await channel.assertQueue(listener.queue, {
          durable: true,
        });
        channel.consume(listener.queue, listener.listen, {
          noAck: true,
        });
      });
    } catch (error) {
      console.log("connection rabbitmq error: ");
      console.log(error);
    }
  }
}

module.exports = ConsumerService;
