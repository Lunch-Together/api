const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const { Users } = require('../models');

router.post('/', asyncHandler(async function(request, response) {

}));

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
