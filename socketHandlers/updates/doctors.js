import { callInvitationModel } from "../../databases/models/callInvitation.model.js";
import { userModel } from "../../databases/models/user.model.js";
import * as serverStore from "../../serverStore.js";

const updateDoctorsPendingInvitations = async (userId) => {
  try {
    const pendingInvitations = await callInvitationModel.find({
      receiver: userId,
    });

    const receiverList = serverStore.getActiveConnections(userId);

    const io = serverStore.getSocketServerInstance();

    receiverList.forEach((receiverSocketId) => {
      io.to(receiverSocketId).emit("doctors-invitations", {
        pendingInvitations: pendingInvitations ? pendingInvitations : [],
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const updateDoctors = async (userId) => {
  try {
    const receiverList = serverStore.getActiveConnections(userId);

    if (receiverList.length === 0) return;

    const user = await userModel.findById(userId);
    if (!user || user.role !== "user") return;

    const doctors = await userModel.find({
      role: "doctor",
      confirmedEmail: true,
    });

    //___________________ logic for confirmed doctors ___________________
    // const doctors = await userModel.find({
    //   role: "doctor",
    //   confirmedEmail: true,
    //   doctorPrice: true,
    //   doctorCertificated: true,
    // });

    // const onlineDoctorIds = new Set(
    //   serverStore.getOnlineUsers().map((doctor) => doctor.userId)
    // );

    // const doctorsListData = doctors.filter((doctor) =>
    //   onlineDoctorIds.has(doctor._id.toString())
    // );

    // const doctorsList = doctorsListData.map((d) => {
    //   const { _id, email, userName, profileImage } = d;
    //   return {
    //     id: _id,
    //     email,
    //     userName,
    //     profileImage: profileImage?.url,
    //   };
    // });
    //____________________________________________________________________________

    const doctorsList = doctors.map((d) => {
      const { _id, email, userName, profileImage } = d;
      return {
        id: _id,
        email,
        userName,
        profileImage: profileImage?.url,
      };
    });

    const io = serverStore.getSocketServerInstance();

    receiverList.forEach((receiverSocketId) => {
      io.to(receiverSocketId).emit("doctors-list", {
        doctors: doctorsList,
      });
    });
  } catch (err) {
    console.error("Error in updateDoctors:", err);
  }
};

export { updateDoctorsPendingInvitations, updateDoctors };
