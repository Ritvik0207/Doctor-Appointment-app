import React from "react";
import { useNavigate } from "react-router-dom";

const DoctorList = ({ doctor }) => {
    const navigate = useNavigate();
    return (
        <>
            <div
                className="card m-2"
                style={{
                    cursor: "pointer",
                    border: "1px solid #dcdcdc",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s",
                }}
                onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
            >
                <div
                    className="card-header"
                    style={{
                        backgroundColor: "#2c3e50",
                        color: "#ecf0f1",
                        padding: "12px",
                        borderTopLeftRadius: "8px",
                        borderTopRightRadius: "8px",
                        fontWeight: "bold",
                    }}
                >
                    Dr. {doctor.firstName} {doctor.lastName}
                </div>
                <div className="card-body" style={{ padding: "12px" }}>
                    <p>
                        <b>Specialization:</b> {doctor.specialization}
                    </p>
                    <p>
                        <b>Experience:</b> {doctor.experience}
                    </p>
                    <p>
                        <b>Fees Per Consultation:</b> {doctor.feesPerCunsaltation}
                    </p>
                    <p>
                        <b>Timings:</b> {doctor.timings[0]} - {doctor.timings[1]}
                    </p>
                </div>
            </div>

            {/* <div
                className="card m-2"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
            >
                <div className="card-header">
                    Dr. {doctor.firstName} {doctor.lastName}
                </div>
                <div className="card-body">
                    <p>
                        <b>Specialization</b> {doctor.specialization}
                    </p>
                    <p>
                        <b>Experience</b> {doctor.experience}
                    </p>
                    <p>
                        <b>Fees Per Cunsaltation</b> {doctor.feesPerCunsaltation}
                    </p>
                    <p>
                        <b>Timings</b> {doctor.timings[0]} - {doctor.timings[1]}
                    </p>
                </div>
            </div> */}
        </>
    );
};

export default DoctorList;
