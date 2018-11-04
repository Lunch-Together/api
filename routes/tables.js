'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

router.get('/', asyncHandler(async function(request, response) {
  response.json({ data: [] })
}));

module.exports = router;
