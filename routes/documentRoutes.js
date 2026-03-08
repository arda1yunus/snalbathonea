const express = require("express");
const router = express.Router();
const Document = require("../models/Document");

// Giriş kontrolü için middleware (server.js'den aktarılabilir veya burada tanımlanabilir)
const authControl = (req, res, next) => {
    if (req.session && req.session.isAdmin) return next();
    res.status(401).json({ success: false, message: "Yetkisiz erişim" });
};

// @route   GET /api/documents
// @desc    Tüm döküman linklerini listeler
router.get("/", async (req, res) => {
    try {
        const docs = await Document.find().sort({ createdAt: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ message: "Dökümanlar yüklenemedi" });
    }
});

// @route   POST /api/documents/add
// @desc    Yeni döküman linki ekler
router.post("/add", authControl, async (req, res) => {
    try {
        const { title, driveUrl } = req.body;
        const newDoc = new Document({ title, driveUrl });
        await newDoc.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;