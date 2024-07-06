import mongoose from "mongoose";

const roomSchema = mongoose.Schema(
  {
    roomName:String,
    host:String,
    meetType:String,
    meetDate:String,
    meetTime:String,
    participants:Array,
    currentParticipants:Array,
  
  },
  { timestamps: true }
);

export const roomModel = mongoose.model("room", roomSchema);
