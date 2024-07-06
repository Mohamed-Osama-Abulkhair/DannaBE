import { roomModel } from "../../../databases/models/room.model.js";
import { userModel } from "../../../databases/models/user.model.js";

export const roomHandler = (socket) => {
  socket.on(
    "create-room",
    async ({ userId, roomName, newMeetType, newMeetDate, newMeetTime }) => {
      const newRoom = new roomModel({
        roomName,
        host: userId,
        meetType: newMeetType,
        meetDate: newMeetDate,
        meetTime: newMeetTime,
        participants: [],
        currentParticipants: [],
      });
      const room = await newRoom.save();
      await socket.emit("room-created", {
        roomId: room._id,
        meetType: newMeetType,
      });
    }
  );

  socket.on("user-code-join", async ({ roomId }) => {
    const room = await roomModel.findById(roomId);
    room && (await socket.emit("room-exists", { roomId }));
    !room && socket.emit("room-not-exist", { roomId });
  });

  socket.on("request-to-join-room", async ({ roomId, userId }) => {
    const room = await roomModel.findById(roomId);
    if (userId === room.host) {
      socket.emit("join-room", { roomId, userId });
    } else {
      socket.emit("request-hosting", { userId });
      socket.broadcast.to(roomId).emit("user-requested-to-join", {
        participantId: userId,
        hostId: room.host,
      });
    }
  });

  socket.on("join-room", async ({ roomId, userId }) => {
    await roomModel.findByIdAndUpdate(roomId, {
      $addToSet: { participants: userId },
    });

    await roomModel.findByIdAndUpdate(roomId, {
      $addToSet: { currentParticipants: userId },
    });

    await socket.join(roomId);
    console.log(`user: ${userId} joined room : ${roomId}`);
    await socket.broadcast.to(roomId).emit("user-joined", { userId });
  });

  socket.on("get-participants", async ({ roomId }) => {
    const room = await roomModel.findById(roomId);
    const roomName = room.roomName;
    const participants = room.currentParticipants;
    const usernames = {};

    const users = await userModel
      .find({ _id: { $in: participants } }, { _id: 1, username: 1 })
      .exec();

    users.forEach((user) => {
      const { _id, username } = user;
      usernames[_id.valueOf().toString()] = username;
    });

    socket.emit("participants-list", { usernames, roomName });
  });

  socket.on("fetch-my-meets", async ({ userId }) => {
    const meets = await roomModel.find(
      { host: userId },
      { _id: 1, roomName: 1, meetType: 1, meetDate: 1, meetTime: 1 }
    );
    await socket.emit("meets-fetched", { myMeets: meets });
  });

  socket.on("delete-meet", async ({ roomId }) => {
    await roomModel.findByIdAndDelete(roomId);
    socket.emit("room-deleted");
  });

  socket.on(
    "update-meet-details",
    async ({ roomId, roomName, newMeetDate, newMeetTime }) => {
      await roomModel.findByIdAndUpdate(roomId, {
        $set: { roomName, newMeetDate, newMeetTime },
      });
      socket.emit("meet-details-updated");
    }
  );

  socket.on("user-left-room", async ({ userId, roomId }) => {
    await roomModel.findByIdAndUpdate(roomId, {
      $pull: { currentParticipants: userId },
    });
    await socket.leave(roomId);
  });

  socket.on("update-disconnected", async ({ userId, roomId }) => {
    console.log(`user : ${userId} left room ${roomId}`);
  });
};
