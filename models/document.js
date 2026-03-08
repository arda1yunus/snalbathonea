const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    driveUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Document", documentSchema);