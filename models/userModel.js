const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      name: String,
      required: Boolean,
    },
    lastname: {
      name: String,
      required: Boolean,
    },
    email: {
      email: String,
      required: Boolean,
    },
    password: {
      password: String,
      required: Boolean,
    },
  },
  {
    timestamps: true,
  }
);
const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
