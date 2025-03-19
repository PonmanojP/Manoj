const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  action: String,
  device: String,
  appliance: String,
  timestamp: Date,
  battery_charge: Number,
  user: String,
  active_devices: Number,
  status: String,
});

module.exports = mongoose.model('Log', LogSchema);