'use strict';
module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define('Shop',
    {
      name: DataTypes.STRING
    }
  );

  Shop.associate = function({ Menu, Shop }) {
    Shop.hasMany(Menu)
  };

  return Shop;
};
