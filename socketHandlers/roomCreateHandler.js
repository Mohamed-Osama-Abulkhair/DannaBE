import * as serverStore from "../serverStore.js";
import * as roomsUpdates from "./updates/roms.js";

const roomCreateHandler = (socket) => {
  const socketId = socket.id;
  const userId = socket.user.userId;

  const roomDetails = serverStore.addNewActiveRoom(userId, socketId);

  socket.emit("room-create", {
    roomDetails,
  });

  roomsUpdates.updateRooms();
};

export default roomCreateHandler;
