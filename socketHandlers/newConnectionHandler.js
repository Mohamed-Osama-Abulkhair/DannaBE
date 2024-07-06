import * as serverStore from "../serverStore.js";
import * as doctorsUpdate from "./updates/doctors.js";
import * as roomsUpdate from "./updates/roms.js";

export const newConnectionHandler = async (socket, io) => {
  const userDetails = socket.user;

  serverStore.addNewConnectedUser({
    socketId: socket.id,
    userId: userDetails.userId,
  });

  doctorsUpdate.updateDoctorsPendingInvitations(userDetails.userId);

  doctorsUpdate.updateDoctors(userDetails.userId);

  setTimeout(() => {
    roomsUpdate.updateRooms(socket.id);
  }, [500]);
};
 