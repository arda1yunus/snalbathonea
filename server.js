require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || "gizli_anahtar",
    resave: false,
    saveUninitialized: true
}));

// ======================
// STATIC FOLDERS
// ======================
app.use(express.static(path.join(__dirname, "public")));
app.use('/private', express.static(path.join(__dirname, 'private')));

// ======================
// UPLOAD FOLDER SAFE INIT
// ======================
const uploadDir = path.join(__dirname, "public/uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ======================
// MULTER CONFIG
// ======================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// ======================
// MONGO CONNECT (SAFE)
// ======================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB bağlandı"))
.catch(err => {
    console.error("MongoDB bağlantı hatası:", err);
    process.exit(1);
});

// ======================
// AUTH
// ======================
function authControl(req, res, next) {
    if (req.session.isAdmin) next();
    else res.redirect("/login.html");
}

// ======================
// ROUTES
// ======================
app.get('/etkinlikler', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'etkinlikler.html'));
});

app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Dosya yüklenemedi!" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

app.get("/api/images", (req, res) => {
    const imagesDir = path.join(__dirname, "public/images");

    try {
        const files = fs.readdirSync(imagesDir)
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

        const images = files.map(file => `/images/${file}`);
        res.json(images);

    } catch (err) {
        res.status(500).json({ message: "Resimler yüklenemedi" });
    }
});

// ======================
// API ROUTES
// ======================
app.use("/api/articles", require("./routes/articleRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));

// ======================
// LOGIN
// ======================
app.post("/api/login", (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        return res.json({ success: true });
    }

    res.status(401).json({ success: false });
});

// ======================
// PAGES
// ======================
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

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
