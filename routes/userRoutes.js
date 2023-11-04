const express = require('express')
const { loginController, registerController, authController, applyDoctorController, getAllNotificationController, deleteAllNotificationController, } = require('../controllers/userCtrl');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router()

//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

//auth
router.post("/getUserData", authMiddleware, authController);

//apply doctor
router.post("/apply-doctor", authMiddleware, applyDoctorController);

//notification
router.post(
    "/get-all-notification",
    authMiddleware,
    getAllNotificationController
);

router.post(
    "/delete-all-notification",
    authMiddleware,
    deleteAllNotificationController
);
module.exports = router;