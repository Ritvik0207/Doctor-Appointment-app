import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Select, DatePicker, message, TimePicker } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import "../styles/booking.css";
const { Option } = Select;

const BookingPage = () => {
    const { user } = useSelector((state) => state.user);
    const params = useParams();
    const [doctors, setDoctors] = useState([]);
    const [date, setDate] = useState();
    const [time, setTime] = useState();
    const [isAvailable, setIsAvailable] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [notes, setNotes] = useState("");
    // login user data
    const getUserData = async () => {
        try {
            const res = await axios.post(
                "/api/v1/doctor/getDoctorById",
                { doctorId: params.doctorId },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                }
            );
            if (res.data.success) {
                setDoctors(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };
    // ============ handle availiblity
    const handleAvailability = async () => {
        try {

            if (!date || !time) {
                return alert("Date & Time Required");
            }
            dispatch(showLoading());
            const res = await axios.post(
                "/api/v1/user/booking-availbility",
                { doctorId: params.doctorId, date, time },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            dispatch(hideLoading());
            if (res.data.success) {
                setIsAvailable(true);
                console.log(isAvailable);
                message.success(res.data.message);
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log(error);
        }
    };
    // =============== booking func
    const handleBooking = async () => {
        try {
            //setIsAvailable(true);
            if (!date || !time) {
                return alert("Date & Time Required");
            }
            // console.log(time);
            dispatch(showLoading());
            const res = await axios.post(
                "/api/v1/user/book-appointment",
                {
                    doctorId: params.doctorId,
                    userId: user._id,
                    doctorInfo: doctors,
                    userInfo: user,
                    date: date,
                    time: time,
                    problem: notes,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            dispatch(hideLoading());
            if (res.data.success) {
                message.success(res.data.message);
                navigate("/appointments");
            } else {
                message.success(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log(error);
        }
    };
    const getAvailableTimes = () => {
        const startTime = moment(doctors.timings && doctors.timings[0], "HH:mm");
        const endTime = moment(doctors.timings && doctors.timings[1], "HH:mm");
        const step = 30; // Set your desired time interval (in minutes)
        const times = [];

        let currentTime = startTime;
        while (currentTime.isBefore(endTime)) {
            times.push(currentTime.format("HH:mm"));
            currentTime = currentTime.add(step, "minutes");
        }

        return times;
    };

    const availableTimes = getAvailableTimes();

    //payment
    const initPayment = (data) => {
        const options = {
            key: "rzp_test_0pLj1oTm2LU4c9",
            amount: data.amount,
            currency: data.currency,
            name: doctors.firstName,
            description: "Test Transaction",
            // image: book.img,
            order_id: data.id,
            handler: async (response) => {
                try {
                    const verifyUrl = "/api/v1/user/makepayment";
                    //const { data } = await axios.post(verifyUrl, response);
                    const { data } = await axios.post(
                        "/api/v1/user/verifypayment",
                        { response },
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                    console.log(data);
                } catch (error) {
                    console.log(error);
                }
            },
            theme: {
                color: "#3399cc",
            },
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
        handleBooking();
    };

    const handlePayment = async () => {
        try {
            if (!date && !time) {
                return alert("Date & Time Required");
            }
            const orderUrl = "/api/v1/user/makepayment";
            // const { data } = await axios.post(orderUrl, { amount: doctors.feesPerCunsaltation });
            const { data } = await axios.post(
                "/api/v1/user/makepayment",
                { amount: doctors.feesPerCunsaltation },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            console.log(data);
            initPayment(data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getUserData();
        //eslint-disable-next-line
    }, []);
    return (
        <Layout>

            <h3>Booking Page</h3>
            <div className="container m-2">
                {doctors && (
                    <div>
                        <h4>
                            Dr.{doctors.firstName} {doctors.lastName}
                        </h4>
                        <h4>Fees : {doctors.feesPerCunsaltation}</h4>
                        <h4>
                            Timings : {doctors.timings && doctors.timings[0]} -{" "}
                            {doctors.timings && doctors.timings[1]}{" "}
                        </h4>
                        <div className="d-flex flex-column w-50">
                            <DatePicker
                                aria-required={"true"}
                                className="m-2"
                                format="DD-MM-YYYY"
                                onChange={(values) => {
                                    setIsAvailable(false);
                                    setDate(values.format("DD-MM-YYYY"));
                                    // setDate(moment(values).format("DD-MM-YYYY"));
                                }}
                            />
                            {/* <TimePicker
                                aria-required={"true"}
                                format="HH:mm"
                                className="mt-3"
                                onChange={(values) => {
                                    setIsAvailable(false);
                                    setTime(values.format("HH:mm"));
                                    // setTime(moment(values).format("HH:mm"));
                                }}
                            /> */}
                            <Select
                                aria-required="true"
                                className="mt-3"
                                placeholder="Select Time"
                                onChange={(value) => {
                                    setIsAvailable(false);
                                    setTime(value);
                                }}
                            >
                                {availableTimes.map((time) => (
                                    <Option key={time} value={time}>
                                        {time}
                                    </Option>
                                ))}
                            </Select>
                            <textarea
                                aria-required="true"
                                className="mt-3"
                                placeholder="Describe your problems  (Optional)"
                                maxLength={100}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{
                                    height: "auto",
                                    backgroundColor: "white",
                                    border: "1px solid #d9d9d9",
                                    borderRadius: "8px",
                                    padding: "6px 8px",
                                    color: "inherit",

                                }}
                            />
                            <button
                                className="btn btn-primary mt-2"
                                onClick={handleAvailability}
                            >
                                Check Availability
                            </button>

                            <button className="btn btn-dark mt-2" onClick={handleBooking}>
                                Book Now pay later
                            </button>
                            <button className="btn btn-dark mt-2" onClick={handlePayment}>
                                Book Now and pay
                            </button>

                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BookingPage;