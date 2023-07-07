const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        default:"" 
      },
    reason: {
        type: String,
        default:""
      },
  },
  { timestamps: true }
);

const complaintModel = mongoose.model("complaints", complaintSchema);
module.exports = complaintModel;
