const amqp = require('amqplib');

const rabbitmqHost = process.env.RABBITMQ_HOST;
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

async function main() {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue('echo');
    const messages = "The quick brown fox jumped over the lazy dog";
    messages.split(' ').forEach((word) => {
      channel.sendToQueue('echo', Buffer.from(word));
    });
    setTimeout(() => { connection.close(); }, 500);
  } catch (err) {
    console.error(err);
  }
}
main();
