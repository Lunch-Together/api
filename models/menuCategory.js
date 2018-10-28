'use strict';
module.exports = (sequelize, DataTypes) => {

  const MenuCategory = sequelize.define('MenuCategory',
    {
      name: DataTypes.STRING

    }
  );

  MenuCategory.associate = function({}) {

  };

  return MenuCategory;
};

