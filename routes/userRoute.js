const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const Doctor = require("../models/doctorModel");
const Therapy = require("../models/therapyModel");
const Apointment = require("../models/apointmentModel");
const jwt = require("jsonwebtoken");
const authMiddlewea = require("../midlewares/authMiddleweare");
const { cloudinary } = require("../utils/cloudinary");
const sendEmail = require("../utils/sendEmail");

router.post("/register", async (req, res) => {
  // function base64UrlEncode(str) {
  //   let base64 = btoa(str); // Kodiranje u Base64
  //   base64 = base64.replace("+", "-").replace("/", "_").replace(/=+$/, ""); // Zamena znakova za URL kompatibilnost
  //   return base64;
  // }
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
      // const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      //   expiresIn: "1h",
      //   algorithm: "HS256",
      // });
      // const encodedToken = base64UrlEncode(token);
      console.log("ovde");
      const url = `${process.env.BASE_URL}/user/${newUser._id}/verify`;
      console.log("2");
      await sendEmail(newUser.email, "Verify Email", url);
      console.log("3");
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
          expiresIn: "1d",
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

router.post("/get-doctor-info-by-id", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.userId });

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

router.post("/get-user-info-by-id", authMiddlewea, async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findOne({ _id: req.body.userId });

    if (!user) {
      return res
        .status(200)
        .send({ massage: "Korisnik ne postoji", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isDoctor: user.isDoctor,
          isAdmin: user.isAdmin,
          unseenNotifications: user.unseenNotifications,
          img: user.img,
          verified: user.verified,
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

router.post("/doctor-apply", authMiddlewea, async (req, res) => {
  try {
    const file = req.body.img;
    const uploadedResponse = await cloudinary.uploader.upload(file);
    req.body.img = uploadedResponse.public_id;
    const newDoctor = new Doctor({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await User.findOne({ isAdmin: true });
    const unseenNotifications = adminUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} je aplicirao za posao`,
      data: {
        doctorId: newDoctor._id,
        userId: newDoctor.userId,
        name: newDoctor.firstName + " " + newDoctor.lastName,
      },
      onClickPath: "doktori",
    });
    await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
    res
      .status(200)
      .send({ success: true, message: "Uspesno ste aplicirali za posao" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ messaga: "Greska pri apliciranju", success: false, error });
  }
});

router.post("/apointment-apply", authMiddlewea, async (req, res) => {
  try {
    const newApointment = new Apointment({
      ...req.body,
      status: "pending",
    });
    await newApointment.save();

    res
      .status(200)
      .send({ success: true, message: "Uspesno ste aplicirali za termin" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ messaga: "Greska pri apliciranju", success: false, error });
  }
});

router.get("/get-users", authMiddlewea, async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      return res
        .status(200)
        .send({ massage: "Ne postoji ni jeda korisnik", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: users,
      });
    }
  } catch (error) {
    return res.status(500).send({
      massage: `Greska pri pribavljanju konirsnickih informacija `,
      success: false,
      error,
    });
  }
});

router.get("/get-doctors", authMiddlewea, async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    if (!doctors) {
      return res
        .status(200)
        .send({ massage: "Ne postoji ni jedan korisnik", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: doctors,
      });
    }
  } catch (error) {
    return res.status(500).send({
      massage: `Greska pri pribavljanju konirsnickih informacija `,
      success: false,
      error,
    });
  }
});

router.get("/get-therapys", authMiddlewea, async (req, res) => {
  try {
    const therapys = await Therapy.find({});
    if (!therapys) {
      return res
        .status(200)
        .send({ massage: "Ne postoji ni jedna terapija", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: therapys,
      });
    }
  } catch (error) {
    return res.status(500).send({
      massage: `Greska pri pribavljanju liste terapijama `,
      success: false,
      error,
    });
  }
});

router.post("/check-availability", authMiddlewea, async (req, res) => {
  const doctorId = req.body.doctorId;
  const date = req.body.date;
  const curDate = new Date();
  let text = curDate.toISOString();
  const godina = text.slice(0, 4);
  const mesec = text.slice(5, 7);
  const dan = text.slice(8, 10);
  let temp = false;
  let dateTemp = false;

  if (
    Number(godina) <= date[2] &&
    Number(mesec) <= date[1] &&
    Number(dan) <= date[0]
  ) {
    dateTemp = true;
  } else {
    dateTemp = false;
  }
  console.log(
    Number(godina),
    date[2],
    Number(mesec),
    date[1],
    Number(dan),
    date[0]
  );

  try {
    const apointment = await Apointment.find({
      date,
      doctorId,
    });

    let vremePoslatogZahteva = req.body.timings[0] * 60 + req.body.timings[1];
    let DokotorStartTime =
      req.body.doctorTimings[0][0] * 60 + req.body.doctorTimings[0][1];
    let doctorEndTime =
      req.body.doctorTimings[1][0] * 60 + req.body.doctorTimings[1][1];
    let checkDoctorTime = false;
    if (
      vremePoslatogZahteva >= DokotorStartTime &&
      vremePoslatogZahteva <= doctorEndTime - 30
    ) {
      checkDoctorTime = true;
    }

    if (apointment.length === 0) {
      if (checkDoctorTime) {
        temp = true;
      }
    } else {
      apointment.map((item, index) => {
        let vremeZahtevaKojiSeObradjuje =
          item.timings[0] * 60 + item.timings[1];
        vremePoslatogZahteva - 30 >= vremeZahtevaKojiSeObradjuje &&
        checkDoctorTime
          ? (temp = true)
          : vremePoslatogZahteva + 30 <= vremeZahtevaKojiSeObradjuje &&
            checkDoctorTime
          ? (temp = true)
          : (temp = false);
      });
    }

    if (temp === true && dateTemp === true) {
      return res.status(200).send({
        message: "Termin je slobodan",
        success: true,
      });
    } else {
      res.status(200).send({
        message: "Termin nije slobodan",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ messaga: "Greska pri proveri", success: false, error });
  }
});

router.post("/get-doctor-apointments", authMiddlewea, async (req, res) => {
  try {
    console.log(req.body);
    const apointment = await Apointment.find({ doctorId: req.body.id });
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
router.post("/get-apointments", authMiddlewea, async (req, res) => {
  try {
    console.log(req.body);
    const apointment = await Apointment.find({ userId: req.body.userId });
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

router.get("/get-doctors-for-unsigned-user", async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    if (!doctors) {
      return res
        .status(200)
        .send({ massage: "Ne postoji ni jedan korisnik", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: doctors,
      });
    }
  } catch (error) {
    return res.status(500).send({
      massage: `Greska pri pribavljanju konirsnickih informacija `,
      success: false,
      error,
    });
  }
});

router.get("/get-therapies-gor-unsigned-user", async (req, res) => {
  try {
    const therapys = await Therapy.find({});
    if (!therapys) {
      return res
        .status(200)
        .send({ massage: "Ne postoji ni jedna terapija", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: therapys,
      });
    }
  } catch (error) {
    return res.status(500).send({
      massage: `Greska pri pribavljanju liste terapijama `,
      success: false,
      error,
    });
  }
});

router.get("/:id/verify", async (req, res) => {
  let valid = true;
  console.log(user);
  console.log(req.params.id);
  // function base64UrlDecode(base64Url) {
  //   let base64 = base64Url.replace("-", "+").replace("_", "/");

  //   while (base64.length % 4 !== 0) {
  //     base64 += "=";
  //   }

  //   return atob(base64); // Dekodiranje Base64
  // }

  const user = await User.findOne({ _id: req.params.id });

  if (!user) {
    valid = false;
    console.log(valid);
  }
  // const token = req.params.token;
  // const base64Token = base64UrlDecode(token);

  // jwt.verify(base64Token, process.env.JWT_SECRET, (err, decoded) => {
  //   if (err) {
  //     valid = false;
  //     console.log("nije validan token");
  //   }
  // });
  if (!valid) {
    try {
      const deletedUser = await User.findByIdAndRemove({
        _id: req.params.id,
      });
    } catch (error) {
      console.log(error);
    }
    return res.status(400).send({ message: "invalid link", success: false });
  }
  let verified = user.verified;
  verified = true;
  await User.findByIdAndUpdate(user._id, { verified });
  res
    .status(200)
    .send({ message: "Uspesno verifikovana email adresa", success: true });
});

module.exports = router;
