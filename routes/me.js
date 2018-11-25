'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

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
  response.json({ data: group });
}));

module.exports = router;
