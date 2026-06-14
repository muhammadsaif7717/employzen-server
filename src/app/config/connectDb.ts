import mongoose from "mongoose";
import { env } from "./env";
import CategoryModel from "../module/Category/category.model";

export const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected successfully");

    // Seed categories if database is empty
    const count = await CategoryModel.countDocuments();
    if (count === 0) {
      const defaultCategories = [
        { name: "Development & IT", description: "Software, web development, IT, QA, and security roles." },
        { name: "Design & Creative", description: "UI/UX, graphic design, branding, and copywriting roles." },
        { name: "Sales & Marketing", description: "Growth hacking, SEO, sales, and content marketing." },
        { name: "Product Management", description: "Product management, operations, and analysis roles." },
        { name: "Customer Support", description: "Customer success, support, and relationship management." },
      ];
      await CategoryModel.insertMany(defaultCategories);
      console.log("Seeded default job categories into MongoDB.");
    }
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

