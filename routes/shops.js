'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const { Shop, Table, Menu, MenuCategory } = require('../models');

router.post('/', asyncHandler(async function(request, response) {
  // TODO 관리자 권한의 유저만 요청할 수 있는 API

  // 매장 정보 생성
  const shop = await Shop.create({
    ...request.body
  });
  response.json({ data: shop });
}));

router.get('/', asyncHandler(async function(request, response) {
  const shops = await Shop.findAll({
    include: [
      {
        attributes: ['id', 'number'],
        model: Table
      }
    ]
  });
  response.json({ data: shops });
}));

router.get('/:id', asyncHandler(async function(request, response) {
  const shop = await Shop.findOne({ where: { id: request.params.id } });

  if (!shop) throw Error('존재하지 않는 상점입니다.');

  response.json({ data: shop });
}));

/**
 * 매장 메뉴 정보 리스트
 */
router.get('/:id/menus', asyncHandler(async function(request, response) {
  const menus = await MenuCategory.findAll({
    include: [
      {
        model: Menu,
        where: {
          ShopId: request.params.id
        }
      }
    ]
  });
  response.json({ data: menus });
}));

module.exports = router;
