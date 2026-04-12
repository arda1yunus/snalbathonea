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

// @route   GET /api/documents/:id
// @desc    Tek döküman getirir
router.get("/:id", async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: "Döküman bulunamadı" });
        res.json(doc);
    } catch (err) {
        res.status(400).json({ message: "Geçersiz ID formatı" });
    }
});

// @route   PUT /api/documents/:id
// @desc    Döküman başlığı ve türünü günceller
router.put("/:id", authControl, async (req, res) => {
    try {
        const { title, driveUrl, type } = req.body;
        const updatedDoc = await Document.findByIdAndUpdate(
            req.params.id,
            { title, driveUrl, type },
            { new: true }
        );

        if (!updatedDoc) {
            return res.status(404).json({ success: false, message: "Döküman bulunamadı" });
        }

        res.json({ success: true, message: "Döküman güncellendi" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/documents/add
// @desc    Yeni döküman linki ekler
router.post("/add", authControl, async (req, res) => {
    try {
        const { title, driveUrl, type } = req.body;
        const newDoc = new Document({ title, driveUrl, type });
        await newDoc.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;