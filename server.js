const express = require('express')
const colors = require('colors')
const moragan = require('morgan')
const dotenv = require('dotenv')
const ConnectDB = require('./config/db')

const app = express()
dotenv.config();
//middlewares
ConnectDB();
app.use(express.json())
app.use(moragan('dev'))

//routes
app.use("/api/v1/user", require("./routes/userRoutes"));
// app.use("api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
//listen port
const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`process running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`.bgCyan.white);
});
