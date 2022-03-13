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
const { renderMessages, changeStatusUser } = require('./utils/createMessages');
const { SOCKET_COMMIT, TEXT_BAD } = require('./common/common.constants');

socket_io.on(SOCKET_COMMIT.CONNECT, socket => {
  socket.on(SOCKET_COMMIT.JOIN_ROOM, infoUser => {
    /** send notify */
    socket.emit(
      SOCKET_COMMIT.SEND_MESSAGE_NOTIFY,
      `Hello ${infoUser.fullName}`,
    );
    socket.emit(SOCKET_COMMIT.SEND_LIST_USERS, changeStatusUser(infoUser));
    socket.broadcast.emit(
      SOCKET_COMMIT.SEND_MESSAGE_NOTIFY,
      `${infoUser.fullName} Online`,
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
        `${infoUser.fullName} nhắn tin`,
      );
      callBackAcknow();
    });
    /** disconnect */
    socket.on(SOCKET_COMMIT.DISCONNECTED, () => {
      socket.broadcast.emit(
        SOCKET_COMMIT.SEND_MESSAGE_NOTIFY,
        `${infoUser.fullName} offline`,
      );
    });
  });
});

const port = process.env.PORT || 5001;
httpServer.listen(port, () => {
  console.log(`Socket on port : ${port}`);
});