const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const { User } = require('../models');

router.post('/', asyncHandler(async function(request, response) {

  // 값 확인
  if (!request.body.username) throw createError('이메일을 적어주세요', 400);
  if (!request.body.password) throw createError('비밀번호를 적어주세요', 400);
  if (!request.body.nickname) throw createError('닉네임을 적어주세요', 400);

  // 이메일 형식 확인
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const isEmail = emailRegex.test(String(request.body.username).toLowerCase());
  if (isEmail === false) throw createError('옳바르지 않은 이메일 형식입니다', 400);

  // 중복 계정 확인
  const isDuplicateEmail = await User.findOne({ where: { username: request.body.username } });
  if (isDuplicateEmail) throw createError('중복된 이메일입니다', 403);

  // 회원 생성 및 저장
  const user = new User(request.body);
  await user.save();

  response.status(200).json({ data: user });
}));

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
