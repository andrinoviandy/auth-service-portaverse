"use strict";

const user = require("./tables/user");

module.exports = {
  up: (queryInterface, Sequelize, migration) => {
    return queryInterface.sequelize.query(user());
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("DROP TABLE tb_user");
  },
};
