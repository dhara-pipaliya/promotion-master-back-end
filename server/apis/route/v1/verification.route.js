const express = require('express');
var routes = express.Router();

// controller
const Verify = require('../../controller/verification.controller');

routes.get('/', Verify.verify);

module.exports = routes;