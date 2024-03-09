const express = require('express');
const router = express.Router();
const Power = require('../models/Bills');
const verifyToken = require('../middleware/authMiddleware');

router.post('/add_data', verifyToken, async (req, res) => {
    try {
        const { date, kWh, billValue } = req.body;
        const newPowerDetail = new Power({
            date,
            kWh,
            billValue
        });
        await newPowerDetail.save();
        res.status(201).json({ message: 'Power details added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route for getting all stored rows
router.post('/all_rows', verifyToken, async (req, res) => {
    try {
        const powerDetails = await Power.find();
        res.status(200).json(powerDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Route for update
router.put('/update_data/:date', verifyToken, async (req, res) => {
    try {
        const { kWh, billValue } = req.body;
        const { date } = req.params;

        const updatedPowerDetail = await Power.findOneAndUpdate(
            { date: date }, // Find the document by date
            { $set: { kWh: kWh, billValue: billValue } }, // Set the new values
            { new: true } // Return the updated document
        );

        if (!updatedPowerDetail) {
            return res.status(404).json({ message: 'Power detail not found' });
        }

        res.status(200).json({ message: 'Power detail updated successfully', updatedPowerDetail });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Route for deleting the Row
router.delete('/delete_data/:date', verifyToken, async (req, res) => {
    try {
        const { date } = req.params;

        const deletedPowerDetail = await Power.findOneAndDelete({ date: date });

        if (!deletedPowerDetail) {
            return res.status(404).json({ message: 'Power detail not found' });
        }

        res.status(200).json({ message: 'Power detail deleted successfully', deletedPowerDetail });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
