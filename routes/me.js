'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const { User } = require('../models');

router.get('/', asyncHandler(async function(request, response) {

  const user = await User.findOne(
    {
      attributes: {
        exclude: ['password']
      },
      where: request.user.id
    }
  );

  response.json({ data: user });
}));

module.exports = router;
