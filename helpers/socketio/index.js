const socket = require('socket.io');

class Socket {

  /**
   * Socket 생성하고 listener 등록
   * @param server
   * @returns {*}
   */
  create(server) {
    this.io = socket(server);
    this.io.on('connection', socket => {
      this._registerSocketListeners(socket);
    });

    return this.getIO();
  }

  getIO() {
    return this.io;
  }

  toGroup(groupId, event, data) {
    this.io.to(`/groups/${groupId}`).emit(event, { data })
  }

  _registerSocketListeners(socket) {
    socket.on('join-group', async ({ token, groupId }) => {
      const room = `/groups/${groupId}`;
      socket.join(room);
      socket.emit('join-group-result', { data: { message: room } });

      this.io.to(room).emit('connect-member', { token });
    });
  }
}

module.exports = new Socket();
