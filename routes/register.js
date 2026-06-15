const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// --- Model ---
const registrationSchema = new mongoose.Schema({
  adSoyad: { type: String, required: true, trim: true },
  sinif: { type: String, required: true },
  atolyeTercihleri: {
    type: [String],
    validate: {
      validator: (arr) => arr.length === 4,
      message: '4 atölye tercihi zorunludur.',
    },
  },
  tarih: { type: Date, default: Date.now },
});

const Registration = mongoose.model('Registration', registrationSchema);

// --- POST /api/register ---
router.post('/', async (req, res) => {
  try {
    const { adSoyad, sinif, atolyeTercihleri } = req.body;

    if (!adSoyad || !sinif || !atolyeTercihleri || atolyeTercihleri.length !== 4) {
      return res.status(400).json({ hata: 'Tüm alanlar zorunludur ve 4 atölye tercihi gereklidir.' });
    }

    const kayit = new Registration({ adSoyad, sinif, atolyeTercihleri });
    await kayit.save();

    res.status(201).json({ mesaj: 'Kayıt başarıyla tamamlandı!', id: kayit._id });
  } catch (err) {
    console.error('Kayıt hatası:', err);
    res.status(500).json({ hata: 'Sunucu hatası, lütfen tekrar deneyin.' });
  }
});

const registrationSchema = new mongoose.Schema({
  adSoyad: { type: String, required: true, trim: true },
  sinif: { type: String, required: true },

  motivasyon: {
    type: String,
    required: true
  },

  atolyeTercihleri: {
    type: [String],
    validate: {
      validator: (arr) => arr.length === 4,
      message: '4 atölye tercihi zorunludur.',
    },
  },

  tarih: { type: Date, default: Date.now },
});

// --- GET /api/register (opsiyonel: tüm kayıtları listele) ---
router.get('/', async (req, res) => {
  try {
    const kayitlar = await Registration.find().sort({ tarih: -1 });
    res.json(kayitlar);
  } catch (err) {
    res.status(500).json({ hata: 'Veriler alınamadı.' });
  }
});

module.exports = router;
