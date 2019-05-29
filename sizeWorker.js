const sizeOf = require('image-size');

const { connectToDB } = require('./lib/mongo');
const { connectToRabbitMQ, getChannel } = require('./lib/rabbitmq');
const {
  getDownloadStreamById,
  updateImageSizeById
} = require('./models/image');

async function main() {
  try {
    await connectToRabbitMQ('images');
    const channel = getChannel();
    channel.consume('images', (msg) => {
      if (msg) {
        const id = msg.content.toString();
        const downloadStream = getDownloadStreamById(id);
        const imageData = [];
        downloadStream.on('data', (data) => {
          imageData.push(data);
        });
        downloadStream.on('end', async () => {
          const dimensions = sizeOf(Buffer.concat(imageData));
          console.log("== dimensions:", dimensions);
          const result = await updateImageSizeById(id, dimensions);
          if (result) {
            console.log("== Size updated for image:", id);
          }
        });
      }
      channel.ack(msg);
    });
  } catch (err) {
    console.error(err);
  }
}
connectToDB(main);
