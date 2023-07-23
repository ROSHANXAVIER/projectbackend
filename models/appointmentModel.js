const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    doctorInfo: {
      type: String,
      required: true,
    },
    userInfo: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    time: {
      type: Object,
      required: true,
    },
    name:{
      type:String,
      required:true,
      default:"unknown"
    },
    age:{
      type:String,
      required:true,
      default:"unknown"
    },
    gender:{
      type:String,
      required:true,
      default:"unknown"
    },
    bloodgroup:{
      type:String,
      required:true,
      default:"unknown"
    },
    illness:{
      type:String,
      required:true,
      default:"unknown"
    },
    gmeet:{
      type:String,
      required:true,
      default:"You will get your link soon..."
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

const appointmentModel = mongoose.model("appointments", appointmentSchema);

module.exports = appointmentModel;
