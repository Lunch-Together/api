'use strict';
module.exports = (sequelize, DataTypes) => {
  const Table = sequelize.define('Table',
    {
      number: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      }
    }
  );

  Table.associate = function({ Shop }) {
    Table.belongsTo(Shop, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    })
  };

  return Table;
};
