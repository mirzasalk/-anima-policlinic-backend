const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
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
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },

    feePerConsultation: {
      type: Number,
      required: true,
    },
    timings: {
      type: Array,
      required: true,
    },
    therapies: {
      type: Array,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    pendinAppointments: {
      type: Array,
      default: [],
    },
    aprovedAppointments: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true, //ZA DOBIJANJE REALNOG VREMENA FORMIRANJA KORISNIKA
  }
);

const doctorModel = mongoose.model("doctor", userSchema);

module.exports = doctorModel;
