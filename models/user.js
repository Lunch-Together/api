'use strict';
const bCrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User',
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: false
      },
      avatarUrl: DataTypes.STRING,
      provider: {
        type: DataTypes.ENUM('local', 'kakao', 'facebook', 'google'),
        allowNull: false,
        defaultValue: 'local'
      }
    }
  );

  User.associate = function({ User }) {
  };

  // 유저 생성시 비밀번호 해시
  User.beforeCreate((user, options) => new Promise((resolve, reject) => {
      if (user.provider !== 'local') return resolve(user);

      bCrypt.hash(user.password, 10)
        .then(hashedPassword => {
          user.password = hashedPassword;
          resolve(user);
        })
        .catch(error => reject(error))
    }
  ));

  // 유저 비밀번호 검증
  User.prototype.verifyPassword = async function(password) {
    return await bCrypt.compare(password, this.password)
  };

  return User;
};
