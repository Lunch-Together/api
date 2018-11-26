'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const { MenuCategory: MenuCategories } = require('../models');

router.get('/', asyncHandler(async function(request, response) {
  const menuCategories = await MenuCategories.findAll({});
  response.json({ data: menuCategories });
}));

router.post('/', asyncHandler(async function(request, response) {
  const menuCategory = await MenuCategories.create({
    ...request.body
  });
  response.json({ data: menuCategory });
}));

module.exports = router;
