const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// ======================
// MAIL CONFIG
// ======================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ======================
// MODEL
// ======================
const registrationSchema = new mongoose.Schema({
  adSoyad: {
    type: String,
    required: true,
    trim: true
  },

  sinif: {
    type: String,
    required: true
  },

  motivasyon: {
    type: String,
    required: true
  },

  atolyeTercihleri: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length === 4,
      message: '4 atölye tercihi zorunludur.'
    }
  },

  tarih: {
    type: Date,
    default: Date.now
  }
});

const Registration = mongoose.model('Registration', registrationSchema);

// ======================
// POST /api/register
// ======================
router.post('/', async (req, res) => {
  try {
    const {
      adSoyad,
      sinif,
      motivasyon,
      atolyeTercihleri
    } = req.body;

    if (
      !adSoyad ||
      !sinif ||
      !motivasyon ||
      !atolyeTercihleri ||
      !Array.isArray(atolyeTercihleri)
    ) {
      return res.status(400).json({
        hata: 'Tüm alanlar zorunludur.'
      });
    }

    const kayit = await Registration.create({
      adSoyad,
      sinif,
      motivasyon,
      atolyeTercihleri
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.RECEIVER_EMAIL,
      subject: 'Yeni Etkinlik Başvurusu',
      html: `
        <h2>Yeni Başvuru</h2>

        <p><strong>Ad Soyad:</strong> ${adSoyad}</p>
        <p><strong>Sınıf:</strong> ${sinif}</p>

        <h3>Motivasyon</h3>
        <p>${motivasyon}</p>

        <h3>Atölye Tercihleri</h3>
        <ol>
          ${atolyeTercihleri.map(t => `<li>${t}</li>`).join('')}
        </ol>
      `
    });

    return res.status(201).json({
      mesaj: 'Kayıt başarıyla tamamlandı!',
      id: kayit._id
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);

    return res.status(500).json({
      hata: 'Sunucu hatası.'
    });
  }
});

// ======================
// GET /api/register
// ======================
router.get('/', async (req, res) => {
  try {
    const kayitlar = await Registration.find().sort({ tarih: -1 });
    return res.json(kayitlar);

  } catch (err) {
    console.error('GET ERROR:', err);

    return res.status(500).json({
      hata: 'Veriler alınamadı.'
    });
  }
});

module.exports = router;
