'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const { Group, GroupMember } = require('../models');

router.get('/', asyncHandler(async function(request, response) {
  const groups = await Group.findAll({});
  response.json({ data: groups });
}));

router.post('/', asyncHandler(async function(request, response) {

  // Table ID 가 없습니다
  if (!request.body.TableId) throw new Error('테이블 번호가 없습니다');
  const group = await Group.create({
    ...request.body
  }, { fields: ['TableId'] });
  response.json({ data: group });
}));

/**
 * 매점 -> 테이블 정보에 해당하는
 * 그룹에 참여 할 수 있다
 */
router.post('/:id/join', asyncHandler(async function(request, response) {
  await GroupMember.create();
}));

module.exports = router;
