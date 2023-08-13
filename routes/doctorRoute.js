const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Apointment = require("../models/apointmentModel");
const authMiddlewea = require("../midlewares/authMiddleweare");

router.post("/change-presonaldoctor-info", authMiddlewea, async (req, res) => {
  try {
    console.log(req.body);
    const doctor = await Doctor.findOne({ _id: req.body._id });

    let address = doctor.address;
    address = req.body.address;
    console.log(address);
    let email = doctor.email;
    email = req.body.email;
    let experience = doctor.experience;
    experience = req.body.experience;
    let feePerConsultation = doctor.feePerConsultation;
    feePerConsultation = req.body.feePerConsultation;
    let firstName = doctor.firstName;
    firstName = req.body.firstName;
    let lastName = doctor.lastName;
    lastName = req.body.lastName;
    let phoneNumber = doctor.phoneNumber;
    phoneNumber = req.body.phoneNumber;
    let specialization = doctor.specialization;
    specialization = req.body.specialization;
    let therapies = doctor.therapies;
    therapies = req.body.therapies;
    let timings = doctor.timings;
    timings = req.body.timings;

    let originalString = timings[0];
    let dateTimePart = originalString.split("T")[1];
    let originalHours = parseInt(dateTimePart.substring(0, 2), 10);
    let newHours = originalHours + 2;
    if (newHours >= 22) {
      newHours = newHours - 24;
    }
    let newDate = new Date(originalString);
    newDate.setUTCHours(newHours);
    let newDateString = newDate.toISOString();
    timings[0] = newDateString;

    originalString = timings[1];
    dateTimePart = originalString.split("T")[1];
    originalHours = parseInt(dateTimePart.substring(0, 2), 10);
    newHours = originalHours + 2;
    if (newHours >= 22) {
      newHours = newHours - 24;
    }
    newDate = new Date(originalString);
    newDate.setUTCHours(newHours);
    newDateString = newDate.toISOString();
    timings[1] = newDateString;
    await Doctor.findByIdAndUpdate(doctor._id, {
      email,
      experience,
      feePerConsultation,
      firstName,
      lastName,
      phoneNumber,
      specialization,
      timings,
      address,
      therapies,
    });
    await User.findByIdAndUpdate(doctor.userId, {
      email,
      firstName,
      lastName,
    });
    res.status(200).send({
      success: true,
      message: `Uspesno ste izmenili svoje informacije"${req.body.firstName}  ${req.body.lastName}" .`,
      poslato: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Greška pri odobravanju zahteva.",
      success: false,
      error,
    });
  }
});

router.post("/get-apointments", authMiddlewea, async (req, res) => {
  try {
    console.log(req.body);
    const apointment = await Apointment.find({
      doctorId: req.body.doctorId,
      status: "pending",
    });
    console.log(apointment);
    if (!apointment) {
      return res
        .status(200)
        .send({ massage: "Ne postoji ni jeda termin", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: apointment,
      });
    }
  } catch (error) {
    return res.status(500).send({
      massage: `Greska pri pribavljanju  informacija o terminima `,
      success: false,
      error,
    });
  }
});

router.post("/approve-apointments", authMiddlewea, async (req, res) => {
  try {
    const apointment = await Apointment.findOne({ _id: req.body._id });
    apointment.status = "approved";
    await apointment.save();

    res
      .status(200)
      .send({ success: true, message: "Zahtev za termin je odobren." });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Greška pri odobravanju zahteva.",
      success: false,
      error,
    });
  }
});

router.post("/get-all-apointments", authMiddlewea, async (req, res) => {
  try {
    console.log(req.body);
    const apointment = await Apointment.find({
      doctorId: req.body.doctorId,
    });
    console.log(apointment);
    if (!apointment) {
      return res
        .status(200)
        .send({ massage: "Ne postoji ni jeda termin", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: apointment,
      });
    }
  } catch (error) {
    return res.status(500).send({
      massage: `Greska pri pribavljanju  informacija o terminima `,
      success: false,
      error,
    });
  }
});

router.post("/reject-apointments", authMiddlewea, async (req, res) => {
  try {
    const apointment = await Apointment.findOne({ _id: req.body._id });
    apointment.status = "rejected";
    await apointment.save();

    res
      .status(200)
      .send({ success: true, message: "Zahtev za termin je odbijen." });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Greška pri odbijanju zahteva.",
      success: false,
      error,
    });
  }
});

router.post("/delete-apointment", authMiddlewea, async (req, res) => {
  try {
    const deletedApointment = await Apointment.findOneAndRemove({
      _id: req.body._id,
    });

    if (!deletedApointment) {
      return res.status(404).json({
        success: false,
        message: "Termin nije pronađena.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Termin je uspješno obrisan.",
        deletedApointment,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Došlo je do greške prilikom brisanja termina.",
      error: error.message,
    });
  }
});

module.exports = router;
