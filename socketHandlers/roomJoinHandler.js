import * as serverStore from "../serverStore.js";
import * as roomsUpdates from "./updates/roms.js";

const roomJoinHandler = (socket, data) => {
  const { roomId } = data;

  const participantDetails = {
    userId: socket.user.userId,
    socketId: socket.id,
  };

  const roomDetails = serverStore.getActiveRoom(roomId);
  serverStore.joinActiveRoom(roomId, participantDetails);

  // send information to users in room that they should prepare for incoming connection
  roomDetails.participants.forEach((participant) => {
    if (participant.socketId != participantDetails.socketId) {
      socket.to(participant.socketId).emit("conn-prepare", {
        connUserSocketId: participantDetails.socketId,
      });
    }
  });

  roomsUpdates.updateRooms();
};

export default roomJoinHandler;
