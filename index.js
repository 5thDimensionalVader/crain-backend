const express = require("express");
const userRoutes = require("./routes/api/User");
const sequelize = require("./config/database");
require("dotenv").config();

// constants variable
const PORT = process.env.PORT || 5000;

// sync database
sequelize
  .sync({
    logging: false,
    force: false,
  })
  .then(() => console.log("Connected to database."));

// init express class instance
const app = express();

// use middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use("/api/user", userRoutes);
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to crain-api! Developed by @5thDimensionalVader" });
});

// app
app.listen(PORT, (error) => {
  if (error) console.log(`${error}`);
  console.log(`Server listening on PORT ${PORT}.`);
});
