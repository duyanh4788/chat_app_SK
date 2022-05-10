let listUsers = [];

const createUser = (socket, user) => {
  const findUser = listUsers.find(({ _id }) => _id === user._id);
  if (findUser) return;
  if (!findUser) {
    listUsers.push({ socketId: socket.id, ...user });
  }
  return listUsers;
};

const removeUserList = id => {
  listUsers = listUsers.filter(({ socketId }) => socketId !== id);
  return listUsers;
};

module.exports = {
  createUser,
  removeUserList,
};
