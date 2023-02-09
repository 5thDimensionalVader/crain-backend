const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  host: "./database.sqlite",
});

module.exports = sequelize;