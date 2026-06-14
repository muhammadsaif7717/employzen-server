import { Types } from "mongoose";
import MessageModel from "./message.model";

const getMessageHistoryFromDb = async (userId: string, partnerId: string) => {
  const userObjectId = new Types.ObjectId(userId);
  const partnerObjectId = new Types.ObjectId(partnerId);

  // 1. Fetch historical conversation logs sorted chronologically
  const messages = await MessageModel.find({
    $or: [
      { sender: userObjectId, receiver: partnerObjectId },
      { sender: partnerObjectId, receiver: userObjectId },
    ],
  }).sort({ createdAt: 1 });

  // 2. Mark any incoming unread messages as read
  await MessageModel.updateMany(
    { sender: partnerObjectId, receiver: userObjectId, isRead: false },
    { $set: { isRead: true } }
  );

  return messages;
};

// Returns a list of users whom the active user has had conversations with (chat partners list)
const getChatRoomsFromDb = async (userId: string) => {
  const userObjectId = new Types.ObjectId(userId);

  // Find distinct partners from messages where user is either sender or receiver
  const conversations = await MessageModel.aggregate([
    {
      $match: {
        $or: [{ sender: userObjectId }, { receiver: userObjectId }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$sender", userObjectId] },
            "$receiver",
            "$sender",
          ],
        },
        lastMessage: { $first: "$content" },
        lastMessageTime: { $first: "$createdAt" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiver", userObjectId] },
                  { $eq: ["$isRead", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // Populate user profiles of the chat partners dynamically
  const populatedRooms = await Promise.all(
    conversations.map(async (room) => {
      // Look up User details
      const mongoose = require("mongoose");
      const UserModel = mongoose.model("User");
      const partner = await UserModel.findById(room._id);
      
      let profileName = "User";
      let avatarUrl = "";

      if (partner?.role === "candidate") {
        const CandidateModel = mongoose.model("Candidate");
        const candidate = await CandidateModel.findOne({ user: partner._id });
        profileName = candidate?.name || "Candidate";
        avatarUrl = candidate?.avatarUrl || "";
      } else if (partner?.role === "employer") {
        const EmployerModel = mongoose.model("Employer");
        const employer = await EmployerModel.findOne({ user: partner._id });
        profileName = employer?.name || "Employer";
        avatarUrl = employer?.avatarUrl || "";
      }

      return {
        partnerId: room._id,
        partnerName: profileName,
        partnerAvatar: avatarUrl,
        partnerRole: partner?.role,
        lastMessage: room.lastMessage,
        lastMessageTime: room.lastMessageTime,
        unreadCount: room.unreadCount,
      };
    })
  );

  // Sort partners list by last active message timestamp descending
  return populatedRooms.sort(
    (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
  );
};

export const ChatServices = {
  getMessageHistoryFromDb,
  getChatRoomsFromDb,
};
