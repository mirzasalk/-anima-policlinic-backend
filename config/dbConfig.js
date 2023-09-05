const mongoose = require("mongoose");
require("dotenv").config();

const connectDatabase = () => {
  mongoose.connect(process.env.MONGO_URL);

  const connection = mongoose.connection;

  connection.on("connected", () => {
    console.log("MongoDB is connected");
  });
  connection.on("error", (error) => {
    console.log("error in MongoDB conection", error);
  });
};

module.exports = connectDatabase;
