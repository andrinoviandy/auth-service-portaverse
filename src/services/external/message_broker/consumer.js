const ConsumerService = require("./rabbitmq.consumer");
const bulkRegisterUsersConsumer = require("./handler/bulkRegisterUsers.consumer");

const consumerService = new ConsumerService();

consumerService.addListener(bulkRegisterUsersConsumer);

module.exports = consumerService;
