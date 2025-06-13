const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const { authenticateUser } = require("../middleware/auth"); // You'll need to create this

// POST: Create a new complaint
router.post("/", authenticateUser, async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        const createdBy = req.user._id; // From auth middleware
        const apartmentCode = req.user.apartmentCode; // From auth middleware

        const newComplaint = new Complaint({
            title,
            description,
            priority,
            createdBy,
            apartmentCode,
            status: "Open"
        });

        await newComplaint.save();

        res.status(201).json({
            message: "Complaint created successfully",
            complaint: newComplaint
        });
    } catch (err) {
        console.error("Complaint creation failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET: Get all complaints for an apartment
router.get("/", authenticateUser, async (req, res) => {
    try {
        const complaints = await Complaint.find({
            apartmentCode: req.user.apartmentCode
        }).populate("createdBy", "phoneNumber flatNumber");

        res.status(200).json(complaints);
    } catch (err) {
        console.error("Failed to fetch complaints:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// PUT: Update complaint status
router.put("/:id/status", authenticateUser, async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        // Only admin or creator can update status
        if (req.user.role !== "admin" && !complaint.createdBy.equals(req.user._id)) {
            return res.status(403).json({ error: "Not authorized" });
        }

        complaint.status = status;
        await complaint.save();

        res.status(200).json({
            message: "Complaint status updated",
            complaint
        });
    } catch (err) {
        console.error("Status update failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;