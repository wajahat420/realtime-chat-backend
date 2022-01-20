let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
    return users
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
  return users
};

module.exports = {addUser, removeUser}