const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const doctorModel = require('../models/doctorModel');
const appointmentModel = require('../models/appointmentModel');
const moment = require("moment");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// const registerController = async (req, res) => {
//     try {
//         const exisitingUser = await userModel.findById({ email: req.body.email });
//         if (exisitingUser) {
//             return res
//                 .status(200)
//                 .send({ message: "User Already Exist", success: false });
//         }
//         const password = req.body.password;
//         if (!password) {
//             return res.status(400).send({ message: "Password is required", success: false });
//         }
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
//         req.body.password = hashedPassword;
//         const newUser = new userModel(req.body);
//         await newUser.save();
//         res.status(201).send({ message: "Register Sucessfully", success: true });
//     } catch (error) {
//         console.log(error);
//         console.log("hi i am error")
//         res.status(500).send({
//             success: false,
//             message: `Register Controller ${error.message}`,
//         });
//     }
// };
const registerController = async (req, res) => {
    try {
        const exisitingUser = await userModel.findOne({ email: req.body.email });
        if (exisitingUser) {
            return res
                .status(200)
                .send({ message: "User Already Exist", success: false });
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;
        const newUser = new userModel(req.body);
        await newUser.save();
        res.status(201).send({ message: "Register Sucessfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: `Register Controller ${error.message}`,
        });
    }
};

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
                .send({ message: "Invlid EMail or Password", success: false });
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
        const user = await userModel.findOne({ _id: req.body.userId });
        user.password = undefined;
        if (!user) {
            return res.status(200).send({
                message: "user not found",
                success: false,
            });
        } else {
            res.status(200).send({
                success: true,
                data: user
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

const applyDoctorController = async (req, res) => {
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
                onCLickPath: "/admin/doctors",
            },
        });
        await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
        res.status(201).send({
            success: true,
            message: "Doctor Account Applied Successfully",
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

// const getAllNotificationController = async (req, res) => {
//     try {
//         const user = await userModel.findOne({ _id: req.body.userId });
//         const seennotification = user.seennotification;
//         const notifcation = user.notifcation;
//         seennotification.push(...notifcation);
//         user.notifcation = [];
//         user.seennotification = notifcation;
//         const updatedUser = await user.save();
//         res.status(200).send({
//             success: true,
//             message: "all notification marked as read",
//             data: updatedUser,
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             message: "Error in notification",
//             success: false,
//             error,
//         });
//     }
// };
const getAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId });
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

const getAllDoctorsController = async (req, res) => {
    try {
        const doctors = await doctorModel.find({ status: 'approved' });
        res.status(200).send({
            success: true,
            message: "Doctors lists fetched successfully",
            data: doctors,
        });


    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'error while fetching doctor'
        })
    }
};

//BOOK APPOINTMENT
const bookAppointmnetController = async (req, res) => {
    try {
        const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
        const finaltime = moment(req.body.time, "HH:mm").toISOString();
        const doctorId = req.body.doctorId;

        // Check if the appointment is available
        const appointment = await appointmentModel.findOne({
            doctorId,
            date,
            time: finaltime,
        });

        if (appointment) {
            return res.status(200).send({
                success: false,
                message: "Appointment not available at this time",
            });
        }

        // If appointment is available, proceed with booking
        req.body.date = date;
        req.body.time = finaltime;
        req.body.status = "pending";
        const newAppointment = new appointmentModel(req.body);
        await newAppointment.save();

        // Notify the doctor about the new appointment request
        const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
        user.notifcation.push({
            type: "New-appointment-request",
            message: `A new Appointment Request from ${req.body.userInfo.name}`,
            onClickPath: "/doctor-appointments",
        });
        await user.save();

        // Send success response
        res.status(200).send({
            success: true,
            message: "Appointment booked successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while booking appointment",
        });
    }
};


//booking bookingAvailabilityController
const bookingAvailabilityController = async (req, res) => {
    try {
        const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
        const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString();
        const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
        const doctorId = req.body.doctorId;
        const finaltime = moment(req.body.time, "HH:mm").toISOString();
        const finalTimePlusHalfHour = moment(req.body.time, "HH:mm").add(30, "minutes").toISOString(); // Add half an hour to final time
        const appointments = await appointmentModel.find({
            doctorId,
            date,
            time: {
                $gte: finaltime,
                $lt: finalTimePlusHalfHour, // Use the adjusted time here
            },
        });
        if (appointments.length > 0) {
            return res.status(200).send({
                message: "Appointments not available at this time",
                success: true,
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
            message: "Error in booking",
        });
    }
};

// const bookAppointmentController = async (req, res) => {
//     try {
//         const appointmentTime = new Date(`${req.body.date}T${req.body.time}`);
//         const oneHourLater = new Date(appointmentTime.getTime() + 60 * 60 * 1000);

//         req.body.status = "pending";
//         const newAppointment = new appointmentModel({
//             ...req.body,
//             time: appointmentTime.toISOString(),
//         });
//         await newAppointment.save();

//         const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
//         user.notification.push({
//             type: "New-appointment-request",
//             message: `A new Appointment Request from ${req.body.userInfo.name}`,
//             onClickPath: "/doctor-appointments",
//         });
//         await user.save();

//         res.status(200).send({
//             success: true,
//             message: "Appointment Booked successfully",
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             success: false,
//             error,
//             message: "Error While Booking Appointment",
//         });
//     }
// };
// const bookingAvailabilityController = async (req, res) => {
//     try {
//         const appointmentTime = new Date(`${req.body.date}T${req.body.time}`);
//         const oneHourBefore = new Date(appointmentTime.getTime() - 60 * 60 * 1000);
//         const oneHourLater = new Date(appointmentTime.getTime() + 60 * 60 * 1000);

//         const doctorId = req.body.doctorId;
//         const appointments = await appointmentModel.find({
//             doctorId,
//             date: req.body.date,
//             time: {
//                 $gte: oneHourBefore.toISOString(),
//                 $lte: oneHourLater.toISOString(),
//             },
//         });

//         if (appointments.length > 0) {
//             return res.status(200).send({
//                 message: "Appointments not available at this time",
//                 success: true,
//             });
//         } else {
//             return res.status(200).send({
//                 success: true,
//                 message: "Appointments available",
//             });
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             success: false,
//             error,
//             message: "Error In Booking",
//         });
//     }
// };

const userAppointmentsController = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({
            userId: req.body.userId,
        });
        res.status(200).send({
            success: true,
            message: "Users Appointments Fetch SUccessfully",
            data: appointments,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error In User Appointments",
        });
    }
};
const paymentController = async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
        });

        const options = {
            amount: req.body.amount * 100,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Something Went Wrong!" });
            }
            res.status(200).json({ data: order });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
}

const verifyController = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
}



module.exports = { loginController, registerController, authController, applyDoctorController, getAllNotificationController, deleteAllNotificationController, getAllDoctorsController, bookAppointmnetController, bookingAvailabilityController, userAppointmentsController, paymentController, verifyController };