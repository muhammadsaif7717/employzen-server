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
      let contextJobTitle = "";

      const CandidateModel = mongoose.model("Candidate");
      const EmployerModel = mongoose.model("Employer");
      const ApplicationModel = mongoose.model("Application");
      const JobModel = mongoose.model("Job");

      let candidateProfile = null;
      let employerProfile = null;

      if (partner?.role === "candidate") {
        candidateProfile = await CandidateModel.findOne({ user: partner._id });
        employerProfile = await EmployerModel.findOne({ user: userObjectId });
        profileName = candidateProfile?.name || "Candidate";
        avatarUrl = candidateProfile?.avatarUrl || "";
      } else if (partner?.role === "employer") {
        employerProfile = await EmployerModel.findOne({ user: partner._id });
        candidateProfile = await CandidateModel.findOne({ user: userObjectId });
        profileName = employerProfile?.name || "Employer";
        avatarUrl = employerProfile?.avatarUrl || "";
      }

      if (candidateProfile && employerProfile) {
        try {
          const employerJobs = await JobModel.find({ postedBy: employerProfile._id }).select("_id title");
          const jobIds = employerJobs.map((j: any) => j._id);

          const application = await ApplicationModel.findOne({
            candidate: candidateProfile._id,
            job: { $in: jobIds },
          }).sort({ createdAt: -1 });

          if (application) {
            const matchedJob = employerJobs.find(
              (j: any) => j._id.toString() === application.job.toString()
            );
            if (matchedJob) {
              contextJobTitle = matchedJob.title;
            }
          }
        } catch (e) {
          console.error("Failed to fetch context job title for chat", e);
        }
      }

      return {
        partnerId: room._id,
        partnerName: profileName,
        partnerAvatar: avatarUrl,
        partnerRole: partner?.role,
        contextJobTitle: contextJobTitle,
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
  sendMessage: async (sender: string, receiver: string, content: string) => {
    // Save message to database
    const newMessage = await MessageModel.create({
      sender: new Types.ObjectId(sender),
      receiver: new Types.ObjectId(receiver),
      content,
    });

    // Create notification for receiver
    try {
      const { NotificationServices } = require("../Notification/notification.service");
      await NotificationServices.createNotificationInDb({
        recipient: new Types.ObjectId(receiver),
        message: "You have a new message",
        type: "CHAT",
        link: `/chat?partnerId=${sender}`,
      });
    } catch (notifyError) {
      console.error("Chat notification error:", notifyError);
    }

    return newMessage;
  }
};
