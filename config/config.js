module.exports = {
  development: {
    sequelize: {
      dialect: "sqlite",
      storage: "./db.development.sqlite"
    },
    jwtSecretKey: 'lunch-together'
  },
  production: {
    jwtSecretKey: process.env.JWT_SECRET_KEY
  }
};
