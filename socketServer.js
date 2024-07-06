import { verifyTokenSocket } from "./src/middleware/authSocket.js";
import { newConnectionHandler } from "./socketHandlers/newConnectionHandler.js";
import { disconnectHandler } from "./socketHandlers/disconnectHandler.js";
import directMessageHandler from "./socketHandlers/directMessageHandler.js";
import directChatHistoryHandler from "./socketHandlers/directChatHistoryHandler.js";
import roomCreateHandler from "./socketHandlers/roomCreateHandler.js";
import roomJoinHandler from "./socketHandlers/roomJoinHandler.js";
import roomLeaveHandler from "./socketHandlers/roomLeaveHandler.js";
import roomInitializeConnectionHandler from "./socketHandlers/roomInitializeConnectionHandler.js";
import roomSignalingDataHandler from "./socketHandlers/roomSignalingDataHandler.js";

import * as serverStore from "./serverStore.js";
import { Server } from "socket.io";

const registerSocketServer = (server) => {
  const io = new Server(server, {
    cors: "*",
  });

  serverStore.setSocketServerInstance(io);

  io.use((socket, next) => {
    verifyTokenSocket(socket, next);
  });

  const emitOnlineUsers = () => {
    const onlineUsers = serverStore.getOnlineUsers();
    io.emit("online-users", { onlineUsers });
    // console.log("socketServer.js 27 : ",onlineUsers)
    // console.log(onlineUsers.length)
  };

  io.on("connection", (socket) => {
    newConnectionHandler(socket, io);
    emitOnlineUsers();

    socket.on("direct-message", (data) => {
      directMessageHandler(socket, data);
    });

    socket.on("direct-chat-history", (data) => {
      directChatHistoryHandler(socket, data);
    });

    socket.on("room-create", () => {
      roomCreateHandler(socket);
    });

    socket.on("room-join", (data) => {
      roomJoinHandler(socket, data);
    });

    socket.on("room-leave", (data) => {
      roomLeaveHandler(socket, data);
    });

    socket.on("conn-init", (data) => {
      roomInitializeConnectionHandler(socket, data);
    });

    socket.on("conn-signal", (data) => {
      roomSignalingDataHandler(socket, data);
    });

    socket.on("logout", () => {
      disconnectHandler(socket);
    });

    socket.on("disconnect", () => {
      disconnectHandler(socket);
    });
  });

  setInterval(() => {
    emitOnlineUsers();
  }, [1000 * 8]);
};

export { registerSocketServer };
