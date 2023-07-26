const mongoose = require("mongoose");

const coinSchema = new mongoose.Schema(
  {
    userId: {
        type: String,
        default:"unknown" 
    },
    amount: {
        type: Number,
        default:0
    },
    paymentMethod: {
        type: String,
        default:"unknown" 
    },
  },
  { timestamps: true }
);

const coinModel = mongoose.model("coins", coinSchema);
module.exports = coinModel;
