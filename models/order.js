'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order',
    {}
  );

  Order.associate = function({}) {

  };

  return Order;
};
