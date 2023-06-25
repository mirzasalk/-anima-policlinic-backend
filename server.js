const express = require("express");
const app = express();
const userRoute = require("./routes/userRoute");
const connectDatabase = require("./config/dbConfig");
const cors = require("cors");
require("dotenv").config();
app.use(express.json());
app.use(cors());
connectDatabase();

app.use("/api/user", userRoute);

const PORT = process.env.PORT || 5000;
console.log(process.env.MONGO_URL);
app.listen(PORT, () => {
  console.log(`Express servers listening on port ${PORT}`);
});
