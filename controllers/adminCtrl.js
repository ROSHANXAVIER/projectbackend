const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const complaintModel=require("../models/complaintModel");
const coinModel = require("../models/coinModel");
const balanceModel = require("../models/balanceModel");
const adcoinModel=require('../models/adcoinModel')
const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({isAdmin:false,isDoctor:false});
    res.status(200).send({
      success: true,
      message: "users data list",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "erorr while fetching users",
      error,
    });
  }
};

const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "Doctors Data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while getting doctors data",
      error,
    });
  }
};

// doctor account status
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status });
    const user = await userModel.findOne({ _id: doctor.userId });
    const notifcation = user.notifcation;
    notifcation.push({
      type: "doctor-account-request-updated",
      message: `Your Doctor Account Request Has ${status} `,
      onClickPath: "/notification",
    });
    user.isDoctor = status === "approved" ? true : false;
    await user.save();
    //email
    const froms="u2004061@rajagiri.edu.in";
    const tos=doctor.email;
    const frps="roshXAVIER01+";
    const subs=`DOC++ Doctor Application ${status}`;
    if(status==="approved"){
      var tes=`Hey ${doctor.name} your appointment is ${status} .`;
    }
    else{
      var tes=`Hey ${doctor.firstName} your appointment is rejected . We are sorry for the inconvenience`;
    }
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
    res.status(201).send({
      success: true,
      message: "Account Status Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror in Account Status",
      error,
    });
  }
};

const removeDoctor=async(req,res)=>{
  try{
    console.log(req.body,'hi')
    const { doctorId} = req.body;
    const doctor = await doctorModel.deleteOne({_id:doctorId})
    const user = await userModel.deleteOne({_id:doctor.userId});
    res.status(201).send({
      success: true,
      message: "Doctor Removed",
      data: doctor,
    });
  }catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting",
      error,
    });
  }
}

const removeUser=async(req,res)=>{
  try{
    console.log(req.body.user,'hi');
    const userId = req.body.user;
    const user = await userModel.deleteOne({_id:userId});

    res.status(201).send({
      success: true,
      message: "User Removed",
      data: user,
    });
  }catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Removing User",
      error,
    }); 
  }
}

const getQuery=async(req,res)=>{
  try{
    const query = await complaintModel.find({}, null, { limit: 6, sort: { createdAt: -1 } });
    res.status(201).send({
      success: true,
      message: "Query send",
      data: query,
    });
  }catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Query fetch",
      error,
    }); 
  }
}
const coinlist=async(req,res)=>{
  try {
    const requests = await coinModel.find({});
    res.send({ requests });
    console.log(requests);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

const confirmpayment=async(req,res)=>{
  try {
    const { requestId, amount, userId } = req.body;

    // Find the user's balance document based on userId
    const user = await coinModel.findOne({ _id:requestId });
    const person=await userModel.findOne({_id:user.userId});
    const userBalance=await balanceModel.findOne({userId:user.userId})
    const newuser=user.userId;
    if (!userBalance) {
      // If the user's balance document does not exist, create a new one
      await balanceModel.create({ userId:newuser, balance: amount });
    } else {
      // If the user's balance document exists, update the balance
      userBalance.balance += amount;
      await userBalance.save();
    }
    const froms="u2004061@rajagiri.edu.in";
    const tos=person.email;
    const frps="roshXAVIER01+";
    const subs=`DOC++ Payment Confirmation`;
    var tes=`Your wallet is updated with ${amount} R Coins.`
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

    // Update the status of the request to "confirmed" in your CoinRequest model
    // You can use the same approach as shown before using the findByIdAndUpdate method
    const request = await coinModel.findByIdAndDelete(requestId);
    res.status(200).json({ message: "Payment confirmed and balance updated" });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const cancelpayment=async(req,res)=>{
  try {
    const { requestId, amount } = req.body;
    const user = await coinModel.findOne({ _id:requestId });
    const person=await userModel.findOne({_id:user.userId});
    // Find the request in coinModel by requestId
    const request = await coinModel.findByIdAndDelete(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    const froms="u2004061@rajagiri.edu.in";
    const tos=person.email;
    const frps="roshXAVIER01+";
    const subs=`DOC++ Payment Rejected`;
    var tes=`Your payment for ${amount} R Coins is rejected.`
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
    // Find the user's balance document based on userId
    

    res.status(200).json({ message: "Payment canceled and balance updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const getRedeemRequests = async (req, res) => {
  try {
    const redeemRequests = await adcoinModel.find();
    res.status(200).json({ success: true, data: redeemRequests });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const acceptRedeemRequest = async (req, res) => {
  try {
    
    const requestId = req.body.user;
    const user = await adcoinModel.findOne({ _id:requestId });
  
    const person=await userModel.findOne({_id:user.userId});
    
    console.log(requestId);
    const redeemRequest = await adcoinModel.findOneAndDelete(requestId);

    if (!redeemRequest) {
      return res.status(404).json({ success: false, error: "Redeem request not found" });
    }

   
    const froms="u2004061@rajagiri.edu.in";
    const tos=person.email;
    const frps="roshXAVIER01+";
    const subs=`DOC++ Redeem Request Accepted`;
    var tes=`Your redeem request for R Coins is accepted.`
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
    // Perform any other necessary actions here, such as updating the user's balance or creating a new redemption record.

    res.status(200).json({ success: true, message: "Redeem request accepted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
const rejectRedeemRequest = async (req, res) => {
  try {
    const requestId = req.body.user;
    
    const user = await adcoinModel.findOne({ _id:requestId });
    const balances=await balanceModel.findOne({userId:user.userId})
    const person=await userModel.findOne({_id:user.userId})
    console.log(requestId);
   
    balances.balance+=user.amount;
    const redeemRequest = await adcoinModel.findOneAndDelete(requestId);
    await balances.save();
    if (!redeemRequest) {
      return res.status(404).json({ success: false, error: "Redeem request not found" });
    }
    const froms="u2004061@rajagiri.edu.in";
    const tos=person.email;
    const frps="roshXAVIER01+";
    const subs=`DOC++ Redeem Request Rejected`;
    var tes=`Your redeem request for R Coins is rejected.`
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

    // Perform any other necessary actions here, such as updating the user's balance or creating a new redemption record.

    res.status(200).json({ success: true, message: "Redeem request rejected" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  getAllDoctorsController,
  getAllUsersController,
  changeAccountStatusController,
  removeDoctor,
  removeUser,
  getQuery,
  coinlist,
  confirmpayment,
  cancelpayment,
  getRedeemRequests,
  acceptRedeemRequest,
  rejectRedeemRequest,
};
