const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

router.post("/registracija", async (req, res) => {
  try {
    const password = req.body.password;
    const salt = bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new User(req.body);
    await newUser.save();
  } catch (error) {}
});

router.post("/login", async (req, res) => {
  try {
  } catch (error) {}
});

module.exports = router;
