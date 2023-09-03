const express = require("express");
const app = express();
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const doctorRoute = require("./routes/doctorRoute");
const connectDatabase = require("./config/dbConfig");
const cors = require("cors");

require("dotenv").config();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

connectDatabase();

app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/doctor", doctorRoute);

const PORT = process.env.PORT || 5000;
console.log(process.env.MONGO_URL);
app.listen(PORT, () => {
  console.log(`Express servers listening on port ${PORT}`);
});
