const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const complaintModel = require("../models/complaintModel");
const moment = require("moment");
const multer = require('multer');
const upload = multer(); // Create a multer instance

//register callback
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({ message: "User Already Exists", success: false });
    }

    const password = req.body.password;

    // Check password strength
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(200).send({ message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit", success: false });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const newUser = new userModel(req.body);
    await newUser.save();

    res.status(201).send({ message: "Registered Successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller Error: ${error.message}`,
    });
  }
};


// login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid Email or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

// APpply DOctor CTRL
const applyDoctorController = async (req, res) => {
  console.log(req.body);
  try {
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notifcation = adminUser.notifcation;
    notifcation.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/docotrs",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied SUccessfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error WHile Applying For Doctotr",
    });
  }
};

//notification ctrl
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    console.log(user.notifcation,user.seennotification);
    const seennotification = user.seennotification;
    const notifcation = user.notifcation;
    seennotification.push(...notifcation);
    user.notifcation = [];
    user.seennotification = notifcation;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

// delete notifications
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notifcation = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
    });
  }
};

//GET ALL DOC
const getAllDocotrsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    const patients=await userModel.find({});
    res.status(200).send({
      success: true,
      message: "Docots Lists Fetched Successfully",
      data: {doctors,patients}
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Errro WHile Fetching DOcotr",
    });
  }
};


//BOOK APPOINTMENT
const bookAppointmentController = async (req, res) => {
  
  try {
    req.body.status = "pending";
    const doc = await doctorModel.find({ _id: req.body.doctorId });
    console.log(doc);

    const appointments = await appointmentModel.find({
      userId: req.body.userId,
      date: req.body.date,
    });

    if (appointments.length >= 1) {
      res.status(200).send({
        success: false,
        message: "Max 1 booking per day for each user...",
      });
    } else if (appointments.length == 0) {
      // Update the 'image' field processing
      

      const newAppointment = new appointmentModel(req.body);
      await newAppointment.save();

      const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
      console.log(req.body, "hel");
      user.notifcation.push({
        type: "New-appointment-request",
        message: `A new Appointment Request from ${req.body.userInfo.name}`,
        onCLickPath: "/user/appointments",
      });
      await user.save();

      res.status(200).send({
        success: true,
        message: "Appointment Booked successfully",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Please book a time when the doctor is available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Appointment",
    });
  }
};

// booking bookingAvailabilityController
const bookingAvailabilityController = async (req, res) => {
  try {
    const doc=await doctorModel.find({_id:req.body.doctorId});
    console.log(doc);
    const fromsTime = moment(doc[0].timings[0], "HH:mm").toISOString();
    const tosTime = moment(doc[0].timings[1], "HH:mm").toISOString();
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm").toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    if(fromTime< fromsTime || toTime>tosTime){
      return res.status(200).send({
        message: "Please select a time at which docotor is available.",
        success: false,
      })}
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not Availibale at this time",
        success: false,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};
//SLOT AVAILABILITY
const slotAvailabilityController = async (req, res) => {
  try {
    const dae = req.body.dae;
    const currentDate = new Date(); // Get the current date and time
    
    // Convert the provided date to a Date object
    const selectedDate = new Date(dae);

    // Compare the selectedDate with the currentDate to check if it's in the past
    if (selectedDate < currentDate) {
      return res.status(400).json({
        success: false,
        message: "Please select an appropriate date. The selected date is in the past.",
      });
    }
    
    
    const appoint = await appointmentModel.find({ date: dae });

    const slot_avail=[{ slot: "9am - 10am", selection: "notselected" },
    { slot: "10am - 11am", selection: "notselected" },
    { slot: "11am - 12am", selection: "notselected" },
    { slot: "12am - 1pm", selection: "notselected" },
    { slot: "1pm - 2pm", selection: "notselected" },
    { slot: "2pm - 3pm", selection: "notselected" },
    { slot: "3pm - 4pm", selection: "notselected" },
    { slot: "4pm - 5pm", selection: "notselected" },
    { slot: "5pm - 6pm", selection: "notselected" },]
    for (let i = 0; i < appoint.length; i++) {
        const tim=appoint[i].time;
        for (let i = 0; i < tim.length; i++) {
            if(tim[i].selection=="selected"){
              slot_avail[i].selection="selected"
            }
        }
    }

    res.status(200).send({
      success: true,
      message: "Please choose from available time slots",
      data: slot_avail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};

// const slotAvailabilityController = async (req, res) => {

//     try {
    
//       const dae =req.body.dae;
     
//       const appoint=await appointmentModel.find({date:dae});
      
//       const slot_avail=[{ slot: "9am - 10am", selection: "notselected" },
//       { slot: "10am - 11am", selection: "notselected" },
//       { slot: "11am - 12am", selection: "notselected" },
//       { slot: "12am - 1pm", selection: "notselected" },
//       { slot: "1pm - 2pm", selection: "notselected" },
//       { slot: "2pm - 3pm", selection: "notselected" },
//       { slot: "3pm - 4pm", selection: "notselected" },
//       { slot: "4pm - 5pm", selection: "notselected" },
//       { slot: "5pm - 6pm", selection: "notselected" },]
//       for (let i = 0; i < appoint.length; i++) {
//           const tim=appoint[i].time;
//           for (let i = 0; i < tim.length; i++) {
//               if(tim[i].selection=="selected"){
//                 slot_avail[i].selection="selected"
//               }
//           }
//       }
//       console.log(slot_avail);
//       res.status(200).send({
//         success: true,
//         message: "Please choose from available time slots",
//         data: slot_avail
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).send({
//         success: false,
//         error,
//         message: "Error In Booking",
//       });
//     }
    
// };


const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
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

  for (let i = 0; i < filteredAppointments.length; i++) {
    const doc = await doctorModel.findOne({ _id: filteredAppointments[i].doctorId });
    if (!doc) {
      filteredAppointments[i].doctorId = "No doctor found";
    } else {
      filteredAppointments[i].doctorId = doc.firstName;
    }
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
const getPieData=async(req,res)=>{
  try {
    const doc=await doctorModel.findOne({userId:req.body.userId});
    const pending_appointments=await appointmentModel.find({doctorId:doc._id,status:"pending"});
    const approved_appointments=await appointmentModel.find({doctorId:doc._id,status:"approved"});
    const rejected_appointments=await appointmentModel.find({doctorId:doc._id,status:"reject"});
    const papp={_id:"PENDING",len:pending_appointments.length};
    const aapp={_id:"APPROVED",len:approved_appointments.length};
    const rapp={_id:"REJECTED",len:rejected_appointments.length};
    appointments=[papp,aapp,rapp];
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointments,
      like:doc.likes,
      dislike:doc.dislikes
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Errro WHile Fetching DOcotr",
    });
  }
}


const feedGet = async (req, res) => {
  console.log(req.body.uid);
  try {
    const doc = await doctorModel.findOne({_id: req.body.uid });
    console.log(doc);
    if (doc) {
      res.status(200).send({
        success: true,
        message: "Users Appointments Fetch Successfully",
        likes: doc.likes , // Use default value of 0 if likes property is undefined
        dislikes: doc.dislikes , // Use default value of 0 if dislikes property is undefined
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while fetching Doctor",
    });
  }
};



const feedController = async (req, res) => {
  const doctorId  = req.body.doctorId;
  
  try {
    // Find the doctor by ID
    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Increment the number of likes by 1
    if(req.body.feed=="LIKE"){
      doctor.likes += 1;
    }else{
      doctor.dislikes+=1;
    }
    

    // Save the updated doctor
    await doctor.save();

    return res.status(200).json({ success: true, message: 'Likes updated successfully', data: doctor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
const gmeetGet = async (req, res) => {

  const Id  = req.body.appid;

  // // console.log(doctorId);
  try {
    // Find the doctor by ID
    const appointment = await appointmentModel.find({userId:req.body.user._id,_id:Id});
    const resp=appointment[0].gmeet;
    const doc=appointment[0].doctorInfo;
    const u=await doctorModel.find({_id:doc});
  
    const upi=u[0].website;
  
    return res.status(200).json({ success: true, message: 'GMEET', data: resp ,upi:upi});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
const complaint = async (req, res) => {

  const name=req.body.complaintAgainst;
  const reason=req.body.complaintReason;
  data={name:name,reason:reason}; 

  // // // console.log(doctorId);
  try {
    const newcomplaint = new complaintModel(data);
    await newcomplaint.save();
  
    return res.status(200).json({ success: true, message: 'complaint filed'});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
//cancellation

const deleteAppointment = async (req, res) => {
  const appointmentId = req.body.appointmentId;

  try {
    // Find the appointment by ID and delete it
    const deletedAppointment = await appointmentModel.findByIdAndDelete(appointmentId);

    if (!deletedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Successfully deleted the appointment
    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: deletedAppointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting appointment",
      error: error.message,
    });
  }
};



module.exports = {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDocotrsController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
  getPieData,
  slotAvailabilityController,
  feedController,
  feedGet,
  gmeetGet,
  complaint,
  deleteAppointment,
};
