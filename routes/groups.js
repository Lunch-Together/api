'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');
const socket = require('../helpers/socketio');

const { Sequelize, Group, GroupMember, Table, User, Order, Menu } = require('../models');
const { Op } = Sequelize;

router.get('/', asyncHandler(async function(request, response) {
  const where = request.query.q ? { ...JSON.parse(request.query.q) } : {};
  const groups = await Group.findAll({
    where,
    include: [GroupMember, Table]
  });
  response.json({ data: groups });
}));

router.post('/', asyncHandler(async function(request, response) {

  // Table ID 가 없습니다
  if (!request.body.TableId) throw createError(412, '테이블 번호가 없습니다');

  // 이미 진행중인 그룹이 있는지 확인 후 있으면 에러
  const hasOngoingGroup = await Group.findOne({
    where: {
      TableId: request.body.TableId,
      states: {
        [Op.notIn]: ['archived']
      }
    }
  });
  if (hasOngoingGroup) throw createError(403, '이미 진행중인 테이블이 있습니다');

  // 그룹 생성
  const group = await Group.create({
    ...request.body,
    states: 'ongoing'
  }, { fields: ['TableId'] });
  response.json({ data: group });
}));

/**
 * 매점 -> 테이블 정보에 해당하는
 * 그룹에 참여 할 수 있다
 */
router.post('/:id/join', asyncHandler(async function(request, response) {

  // 그룹 정보
  const group = await Group.findOne({ where: { id: request.params.id } });
  if (!group) throw createError(403, '존재하지 않는 그룹입니다');

  // 리더가 있는지 확인
  const groupLeader = await GroupMember.findOne({
    where: {
      GroupId: group.id,
      role: 'leader'
    }
  });
  const hasGroupLeader = groupLeader != null;

  // 이미 그룹 멤버인지 확인
  const isGroupMember = await GroupMember.findOne({
    where: {
      GroupId: request.params.id,
      UserId: request.user.id
    }
  });
  if (isGroupMember) throw createError(403, '이미 그룹에 가입되어 있습니다');

  // 내가 이미 그룹에 속해 있는지 확인 후 없을때 그룹에 조인
  const role = hasGroupLeader ? 'member' : 'leader';
  const groupMember = await GroupMember.create({
    GroupId: request.params.id,
    UserId: request.user.id,
    role
  });

  const member = await GroupMember.findOne({
    where: {
      GroupId: request.params.id,
      UserId: request.user.id,
    },
    include: [{ model: User, attributes: { exclude: ['password'] } }]
  });

  // 새로운 멤버가 조인 되었을때 Socket 방에 데이터를 보내준다
  socket.toGroup(group.id, 'new-group-member', member);

  response.json({ data: groupMember });
}));

/**
 * 그룹 상세 정보
 */
router.get('/:id', asyncHandler(async function(request, response) {
  const group = await Group.findOne({
    where: { id: request.params.id },
    include: [
      {
        model: GroupMember,
        include: [
          {
            attributes: {
              exclude: ['password']
            },
            model: User
          }
        ]
      },
      Table
    ]
  });
  if (!group) throw createError(403, '존재하지 않는 그룹입니다');

  response.json({ data: group })
}));

/**
 * 그룹 메뉴 주문
 */
router.post('/:id/orders', asyncHandler(async function(request, response) {

  // 그룹 정보 확인
  const group = await Group.findOne({
    where: {
      id: request.params.id,
      states: 'ongoing'
    }
  });
  if (!group) throw createError(403, '주문을 넣을 수 없습니다');

  // 그룹 멤버 여부 확인
  const isGroupMember = await GroupMember.findOne({
    where: {
      GroupId: request.params.id,
      UserId: request.user.id
    }
  });
  if (!isGroupMember) throw createError(403, '해당 그룹에 주문을 넣을 권한이 없습니다');

  // 추가된 주문 정보
  const postOrders = await Order.bulkCreate(request.body.map(item => Object.assign({}, item, {
    UserId: request.user.id,
    GroupId: group.id
  })));

  // 주문 정보
  const orders = await Order.findAll({
    where: { id: postOrders.map(postOrder => postOrder.id) },
    include: [Menu]
  });

  // 새로운 주문 정보를 넘겨준다
  orders.forEach(order => socket.toGroup(group.id, 'new-order', order));

  response.json({ data: orders });
}));

/**
 * 그룹 메뉴 주문 리스트
 */
router.get('/:id/orders', asyncHandler(async function(request, response) {
  const orders = await Order.findAll({
    where: {
      GroupId: request.params.id
    },
    include: [Menu]
  });
  response.json({ data: orders });
}));

module.exports = router;
