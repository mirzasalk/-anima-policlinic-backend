const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

router.post("/registracija", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.user.email });
    if (userExists) {
      return res
        .status(200)
        .send({ massage: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new User(req.body);
    await newUser.save();
    await res
      .status(200)
      .send({ massage: "Nalog je uspesno kreiran", success: true });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Greska pri kreiranju naloga", success: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
  } catch (error) {}
});

module.exports = router;
