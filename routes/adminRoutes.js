const express = require("express");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
  removeDoctor,
  removeUser,
  getQuery,
} = require("../controllers/adminCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//GET METHOD || USERS
router.get("/getAllUsers", authMiddleware, getAllUsersController);

//GET METHOD || DOCTORS
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);


///complaints
router.get("/getQuery", authMiddleware, getQuery);

//POST ACCOUNT STATUS
router.post(
  "/changeAccountStatus",
  authMiddleware,
  changeAccountStatusController
);

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
