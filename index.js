"use strict";
require('dotenv').config();
const express = require('express');
require("./database");
const cors = require('cors');
const path = require('path');
const app = express();

//CORS Middleware
app.use(cors({
    origin: ['http://localhost:3000']
}));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

const imagesRoot = path.join(__dirname, '..', 'uploads');
// app.use(processImage({ root: imagesRoot }));
app.use('/uploads', express.static(imagesRoot));

app.use('/uploads', express.static(process.cwd() + '/uploads'));

// check for admin exits or not && if not exists create one
require("./admin")

app.use((req, res, next) => {
    // console.log("req",req)
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

function setupRoutes() {
    const routes = require("./routes");
    routes.setup(app);
}

setupRoutes();

// when a random route is inputed
app.get('*', async (req, res) => {
    res.status(200).send({
        message: 'Welcome to this API.',
    })
});


var port = process.env.PORT || 5000
app.listen(port, () => {
    console.log("Server running on port", port);
});


module.exports = app;


