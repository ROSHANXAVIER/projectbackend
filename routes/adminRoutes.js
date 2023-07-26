const express = require("express");
const {
  getAllUsersController,
  getAllDoctorsController,
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
} = require("../controllers/adminCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
const { redeem } = require("../controllers/doctorCtrl");

const router = express.Router();

//GET METHOD || USERS
router.get("/getAllUsers", authMiddleware, getAllUsersController);

//GET METHOD || DOCTORS
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);


///complaints
router.get("/getQuery", authMiddleware, getQuery);


router.get("/requests", authMiddleware, coinlist);
//POST ACCOUNT STATUS
router.post(
  "/changeAccountStatus",
  authMiddleware,
  changeAccountStatusController
);
router.post(
  "/confirmPayment",
  authMiddleware,
  confirmpayment
);
router.post(
  "/cancelPayment",
  authMiddleware,
  cancelpayment
);

router.post(
  "/accept-redeem",
  authMiddleware,
  acceptRedeemRequest
);
router.post(
  "/reject-redeem",
  authMiddleware,
  rejectRedeemRequest
);

router.get("/redeem-requests", authMiddleware, getRedeemRequests);

router.post(
  "/removeDoctor",
  authMiddleware,
  removeDoctor
)
router.post(
  "/removeUser",
  authMiddleware,
  removeUser
)

module.exports = router;
