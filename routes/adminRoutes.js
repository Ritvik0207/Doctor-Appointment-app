const express = require("express");
const {
    getAllUsersController,
    getAllDoctorsController,
    changeAccountStatusController,
} = require("../controllers/adminCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//GET METHOD || USERS
router.get("/getAllUsers", authMiddleware, getAllUsersController);

//GET METHOD || DOCTORS
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

//Post Account Status
router.post("/changeAccountStatus", authMiddleware, changeAccountStatusController)
module.exports = router;

// const express = require('express');
// const authMiddleware = require('../middlewares/authMiddleware');
// const { getAllDoctorsController, getAllUsersController } = require('../controllers/adminCtrl');

// const router = express.Router()

// router.get('/getAllUsers', authMiddleware, getAllUsersController);
// router.get('/getAllDoctors', authMiddleware, getAllDoctorsController);

// module.exports = router;