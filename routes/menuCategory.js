'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const { MenuCategory } = require('../models');

router.get('/', asyncHandler(async function(request, response) {
  const menuCategories = await MenuCategory.findAll({});
  response.json({ data: menuCategories });
}));

router.post('/', asyncHandler(async function(request, response) {
  const menuCategory = await MenuCategory.create({
    ...request.body
  });
  response.json({ data: menuCategory });
}));

module.exports = router;
