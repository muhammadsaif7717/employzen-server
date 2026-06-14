import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { env } from "./app/config/env";
import { connectDb } from "./app/config/connectDb";
import { corsOptions } from "./app/config/cors";
import MessageModel from "./app/module/Chat/message.model";
import mongoose from "mongoose";

const server = createServer(app);

// Bind Socket.IO with CORS options matching Express CORS
const io = new Server(server, {
  cors: corsOptions,
});

// Socket.IO event handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join private conversation room
  socket.on("join_room", (roomName: string) => {
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room ${roomName}`);
  });

  // Handle incoming chat messages
  socket.on("send_message", async (data: {
    sender: string;
    receiver: string;
    content: string;
  }) => {
    const { sender, receiver, content } = data;
    try {
      // Create and save message to database
      const newMessage = await MessageModel.create({
        sender: new mongoose.Types.ObjectId(sender),
        receiver: new mongoose.Types.ObjectId(receiver),
        content,
      });

      // Construct private room key (sorted user IDs to avoid order issues)
      const sortedIds = [sender, receiver].sort();
      const roomName = `room_${sortedIds[0]}_${sortedIds[1]}`;

      // Broadcast message to everyone in the room
      io.to(roomName).emit("receive_message", newMessage);
    } catch (error) {
      console.error("Socket send_message error:", error);
      socket.emit("error", { message: "Message could not be sent" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const bootstrap = async () => {
  try {
    // Connect to database
    await connectDb();

    if (process.env.VERCEL) {
      console.log("Vercel environment detected. Bypassing server listen.");
      return;
    }

    let currentPort = Number(env.port) || 5000;

    const startServer = (port: number) => {
      server.listen(port);
    };

    server.once("listening", () => {
      const address = server.address();
      const actualPort = typeof address === "string" ? address : address?.port;
      console.log(`Server is running at http://localhost:${actualPort}`);
    });

    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.warn(`Port ${currentPort} is already in use. Trying port ${currentPort + 1}...`);
        currentPort++;
        startServer(currentPort);
      } else {
        console.error("Server error:", error);
        process.exit(1);
      }
    });

    // Start server
    startServer(currentPort);
  } catch (error) {
    console.error("Bootstrap error:", error);
    process.exit(1);
  }
};

// Handle unhandled rejections and exceptions
process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection detected, shutting down server...", error);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception detected, shutting down server...", error);
  process.exit(1);
});

bootstrap();

export { io };

export default app;

