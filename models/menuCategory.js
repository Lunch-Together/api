'use strict';
module.exports = (sequelize, DataTypes) => {

  const MenuCategory = sequelize.define('MenuCategory',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }

    }
  );

  MenuCategory.associate = function({}) {

  };

  return MenuCategory;
};

