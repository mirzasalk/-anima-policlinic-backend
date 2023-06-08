const express = require("express");
const app = express();
require("dotenv").config();
const dbConfig = require("./config/dbConfig");
const port = process.env.PORT || 5000;
const userRoute = require("./routes/userRoute");

app.use(express.json());

app.use("/api/user", userRoute);

app.listen(port, () => {
  console.log(`Express server listening on ${port}`);
});
