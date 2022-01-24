
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });

    console.log("ADD", users);
    return users
};

const removeUser = (socketId) => {
  find = users.findIndex((user) => user.socketId !== socketId);
  users = users.filter((user) => user.socketId !== socketId);
  console.log("socketID", socketId, users);

  return users
};

const getUsers = () => {
  return users
}

module.exports = {addUser, removeUser, getUsers}