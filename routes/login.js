'use strict';
const express = require('express');
const router = express.Router();
const { AccessToken, User } = require('../models');

const passport = require('passport');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const config = require('../config');

router.post('/', passport.authenticate(['local', 'local-kakao', 'local-naver', 'local-facebook']), asyncHandler(async function(request, response) {

  // Encode Token
  const token = jwt.sign({ id: request.user.id }, config.jwtSecretKey);

  // Create Access Token
  const accessToken = await AccessToken.create(
    { token, UserId: request.user.id }
  );

  // Bearer
  response.json({
    data: {
      type: 'Bearer',
      token: accessToken.token
    }
  });
}));

module.exports = router;
