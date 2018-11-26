const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { Menu } = require('../models');

router.get('/', asyncHandler(async function(request, response) {

}));

router.post('/', asyncHandler(async function(request, response) {
  const menu = await Menu.create({
    ...request.body
  });
  response.json({ data: menu });
}));

module.exports = router;

