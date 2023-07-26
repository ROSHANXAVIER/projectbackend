const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const { link } = require("../routes/userRoutes");
const moment = require('moment');
const adcoinModel=require('../models/adcoinModel')
const balanceModel=require('../models/balanceModel')
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "doctor data fetch success",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Fetching Doctor Details",
    });
  }
};

// update doc profile
const updateProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(201).send({
      success: true,
      message: "Doctor Profile Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Doctor Profile Update issue",
      error,
    });
  }
};

//get single docotor
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Sigle Doc Info Fetched",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Erro in Single docot info",
    });
  }
};

const setGmeet = async (req, res) => {
  try {
    const appointment = await appointmentModel.updateOne({ _id: req.body.appId },{gmeet:req.body.link});

    res.status(200).send({
      success: true,
      message: "link send",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Erro in Single docot info",
    });
  }
};

const doctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    const appointments = await appointmentModel.find({
      doctorId: doctor._id,
    });
    const currentDate = moment().startOf('day');
    var time=[];
    var flag=0;
   const today = new Date();
const sortedAppointments = appointments
  .sort((a, b) => {
    const dateA = moment(a.date, 'DD-MM-YYYY');
  const dateB = moment(b.date, 'DD-MM-YYYY');
  return dateA - dateB;
  });

  const filteredAppointments = sortedAppointments.filter(appointment => {
  const appointmentDate = moment(appointment.date, 'DD-MM-YYYY');
  return appointmentDate.isSameOrAfter(currentDate);
});
  console.log(appointments);
    for (let i = 0; i < filteredAppointments.length; i++) {
      const tim=filteredAppointments[i].time;
      for (let i = 0; i < tim.length; i++) {
          if(tim[i].selection=="selected"){
            time.push(tim[i].slot);
            break;
          }
      }
  }
  for (let i = 0; i < filteredAppointments.length; i++) {
    filteredAppointments[i].doctorInfo=time[i];
  }
 
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: filteredAppointments
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Doc Appointments",
    });
  }
};

const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointments = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status }
    );
    const doc=await doctorModel.findOne({_id:appointments.doctorId})
    const user = await userModel.findOne({ _id: appointments.userId });
    const notifcation = user.notifcation;
    notifcation.push({
      type: "status-updated",
      message: `your appointment has been updated ${status}`,
      onCLickPath: "/doctor-appointments",
    });
    await user.save();
    const froms="u2004061@rajagiri.edu.in";
    const tos=user.email;
    const frps="roshXAVIER01+";
    const subs=`DOC++ Appointment ${status}`;
    if(status==="approved"){
      var tes=`Hey ${user.name} your appointment is ${status} by Dr.${doc.firstName}${" "}${doc.lastName} please do join on time on ${appointments.date} . THANKYOU!!..`;
    }
    else{
      var tes=`Hey ${user.name} your appointment is rejected by Dr.${doc.firstName}${" "}${doc.lastName} , we are sorry for the inconvenience.`;
    }
    console.log(req.body,appointments,"ji");
    const nodemailer = require('nodemailer');
let mailOptions = {
    from: froms,
    to: tos,
    subject: subs,
    text: tes
};
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: froms,
      pass: frps
    }
});
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent');
        }
  });
    res.status(200).send({
      success: true,
      message: "Appointment Status Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Update Status",
    });
  }
};





const redeem=async(req,res)=>{
  try {
    const amount = req.body.amount;
    const userId = req.body.userId; // Assuming the authenticated user ID is available in req.user

    // Find the user's current balance document
    const userBalance = await balanceModel.findOne({ userId });
    if (!userBalance) {
      return res.status(404).json({ error: "Balance not found for the user" });
    }
    const doc=await doctorModel.findOne({userId:userId});
    // Add the redeemed amount to the redemption model
    const redemptionEntry = new adcoinModel({ userId:userId,amount:amount ,upi:doc.website});
    await redemptionEntry.save();

    // Update the user's balance to 0
    userBalance.balance = 0;
    await userBalance.save();

    res.status(200).json({ success: true, message: "Balance redeemed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({succcess:false, error: "Internal server error" });
  }
}


module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
  setGmeet,
  redeem,
};
