'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');
const socket = require('../helpers/socketio');

const { Sequelize, Group, GroupMember, Table, User, Order, Menu, GroupPurchase } = require('../models');
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
      Table,
      Order,
      GroupPurchase
    ]
  });
  if (!group) throw createError(403, '존재하지 않는 그룹입니다');

  response.json({ data: group })
}));

/**
 * 그룹 정보를 변경할 수 있는 API
 *
 * 결제 방식과, 결제 상태로 변경등을 할 수 있다.
 * 그룹 리더 혹은 관리자만 해당 API에 접근할 수 있다
 */
router.put('/:id', asyncHandler(async function(request, response) {
  if (!request.user) throw createError(401, '해당 리소스에 접근할 수 없습니다');

  // 해당요청을 한 유저의 권한 확인
  const groupMember = await GroupMember.findOne({
    where: {
      GroupId: request.params.id,
      UserId: request.user.id
    }
  });

  // 리더가 아니면 해당 그룹정보를 수정할 수 없습니다
  // TODO 관리자도 수정 가능하도록 변경
  if (groupMember.role !== 'leader') throw createError(401, '일반 그룹 멤버는 수정할 권한이 없습니다');

  const group = await Group.findOne({
    where: {
      id: request.params.id,
      states: { [Op.notIn]: ['archived'] }
    }
  });

  // 그룹 정보가 없을떄
  if (!group) throw createError(403, '존재하지 않는 그룹입니다 입니다');

  // 업데이트할 데이터에 상태 정보가 있을때
  if (request.body.states) {

    // 상태 정보 업데이트
    group.states = request.body.states;
    await group.save();

    // 업데이트된 상태 정보를 Socket에 보내준다
    socket.toGroup(group.id, 'update-group-states', group.states);
  } else if (request.body.paymentType) {// 업데이트할 데이터에 결제 타입이 있을때

    // 결제 방법 업데이트
    group.paymentType = request.body.paymentType;
    await group.save();

    // 업데이트된 상태 정보를 Socket에 보내준다
    socket.toGroup(group.id, 'update-group-paymentType', group.paymentType)
  }

  response.json({ data: group });
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
    include: [Menu, { model: User, attributes: { exclude: ['password'] } }]
  });
  response.json({ data: orders });
}));

/**
 * 그룹 결제 요청
 */
router.post('/:id/purchase', asyncHandler(async function(request, response) {

  // 로그인 필수
  if (!request.user) throw createError(401);

  // 그룹 정보 확인
  const group = await Group.findOne({
    where: {
      id: request.params.id,
      states: 'payment-in-progress'
    },
    include: [GroupMember]
  });
  if (!group) throw createError(403, '결제를 요청할 수 업는 상태입니다');

  // 그룹 멤버 여부 확인
  const isGroupMember = await GroupMember.findOne({
    where: {
      GroupId: request.params.id,
      UserId: request.user.id
    }
  });
  if (!isGroupMember) throw createError(403, '해당 그룹에서 결제를 할 권한이 없습니다');

  let purchasePrice = 0;

  // 그룹의 결제 방법에 따라 해당 유저의 결제 금액을 결정한다
  if (group.paymentType === 'dutch') {

    // 각자가 먹은 음식 계산을 위해 해당 유저가 먹은 음식 주문 데이터를 가져온다
    const orders = await Order.findAll({
      where: { GroupId: group.id, UserId: request.user.id },
      include: [Menu]
    });
    purchasePrice = orders.map(order => order.Menu.price)
      .reduce((pV, cV) => pV + cV, 0);

  } else if (group.paymentType === 'split') {

    // 모든 금액 / 사람 수
    const orders = await Order.findAll({
      where: { GroupId: group.id },
      include: [Menu]
    });

    // 해당 그룹에서 먹은 총 금액
    const totalPrice = orders.map(order => order.Menu.price)
      .reduce((pV, cV) => pV + cV, 0);
    const groupMembers = group.GroupMembers.length;

    // 1단위 절삭
    purchasePrice = parseInt(totalPrice / groupMembers / 10) * 10
  } else {
    throw createError(403, '옳바르지 않은 결제 방법 입니다')
  }

  // TODO 지금은 결제 요청시 바로 결제 성공한 멤버로 만들어버린다, (결제 과정이 없기 떄문)

  // 만약 해당 유저가 이미 결제가 되어있다면 더이상 결제 데이터를 추가하지 못하게 한다
  let groupPurchase = await GroupPurchase.findOne({
    where: {
      GroupId: group.id,
      UserId: request.user.id
    }
  });

  if (groupPurchase) {
    groupPurchase.states = groupPurchase.states === 'purchased' ? 'before-purchased' : 'purchased';
  } else {
    groupPurchase = GroupPurchase.build({
      price: purchasePrice,
      states: 'purchased',
      GroupId: group.id,
      UserId: request.user.id
    });
  }
  await groupPurchase.save();

  // 결제 상태 업데이트를 그룹에 알린다
  socket.toGroup(group.id, 'update-group-purchase', groupPurchase);

  // TODO 모든 멤버가 결제 했을 경우 완료 되었다는 소켓 요청을 보내준다 임시
  const purchases = await GroupPurchase.findAll({
    where: { GroupId: group.id, states: 'purchased' }
  });
  if (purchases.length === group.GroupMembers.length) {
    socket.toGroup(group.id, 'update-group-states', 'archived');
    group.states = 'archived';
    await group.save();
  }


  response.json({ data: groupPurchase });
}));


module.exports = router;
