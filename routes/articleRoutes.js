const express = require("express");
const router = express.Router();
const Article = require("../models/Article"); // Büyük harfe dikkat!

// Middleware: Giriş kontrolü
const apiAuth = (req, res, next) => {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: "Yetkisiz erişim!" });
    }
};

// TÜM MAKALELERİ GETİR
router.get("/", async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// TEKİL MAKALE GETİR (Hata aldığın kritik yer burası)
router.get("/:id", async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "Makale bulunamadı" });
        res.json(article);
    } catch (err) {
        res.status(400).json({ message: "Geçersiz ID formatı" });
    }
});

// MAKALE EKLE (Admin korumalı)
router.post("/", apiAuth, async (req, res) => {
    try {
        const newArticle = new Article({
            title: req.body.title,
            summary: req.body.summary,
            author: req.body.author || "Belirtilmemiş",
            hashtags: Array.isArray(req.body.hashtags) ? req.body.hashtags : (req.body.hashtags || []).map(h => h.trim()).filter(Boolean),
            content: req.body.content,
            image: req.body.image
        });
        await newArticle.save();
        res.status(201).json({ message: "Makale başarıyla eklendi!" });
    } catch (err) {
        res.status(400).json({ message: "Ekleme hatası" });
    }
});



// MAKALE SİL (Admin korumalı)
router.delete("/:id", apiAuth, async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.json({ message: "Makale silindi" });
    } catch (err) {
        res.status(500).json({ message: "Silme hatası" });
    }
});

// MAKALE GÜNCELLE (Admin korumalı)
router.put("/:id", apiAuth, async (req, res) => {
    try {
        const updatedData = {
            title: req.body.title,
            summary: req.body.summary,
            author: req.body.author || "Belirtilmemiş",
            hashtags: Array.isArray(req.body.hashtags) ? req.body.hashtags : (req.body.hashtags || []).map(h => h.trim()).filter(Boolean),
            content: req.body.content
        };

        // findByIdAndUpdate: ID'yi bulur, yeni verilerle değiştirir.
        const updatedArticle = await Article.findByIdAndUpdate(
            req.params.id, 
            updatedData, 
            { new: true } // Güncellenmiş hali geri döndürür
        );

        if (!updatedArticle) {
            return res.status(404).json({ message: "Güncellenecek makale bulunamadı." });
        }

        res.json({ message: "Makale başarıyla güncellendi!" });
    } catch (err) {
        res.status(500).json({ message: "Güncelleme hatası", error: err.message });
    }
});

module.exports = router;

