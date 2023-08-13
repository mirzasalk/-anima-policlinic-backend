const mongoose = require("mongoose");

const apointmentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    address: {
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
    therapy: {
      type: String,
      required: true,
    },
    timings: {
      type: Array,
      required: true,
    },
    date: {
      type: Array,
      required: true,
    },
    doctorFirstName: {
      type: String,
      required: true,
    },
    doctorLastName: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const apointmentModel = mongoose.model("apointment", apointmentSchema);

module.exports = apointmentModel;
