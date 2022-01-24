
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });

    console.log("ADD", users);
    return users
};

const removeUser = (socketId) => {
  console.log("USERS", users);
  console.log("socketId", socketId);
  find = users.find((user) => user.socketId == socketId);
  users = users.filter((user) => user.socketId !== socketId);

  console.log("all users", users);
  console.log("remove", find);

  return find
};

const getUsers = () => {
  return users
}

module.exports = {addUser, removeUser, getUsers}