const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const authMiddlewea = require("../midlewares/authMiddleweare");

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      res.status(200).send({
        massage: "Email adresa je vec u upotrebi",
        success: false,
      });
    } else {
      const password = req.body.password;
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      req.body.password = hash;

      const newUser = new User(req.body);
      await newUser.save();
      res.status(200).send({
        massage: "Nalog je uspesno kreiran",
        success: true,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ massage: "Greska pri kreiranju naloga", success: false, error }); //sta znaci ova linija koda
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(200).send({
        massage:
          "Molimo vas proverite da li ste uneli ispravnu email adresu ili sifru",
        success: false,
      });
    } else {
      const isMatch = await bcrypt.compare(req.body.password, user.password);

      if (!isMatch) {
        res.status(200).send({
          massage:
            "Molimo vas proverite da li ste uneli ispravnu email adresu ili sifru",
          success: false,
        });
      } else {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "2d",
        });
        res.status(200).send({
          massage: "Uspesno izvrsena prijava",
          success: true,
          data: token,
        });
      }
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ massage: "Greska pri logovanju", success: false, error });
  }
});
router.post("/get-user-info-by-id", authMiddlewea, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    if (!user) {
      return res
        .status(200)
        .send({ massage: "Korisnik ne postoji", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isDoctor: user.isDoctor,
          isAdmin: user.isAdmin,
        },
      });
    }
  } catch (error) {
    return res.status(500).send({
      massage: "Greska pri pribavljanju konirsnickih informacija",
      success: false,
      error,
    });
  }
});

module.exports = router;
