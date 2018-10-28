'use strict';
module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define('Shop',
    {
      name: DataTypes.STRING
    }
  );

  Shop.associate = function({ Menu, Shop, Group }) {
    Shop.hasMany(Menu);
    Shop.hasMany(Group);
  };

  return Shop;
};
