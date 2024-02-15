
import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import { Row, Input } from "antd";
import DoctorList from "../components/DoctorList";

const HomePage = () => {
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const getUserData = async () => {
        try {
            const res = await axios.get("/api/v1/user/getAllDoctors", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            if (res.data.success) {
                setDoctors(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    const filterDoctorsBySpecialization = () => {
        return doctors.filter((doctor) =>
            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return (
        <Layout>
            <h1 className="text-center">Home Page</h1>
            <div className="searchbar">
                <Input
                    placeholder="Search by specialization"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 250, marginLeft: 10, marginBottom: 10, height: 40 }}
                />
            </div>
            <Row>
                {filterDoctorsBySpecialization().map((doctor) => (
                    <DoctorList key={doctor.id} doctor={doctor} />
                ))}
            </Row>
        </Layout>
    );
};

export default HomePage;
