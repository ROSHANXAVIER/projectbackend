const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required:true,
      default:"unknown"
    },
    doctorId: {
      type: String,
      required:true,
      default:"unknown"
    },
    doctorInfo: {
      type: String,
      required:true,
      default:"unknown"
    },
    userInfo: {
      type: String,
      required:true,
      default:"unknown"
    },
    date: {
      type: String,
      required:true,
      default:"unknown"
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
      default:"unknown"
    },
    age:{
      type:String,
      default:"unknown"
    },
    gender:{
      type:String,
      default:"unknown"
    },
    bloodgroup:{
      type:String,
      default:"unknown"
    },
    illness:{
      type:String,
      default:"unknown"
    },
    gmeet:{
      type:String,
      default:"You will get your link soon..."
    },
    image:{
      type:String,
      trim:true,
      default:"NONE"
    }
  },
  { timestamps: true }
);

const appointmentModel = mongoose.model("appointments", appointmentSchema);

module.exports = appointmentModel;
