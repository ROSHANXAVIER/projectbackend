const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema(
  {
    userId: {
        type: String,
        default:"unknown" 
    },
    balance: {
        type: Number,
        default:0
    },
  },
  { timestamps: true }
);

const balanceModel = mongoose.model("balance", balanceSchema);
module.exports = balanceModel;
