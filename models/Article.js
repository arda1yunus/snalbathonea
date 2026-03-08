const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  author: { type: String, required: true },
  hashtags: [String],
  content: { type: String, required: true },
  image: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Article", articleSchema);    