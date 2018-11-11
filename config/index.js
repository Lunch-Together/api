const env = process.env.NODE_ENV || 'development';

const config = require('./config');

if (config[env] == null) {
  module.exports = config['development']
} else {
  module.exports = config[env];
}
