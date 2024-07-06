import { conversationModel } from "../databases/models/conversation.model.js";
import * as chatUpdates from "./updates/chat.js";

const directChatHistoryHandler = async (socket, data) => {
  try {
    const { userId } = socket.user;
    const { receiverUserId } = data;

    const conversation = await conversationModel.findOne({
      participants: { $all: [userId, receiverUserId] },
    });
    
    if (conversation) {
      chatUpdates.updateChatHistory(conversation._id, socket.id);
    }
  } catch (error) {
    console.log(error);
  }
};

export default directChatHistoryHandler;
