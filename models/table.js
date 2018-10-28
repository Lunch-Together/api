'use strict';
module.exports = (sequelize, DataTypes) => {
  const Table = sequelize.define('Table',
    {
      number: DataTypes.INTEGER.UNSIGNED
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
