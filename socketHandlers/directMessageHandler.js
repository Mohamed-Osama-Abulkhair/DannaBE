import { conversationModel } from "../databases/models/conversation.model.js";
import { messageModel } from "../databases/models/message.model.js";
import * as chatUpdates from "./updates/chat.js";

const directMessageHandler = async (socket, data) => {
  try {
    const { userId } = socket.user;
    const { receiverUserId, content } = data;

    const message = await messageModel.create({
      content,
      author: userId,
      date: new Date(),
      type: "DIRECT",
    });

    const conversation = await conversationModel.findOne({
      participants: { $all: [userId, receiverUserId] },
    });

    if (conversation) {
      conversation.messages.push(message._id);
      await conversation.save();

      chatUpdates.updateChatHistory(conversation._id);
    } else {
      const newConversation = await conversationModel.create({
        messages: [message._id],
        participants: [userId, receiverUserId],
      });

      chatUpdates.updateChatHistory(newConversation._id);
    }
  } catch (error) {
    console.log(error);
  }
};

export default directMessageHandler;
