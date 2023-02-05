const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("database", "user", "pass", {
  dialect: "sqlite",
  host: "./database.sqlite",
});

module.exports = sequelize;
