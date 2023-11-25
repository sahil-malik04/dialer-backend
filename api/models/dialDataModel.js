const mongoose = require("mongoose");
const crypto = require("crypto");

const dialDataModel = new mongoose.Schema({
  sid: {
    type: String,
    required: true,
    default: crypto.randomBytes(12).toString('hex'),
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  callStatus: {
    type: String,
  },
  answeredBy: {
    type: String
  },
  createdAt: {
    type: String,
    required: true
  },
  updatedAt: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model("dialer_details", dialDataModel);
