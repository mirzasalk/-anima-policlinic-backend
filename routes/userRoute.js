const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const user = require("../models/userModel");

router.post("/register", async (req, res) => {
  try {
    const userExists = await user.findOne({ email: req.body.email });
    if (userExists) {
      res.status(200).send({
        message: "Email adresa je vec u upotrebi",
        success: false,
      });
    } else {
      const password = req.body.password;
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      req.body.password = hash;

      const newUser = new user(req.body);
      await newUser.save();
      res.status(200).send({
        message: "Nalog je uspesno kreiran",
        success: true,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Greska pri kreiranju naloga", success: false, error }); //sta znaci ova linija koda
  }
});

router.post("/login", async (req, res) => {
  try {
  } catch (error) {}
});

module.exports = router;
