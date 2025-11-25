const ProducerService = require("./rabbitmq.producer");
const sendGamificationPoint = require("./handler/producers/sendGamificationPoint");

module.exports = {
  sendGamificationPoint: sendGamificationPoint(ProducerService),
};
