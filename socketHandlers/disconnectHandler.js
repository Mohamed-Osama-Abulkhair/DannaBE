import * as serverStore from "../serverStore.js";
import roomLeaveHandler from "./roomLeaveHandler.js";

export const disconnectHandler = (socket) => {
  const activeRooms = serverStore.getActiveRooms();
  activeRooms.forEach((activeRoom) => {
    const userInRoom = activeRoom.participants.some(
      (participant) => participant.socketId == socket.id
    );

    if (userInRoom) {
      roomLeaveHandler(socket, { roomId: activeRoom.roomId });
    }
  });

  // console.log("disconnectHandler.js 16 : ", socket.id);
  serverStore.removeConnectedUser(socket.id);
};
