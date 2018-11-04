'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const { Shop } = require('../models');

router.get('/', asyncHandler(async function(request, response) {
  const shops = await Shop.findAll();
  response.json({ data: shops });
}));

router.get('/:id', asyncHandler(async function(request, response) {
  const shop = await Shop.findOne({ where: { id: request.params.id } });

  if (!shop) throw Error('존재하지 않는 상점입니다.');

  response.json({ data: shop });
}));

module.exports = router;
