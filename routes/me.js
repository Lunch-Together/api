'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const { User, Group, GroupMember, Sequelize } = require('../models');
const { Op } = Sequelize;

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

router.get('/group', asyncHandler(async function(request, response) {

  const group = await Group.findOne({
    where: {
      states: {
        [Op.notIn]: ['archived']
      }
    },
    include: [
      {
        model: GroupMember,
        where: {
          UserId: request.user.id
        }
      }
    ]
  });

  if (!group) throw createError(404, '현재 속해있는 그룹이 없습니다');

  response.json({ data: group });
}));

module.exports = router;
