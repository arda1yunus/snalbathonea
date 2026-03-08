require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Dosyaların kaydedileceği yer (public/uploads klasörünü projenin ana dizininde oluşturmayı unutma!)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const session = require("express-session");

const app = express();

// API Yükleme Yolu (app oluşturulduktan sonra)
app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Dosya yüklenemedi!" });
    
    // Frontend'e resmin erişilebilir URL'sini gönder
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// Resim listesi API'si
app.get("/api/images", (req, res) => {
    const imagesDir = path.join(__dirname, "public/images");
    try {
        const files = fs.readdirSync(imagesDir).filter(file => {
            return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
        });
        const images = files.map(file => `/images/${file}`);
        res.json(images);
    } catch (err) {
        res.status(500).json({ message: "Resimler yüklenirken hata oluştu" });
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session ayarı (Statik dosyalardan ve rotalardan önce gelmeli)
app.use(session({
    secret: "gizli_anahtar",
    resave: false,
    saveUninitialized: true
}));

mongoose.connect(process.env.MONGO_URI);

function authControl(req, res, next) {
    if (req.session.isAdmin) next();
    else res.redirect("/login.html");
}

// API ROTALARI
const articleRoutes = require("./routes/articleRoutes");
app.use("/api/articles", articleRoutes);
const announcementRoutes = require("./routes/announcementRoutes");
app.use("/api/announcements", announcementRoutes);
const documentRoutes = require("./routes/documentRoutes");
app.use("/api/documents", documentRoutes);

// ADMIN GİRİŞİ
app.post("/api/login", (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});



// SAYFA YÖNLENDİRMELERİ
app.get("/admin.html", authControl, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "admin.html"));
});

app.get("/articles/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "article-detail.html"));
});

app.get("/add-article.html", authControl, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "add-article.html"));
});

app.get("/add-document.html", authControl, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "add-document.html"));
});

app.get("/add-announcement.html", authControl, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "add-announcement.html"));
});

app.get("/edit-article.html", authControl, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "edit-article.html"));
});

// STATİK DOSYALAR (En altta)
app.use(express.static(path.join(__dirname, "public")));

// Statik dosyalar için private klasörünü ekliyoruz
app.use('/private', express.static(path.join(__dirname, 'private')));

app.listen(process.env.PORT || 3000, () => console.log("Sunucu " + (process.env.PORT || 3000) + " portunda aktif."));

