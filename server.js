require('dotenv').config();
const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const socket_io = require('socket.io')(httpServer, {
  cors: {
    origin: process.env.END_POINT_CLIENT,
  },
});
const Filter = require('bad-words');
const {
  renderMessages,
  changeStatusOnline,
  changeStatusOffline,
} = require('./utils/createMessages');
const { createUser, removeUserList } = require('./utils/createUsers');
const { SOCKET_COMMIT, TEXT_BAD } = require('./common/common.constants');

socket_io.on(SOCKET_COMMIT.CONNECT, socket => {
  socket.on(SOCKET_COMMIT.JOIN_ROOM, infoUser => {
    const listUser = createUser(socket, infoUser);
    const isUser = listUser.find(({ _id }) => _id === infoUser._id);
    /** send notify */
    socket.emit(SOCKET_COMMIT.SEND_MESSAGE_NOTIFY, `Hello ${isUser.fullName}`);
    socket.broadcast.emit(
      SOCKET_COMMIT.CHANGE_STATUS_ONLINE,
      changeStatusOnline(isUser),
    );
    socket.broadcast.emit(
      SOCKET_COMMIT.SEND_MESSAGE_NOTIFY,
      `${isUser.fullName} Online`,
    );
    /** send messages */
    socket.on(SOCKET_COMMIT.SEND_MESSAGE, (dataMessages, callBackAcknow) => {
      const filter = new Filter();
      filter.addWords(...TEXT_BAD);
      if (filter.isProfane(dataMessages.text)) {
        return callBackAcknow(SOCKET_COMMIT.MESSAGE_NOT_AVALID);
      }
      socket_io.emit(
        SOCKET_COMMIT.SEND_LIST_MESSAGE,
        renderMessages(dataMessages),
      );
      socket.broadcast.emit(
        SOCKET_COMMIT.SEND_MESSAGE_SENDER,
        `${isUser.fullName} nhắn tin`,
      );
      callBackAcknow();
    });
    /** disconnect */
    socket.on(SOCKET_COMMIT.DISCONNECTED, () => {
      socket.broadcast.emit(
        SOCKET_COMMIT.CHANGE_STATUS_OFFLINE,
        changeStatusOffline(isUser),
      );
      socket.broadcast.emit(
        SOCKET_COMMIT.SEND_MESSAGE_NOTIFY,
        `${isUser.fullName} offline`,
      );
      delete socket.id;
      return removeUserList(socket.id);
    });
  });
});

const port = process.env.PORT || 5001;
httpServer.listen(port, () => {
  console.log(`Socket on port : ${port}`);
});
