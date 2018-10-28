'use strict';
module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define('Shop',
    {
      name: DataTypes.STRING
    }
  );

  Shop.associate = function({ Menu, Shop, Table }) {
    Shop.hasMany(Menu);
    Shop.hasMany(Table);
  };

  return Shop;
};
