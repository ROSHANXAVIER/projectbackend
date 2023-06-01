const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

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
      message: "Eror in Account Status",
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
      message: "Eror in Account Status",
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
};
