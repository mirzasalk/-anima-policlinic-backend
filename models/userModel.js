const mongoose = require("mongoose");

const userSchema = new mongoose.Schema( //OVAKO SE PRAVI SEMA PO KOJOJ SE FORMIRAJU KORISNICI
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isDoctor: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },

    seenNotifications: {
      type: Array,
      default: [],
    },
    unseenNotifications: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true, //ZA DOBIJANJE REALNOG VREMENA FORMIRANJA KORISNIKA
  }
);

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
