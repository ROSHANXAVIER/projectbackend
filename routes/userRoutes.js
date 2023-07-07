const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDocotrsController,
  bookeAppointmnetController,
  bookingAvailabilityController,
  userAppointmentsController,
  getPieData,
  slotAvailabilityController,
  feedController,
  feedGet,
  gmeetGet,
  complaint,
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

//router onject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);

//APply Doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

//contact
router.post("/complaint", authMiddleware, complaint);


//Notifiaction  Doctor || POST
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);
//Notifiaction  Doctor || POST
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

//GET ALL DOC
router.get("/getAllDoctors", authMiddleware, getAllDocotrsController);

//PIE DATA
router.get("/getPieData", authMiddleware, getPieData);

//gmeet
router.post("/gmeetGet", authMiddleware, gmeetGet);

//feed
router.post("/getFeed", authMiddleware, feedGet);
//BOOK APPOINTMENT
router.post("/book-appointment", authMiddleware, bookeAppointmnetController);

//Booking Avliability
router.post(
  "/booking-availbility",
  authMiddleware,
  bookingAvailabilityController
);

router.post(
  "/feed",
  authMiddleware,
  feedController
);
router.post(
  "/feedGet",
  authMiddleware,
  feedController
);

//Slot Avliability
router.post(
  "/slot-availability",
  authMiddleware,
  slotAvailabilityController
);


//Appointments List
router.get("/user-appointments", authMiddleware, userAppointmentsController);

module.exports = router;
