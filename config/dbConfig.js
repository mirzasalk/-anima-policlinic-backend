// const mongoose = require("mongoose");
// require("dotenv").config();

// main().catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect(process.env.MONGO_URL);
// }
// const db = mongoose.connection;

// db.once("open", function () {
//   console.log("Connected successfully");
// });
// module.exports = mongoose;
const mongoose = require("mongoose");
require("dotenv").config();
//OVDE JE SVE VEZANO ZA KONEKCIJU SA BAZOM
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
