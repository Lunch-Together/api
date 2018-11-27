'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order',
    {}
  );

  Order.associate = function({ Menu, User, Group }) {
    Order.belongsTo(Menu, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
    Order.belongsTo(User, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
    Order.belongsTo(Group, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    })
  };

  return Order;
};
