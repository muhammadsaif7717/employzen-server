import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./src/app/module/Category/category.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/employzen";

const categories = [
  { name: "Software Engineering", description: "Jobs related to software development and engineering" },
  { name: "Design", description: "UI/UX, Graphic Design, and other design roles" },
  { name: "Marketing", description: "Digital marketing, SEO, content creation" },
  { name: "Sales", description: "B2B, B2C sales and account management" },
  { name: "Data Science & AI", description: "Data analytics, machine learning, and AI" },
  { name: "Finance & Accounting", description: "Accounting, financial analysis, and planning" },
  { name: "Human Resources", description: "Recruitment, HR management, and operations" },
  { name: "Customer Support", description: "Customer service and success roles" },
  { name: "Product Management", description: "Product strategy, roadmap, and execution" },
  { name: "Project Management", description: "Agile, Scrum, and project delivery" },
  { name: "Operations", description: "Business operations and supply chain management" },
  { name: "Legal", description: "Corporate law, compliance, and legal advising" },
  { name: "Engineering & Architecture", description: "Civil, mechanical, electrical engineering" },
  { name: "Healthcare & Medical", description: "Doctors, nurses, and healthcare administration" },
  { name: "Education & Training", description: "Teaching, tutoring, and instructional design" },
  { name: "Administration", description: "Clerical, administrative support, and office management" },
  { name: "Manufacturing & Production", description: "Factory operations, quality control, and production" },
  { name: "Logistics & Supply Chain", description: "Warehouse management, delivery, and procurement" },
  { name: "Media & Communications", description: "Journalism, public relations, and broadcasting" },
  { name: "Real Estate", description: "Property management, sales, and leasing" },
  { name: "Retail", description: "Store management, merchandising, and retail sales" },
  { name: "Hospitality & Tourism", description: "Hotels, restaurants, and travel services" },
  { name: "Construction", description: "Site management, trades, and contracting" },
  { name: "Automotive", description: "Auto repair, manufacturing, and sales" },
  { name: "Energy & Utilities", description: "Renewable energy, oil, gas, and utilities" },
  { name: "Agriculture", description: "Farming, forestry, and agricultural science" },
  { name: "Art & Entertainment", description: "Acting, music, event production, and creative arts" },
  { name: "Security", description: "Cybersecurity, physical security, and law enforcement" },
  { name: "IT & Networking", description: "Network administration, IT support, and systems engineering" },
  { name: "Science & Research", description: "Biology, chemistry, and academic research" },
  { name: "Non-Profit & Volunteer", description: "Social work, NGO operations, and fundraising" }
];

async function seedCategories() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected. Seeding comprehensive categories...");
    
    // Clear existing
    await Category.deleteMany({});
    
    // Insert new
    await Category.insertMany(categories);
    
    console.log(`Successfully seeded ${categories.length} categories!`);
  } catch (error) {
    console.error("Error seeding categories:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedCategories();
