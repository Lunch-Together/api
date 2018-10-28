'use strict';
module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group',
    {
      number: DataTypes.INTEGER.UNSIGNED
    }
  );

  Group.associate = function({ Shop }) {
    Group.belongsTo(Shop, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    })
  };

  return Group;
};
