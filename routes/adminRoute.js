const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Therapy = require("../models/therapyModel");
const jwt = require("jsonwebtoken");
const authMiddlewea = require("../midlewares/authMiddleweare");
const { cloudinary } = require("../utils/cloudinary");

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
    doctor.status = "rejected";
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
    console.log(req.body);
    const file = req.body.img;
    const uploadedResponse = await cloudinary.uploader.upload(file);

    req.body.img = uploadedResponse.public_id;
    console.log(req.body);
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
    cloudinary.uploader.destroy(deletedTherapy.img, (error, result) => {
      if (error) {
        console.error("Greska pri brisanju:", error);
      } else {
        console.log("Slika je izbrisana sa clouda:", result);
      }
    });
    console.log(deletedTherapy);
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
    cloudinary.uploader.destroy(deletedDoctor.img, (error, result) => {
      if (error) {
        console.error("Greska pri brisanju:", error);
      } else {
        console.log("Slika je izbrisana sa clouda:", result);
      }
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

router.post("/create-new-doctor", authMiddlewea, async (req, res) => {
  try {
    const file = req.body.img;
    const uploadedResponse = await cloudinary.uploader.upload(file);
    req.body.img = uploadedResponse.public_id;
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      req.body._userId = userExists._id;
    } else {
      const password = req.body.password;
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      req.body.password = hash;
      userBody = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        isDoctor: true,
      };
      const newUser = new User(userBody);
      await newUser.save();
      req.body.userId = newUser._id;
    }
    const doctorExists = await Doctor.findOne({ email: req.body.email });
    if (doctorExists) {
      res.status(200).send({
        message: "Doktor sa navedenom email adresom vec postoji",
        success: false,
      });
    } else {
      const newDoctor = new Doctor({ ...req.body, status: "approved" });
      await newDoctor.save();

      res.status(200).send({
        success: true,
        message: "Uspesno ste kreirali nalog za doktora",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ messaga: "Greska pri apliciranju", success: false, error });
  }
});

router.post("/upload-admin-img", authMiddlewea, async (req, res) => {
  try {
    const user = await User.findOne({ isAdmin: true });
    console.log(user);
    cloudinary.uploader.destroy(user.img, (error, result) => {
      if (error) {
        console.error("Greska pri brisanju:", error);
      } else {
        console.log("Slika je izbrisana sa clouda:", result);
      }
    });
    let img = user.img;

    const file = req.body.imgUrl;
    const uploadedResponse = await cloudinary.uploader.upload(file);
    console.log(file);
    img = uploadedResponse.public_id;
    await User.findByIdAndUpdate(user._id, { img });
    res.status(200).send({
      message: "uspesno ste prmenili sliku",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.send({
      message: "Greska u sistemu poskusajte kasnije",
      success: false,
    });
  }
});
router.post("/upload-therapy-img", authMiddlewea, async (req, res) => {
  try {
    const therapy = await Therapy.findOne({ _id: req.body.therapyId });
    cloudinary.uploader.destroy(therapy.img, (error, result) => {
      if (error) {
        console.error("Greska pri brisanju:", error);
      } else {
        console.log("Slika je izbrisana sa clouda:", result);
      }
    });
    console.log(therapy);
    let img = therapy.img;
    const file = req.body.imgUrl;
    const uploadedResponse = await cloudinary.uploader.upload(file);

    img = uploadedResponse.public_id;
    await Therapy.findByIdAndUpdate(req.body.therapyId, { img });
    res.status(200).send({
      message: "uspesno ste prmenili sliku",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.send({
      message: "Greska u sistemu poskusajte kasnije",
      success: false,
    });
  }
});
router.post("/upload-doctor-img", authMiddlewea, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId });
    cloudinary.uploader.destroy(doctor.img, (error, result) => {
      if (error) {
        console.error("Greska pri brisanju:", error);
      } else {
        console.log("Slika je izbrisana sa clouda:", result);
      }
    });
    let img = doctor.img;

    const file = req.body.imgUrl;
    const uploadedResponse = await cloudinary.uploader.upload(file);
    console.log(uploadedResponse);
    img = uploadedResponse.public_id;
    await Doctor.findByIdAndUpdate(req.body.doctorId, { img });
    res.status(200).send({
      message: "uspesno ste prmenili sliku",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.send({
      message: "Greska u sistemu poskusajte kasnije",
      success: false,
    });
  }
});

module.exports = router;
