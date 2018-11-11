'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const QRCode = require('qrcode');

const { Shop, Table } = require('../models');

router.post('/', asyncHandler(async function(request, response) {
  const table = await Table.create({ ...request.body });
  response.json({ data: table })
}));

router.get('/', asyncHandler(async function(request, response) {
  const tables = await Table.findAll({
    include: [Shop]
  });
  response.json({ data: tables })
}));

router.get('/:id/qrcode', asyncHandler(async function(request, response) {
  const buffer = await QRCode.toBuffer(`ltogether://tables/${request.params.id}`);
  response
    .set({
      'Content-Type': 'image/png'
    })
    .send(buffer);
}));

module.exports = router;
