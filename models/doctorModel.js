const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default:"None"
    },
    firstName: {
      type: String,
      required: [true, "first name is required"],
      default:"None"
    },
    lastName: {
      type: String,
      required: [true, "last name is required"],
      default:"None"
    },
    phone: {
      type: String,
      required: [true, "phone no is required"],
      default:"None"
    },
    email: {
      type: String,
      required: [true, "email is required"],
      default:"None"
    },
    website: {
      type: String,
      default:"None"
    },
    address: {
      type: String,
      required: [true, "address is required"],
      default:"None"
    },
    specialization: {
      type: String,
      required: [true, "specialization is require"],
      default:"None"
    },
    experience: {
      type: String,
      required: [true, "experience is required"],
      default:"None"
    },
    feesPerCunsaltation: {
      type: Number,
      required: [true, "fee is required"],
      default:0
    },
    status: {
      type: String,
      default: "pending",
    },
    timings: {
      type: Object,
      default:{}
    },
    likes:{
      type: Number,
      default: 0
    },
    dislikes:{
      type: Number,
      default: 0
    },
    image:{
      type:String,
      trim:true,
      required:true,
      default:"NONE"
    }
  },
  { timestamps: true }
);

const doctorModel = mongoose.model("doctors", doctorSchema);
module.exports = doctorModel;
