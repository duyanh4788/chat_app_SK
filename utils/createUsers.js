let userLists = [];

const getUserList = uid => {};

const removeUserList = id =>
  (userLists = userLists.filter(item => item.id !== id));

module.exports = {
  getUserList,
  removeUserList,
};
