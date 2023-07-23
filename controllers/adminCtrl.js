const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const complaintModel=require("../models/complaintModel")
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


module.exports = {
  getAllDoctorsController,
  getAllUsersController,
  changeAccountStatusController,
  removeDoctor,
  removeUser,
  getQuery,
};
