const renderMessages = ({ conversationId, senderId, text }) => {
  if (text && text !== null) {
    const data = {
      conversationId,
      senderId,
      text,
    };
    return data;
  }
};

const changeStatusUser = user => {
  const data = {
    account: user.account,
    avatar: user.avatar,
    email: user.email,
    fullName: user.fullName,
    isOnline: true,
    _id: user.id,
  };
  return data;
};

module.exports = {
  renderMessages,
  changeStatusUser,
};
