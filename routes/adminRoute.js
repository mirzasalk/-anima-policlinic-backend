const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Therapy = require("../models/therapyModel");
const jwt = require("jsonwebtoken");
const authMiddlewea = require("../midlewares/authMiddleweare");

router.post("/approve-doctor-status", authMiddlewea, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId });
    doctor.status = "approved";
    await doctor.save();
    const user = await User.findOne({ _id: doctor.userId });
    user.isDoctor = true;
    await user.save();
    const admin = await User.findOne({ isAdmin: true });
    let unseenNotifications = admin.unseenNotifications.filter((item) => {
      if (item.data.userId !== doctor.userId) return item;
    });
    await User.findByIdAndUpdate(admin._id, { unseenNotifications });

    res
      .status(200)
      .send({ success: true, message: "Vaš zahtev za posao je odobren." });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Greška pri odobravanju zahteva.",
      success: false,
      error,
    });
  }
});

router.post("/reject-doctor-status", authMiddlewea, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId });
    doctor.status = "reject";
    await doctor.save();

    const admin = await User.findOne({ isAdmin: true });
    let unseenNotifications = admin.unseenNotifications.filter((item) => {
      if (item.data.userId !== doctor.userId) return item;
    });
    await User.findByIdAndUpdate(admin._id, { unseenNotifications });

    res
      .status(200)
      .send({ success: true, message: "Vaš zahtev za posao je odobren." });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Greška pri odobravanju zahteva.",
      success: false,
      error,
    });
  }
});

router.post("/add-new-therapy", authMiddlewea, async (req, res) => {
  try {
    const newTherapy = new Therapy(req.body);
    await newTherapy.save();
    res.status(200).send({
      massage: "Terapija je uspesno dodata",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Greška pri dodavanju terapije.",
      success: false,
      error,
    });
  }
});

router.post("/change-therapy-info", authMiddlewea, async (req, res) => {
  try {
    const therapy = await Therapy.findOne({ _id: req.body._id });
    let name = therapy.name;
    name = req.body.name;
    let category = therapy.category;
    category = req.body.category;
    let about = therapy.about;
    about = req.body.about;
    await Therapy.findByIdAndUpdate(therapy._id, { name, category, about });
    res.status(200).send({
      success: true,
      message: `Uspesno ste izmenili informacije za terapiju "${req.body.name}" .`,
      poslato: therapy,
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

router.post("/delete-therapy", authMiddlewea, async (req, res) => {
  try {
    const deletedTherapy = await Therapy.findByIdAndRemove({
      _id: req.body._id,
    });

    if (!deletedTherapy) {
      return res.status(404).json({
        success: false,
        message: "Terapija nije pronađena.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Terapija je uspješno obrisana.",
        deletedTherapy,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Došlo je do greške prilikom brisanja terapije.",
      error: error.message,
    });
  }
});

router.post("/change-admin-info", authMiddlewea, async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.body._id });
    let firstName = admin.firstName;
    firstName = req.body.firstName;
    let lastName = admin.lastName;
    lastName = req.body.lastName;
    let email = admin.email;
    email = req.body.email;
    await User.findByIdAndUpdate(admin._id, { firstName, lastName, email });
    res.status(200).send({
      success: true,
      message: `Uspesno ste izmenili informacije za admina "${req.body.firstName} ${req.body.lastName}".`,
      poslato: admin,
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

router.post("/delete-doctor", authMiddlewea, async (req, res) => {
  try {
    console.log(req.body);
    const deletedDoctor = await Doctor.findByIdAndRemove({
      _id: req.body._id,
    });
    const user = await User.findOne({ _id: req.body.uId });
    let isDoctor = user.isDoctor;
    isDoctor = false;
    await User.findByIdAndUpdate(user._id, { isDoctor });
    if (!deletedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doktor nije pronađena.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Doktor je uspješno obrisana.",
        deletedDoctor,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Došlo je do greške prilikom brisanja doktora.",
      error: error.message,
    });
  }
});

router.post("/change-doctor-info", authMiddlewea, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body._id });

    let address = doctor.address;
    address = req.body.address;
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
    let timings = doctor.timings;
    timings = req.body.timings;

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
    });
    await User.findByIdAndUpdate(doctor.userId, {
      email,

      firstName,
      lastName,
    });
    res.status(200).send({
      success: true,
      message: `Uspesno ste izmenili informacije za doktora "${req.body.firstName}  ${req.body.lastName}" .`,
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

router.post("/delete-user", authMiddlewea, async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findOneAndRemove({
      userId: req.body._id,
    });

    const deletedUser = await User.findByIdAndRemove({
      _id: req.body._id,
    });
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Korisnik nije pronađena.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Korisnik je uspješno obrisana.",
        deletedUser,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Došlo je do greške prilikom brisanja korisnika.",
      error: error.message,
    });
  }
});

router.post("/change-user-info", authMiddlewea, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body._id });

    let firstName = user.firstName;
    firstName = req.body.firstName;
    let lastName = user.lastName;
    lastName = req.body.lastName;
    let email = user.email;
    email = req.body.email;
    await User.findByIdAndUpdate(user._id, { firstName, lastName, email });
    res.status(200).send({
      success: true,
      message: `Uspesno ste izmenili informacije za korisnika "${req.body.firstName} ${req.body.lastName}".`,
      poslato: user,
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

router.post("/get-doctor-info-by-user-id", async (req, res) => {
  console.log(req.body);
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    if (!doctor) {
      return res
        .status(200)
        .send({ massage: "Doktor ne postoji", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: doctor,
      });
    }
  } catch (error) {
    return res.status(500).send({
      massage: `Greska pri pribavljanju konirsnickih informacija ${req.body.userId}`,
      success: false,
      error,
    });
  }
});

module.exports = router;
