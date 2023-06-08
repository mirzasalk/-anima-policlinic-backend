const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      name: String,
      required: true,
    },
    email: {
      email: String,
      required: true,
    },
    password: {
      password: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
