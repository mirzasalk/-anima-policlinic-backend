const mongoose = require("mongoose");
require("dotenv").config();

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}
const db = mongoose.connection;

db.once("open", function () {
  console.log("Connected successfully");
});
module.exports = mongoose;
