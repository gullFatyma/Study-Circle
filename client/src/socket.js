import { io } from "socket.io-client";

/*
  Ek shared socket poori application mein use hoga.

  autoConnect false hai, kyunki socket ko user login
  hone ke baad token ke saath connect karna hai.
*/
const socket = io("http://localhost:5000", {
  autoConnect: false,
});

export const connectSocket = () => {
  const storedUser = localStorage.getItem(
    "studycircle_user"
  );

  if (!storedUser) {
    return;
  }

  const user = JSON.parse(storedUser);

  if (!user.token) {
    return;
  }

  socket.auth = {
    token: user.token,
  };

  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;