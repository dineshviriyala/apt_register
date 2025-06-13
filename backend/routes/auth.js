const express = require("express");
const router = express.Router();
const Apartment = require("../models/Apartment");
const User = require("../models/User");
const bcrypt = require("bcryptjs");


// POST: Register a new apartment 
router.post("/register-apartment", async (req, res) => {
  try {
    const { name } = req.body;
    const apartmentCode = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();

    const newApartment = new Apartment({ name, apartmentCode });
    await newApartment.save();

    res.status(201).json({
      message: "Apartment registered successfully",
      apartmentCode,
    });
  } catch (err) {
    console.error("Apartment registration failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST: Admin Signup
router.post("/signup-admin", async (req, res) => {
  try {
    const { phoneNumber, flatNumber, password, apartmentCode } = req.body;

    const apartment = await Apartment.findOne({ apartmentCode });
    if (!apartment) {
      return res.status(400).json({ error: "Invalid apartment code" });
    }

    const existingUser = await User.findOne({
      phoneNumber,
      apartment: apartment._id,
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists in this apartment",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      phoneNumber,
      flatNumber,
      password: hashedPassword,
      role: "admin",
      apartment: apartment._id,
    });

    await user.save();

    res.status(201).json({
      message: "Admin registered successfully",
    });
  } catch (err) {
    console.error("Admin signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST: Resident Signup
router.post("/signup-resident", async (req, res) => {
  try {
    const { phoneNumber, flatNumber, password, apartmentCode } = req.body;

    const apartment = await Apartment.findOne({ apartmentCode });
    if (!apartment) {
      return res.status(400).json({ error: "Invalid apartment code" });
    }

    const existingUser = await User.findOne({
      phoneNumber,
      apartment: apartment._id,
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists in this apartment",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      phoneNumber,
      flatNumber,
      password: hashedPassword,
      role: "resident",
      apartment: apartment._id,
    });

    await user.save();

    res.status(201).json({
      message: "Resident registered successfully",
    });
  } catch (err) {
    console.error("Resident signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST: Login (admin/resident) using phoneNumber + password
router.post("/login", async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await User.findOne({ phoneNumber }).populate("apartment");
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      role: user.role,
      phone: user.phoneNumber,
      flatNumber: user.flatNumber,
      apartmentCode: user.apartment.apartmentCode,
      apartmentId: user.apartment._id,
      name:
        user.role === "admin"
          ? `Admin of ${user.apartment.name}`
          : `Resident of Flat ${user.flatNumber}`,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST: Validate user by phoneNumber (for dashboard)
router.post("/validate", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber }).populate("apartment");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      phone: user.phoneNumber,
      role: user.role,
      flatNumber: user.flatNumber,
      apartmentCode: user.apartment.apartmentCode,
      apartmentId: user.apartment._id,
      name:
        user.role === "admin"
          ? `Admin of ${user.apartment.name}`
          : `Resident of Flat ${user.flatNumber}`,
    });
  } catch (err) {
    console.error("Validation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
