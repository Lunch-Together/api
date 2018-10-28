'use strict';
module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.INTEGER.UNSIGNED
  });

  Menu.associate = function({ Menu, MenuCategory, Shop }) {
    Menu.belongsTo(Shop, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });

    Menu.belongsTo(MenuCategory, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    })
  };

  return Menu;
};
