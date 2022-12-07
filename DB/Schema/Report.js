const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  owner: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  check: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Check",
    required: true,
  },
  status:{ type: String, required: true, enum: ["Up", "Down"], default: "Down" },
  availability: { type: String, required: true, default: 0 },
  outages: { type: Number, required: true, default: 0 },
  downtime: { type: Number, required: true, default: -1 },
  uptime: { type: Number, required: true, default: -1 },
  requests: { type: Number, required: true, default: 0 },
  responseTime: { type: String, required: true, default: 0 },
  responseTimes: { type: [Number], required: true, default: [] },
  history: { type: [String], required: true, default: [] },


});

module.exports = mongoose.model("Report", Schema);
