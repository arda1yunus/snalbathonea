const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");

// Middleware: admin kontrol
const apiAuth = (req, res, next) => {
    if (req.session && req.session.isAdmin) next();
    else res.status(401).json({ message: "Yetkisiz erişim!" });
};

// Tüm duyurular
router.get("/", async (req, res) => {
    try {
        const list = await Announcement.find().sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Son N (varsayılan 3) duyuru
router.get("/latest", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const list = await Announcement.find().sort({ createdAt: -1 }).limit(limit);
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Yeni duyuru ekle (admin)
router.post("/", apiAuth, async (req, res) => {
    try {
        const ann = new Announcement({
            title: req.body.title,
            content: req.body.content
        });
        await ann.save();
        res.status(201).json({ message: "Duyuru eklendi" });
    } catch (err) {
        res.status(400).json({ message: "Ekleme hatası" });
    }
});

// Duyuru sil (admin)
router.delete("/:id", apiAuth, async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: "Duyuru silindi" });
    } catch (err) {
        res.status(500).json({ message: "Silme hatası" });
    }
});

module.exports = router;
