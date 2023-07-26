const mongoose = require("mongoose");

const adcoinSchema = new mongoose.Schema(
  {
    userId: {
        type: String,
        default:"unknown" 
    },
    amount: {
        type: Number,
        default:0
    },
    upi: {
        type: String,
        default:"unknown" 
    },
  },
  { timestamps: true }
);

const adcoinModel = mongoose.model("adcoins", adcoinSchema);
module.exports = adcoinModel;