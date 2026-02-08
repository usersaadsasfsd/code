import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { MongoClient } from "mongodb";

const mongoUrl = process.env.MONGODB_URI || "";

async function testConnection() {
  if (!mongoUrl) {
    console.error("MongoDB URI is not configured in the environment variables.");
    return;
  }

  const client = new MongoClient(mongoUrl);

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected successfully to MongoDB.");

    const db = client.db("countryroof");
    const collections = await db.listCollections().toArray();
    console.log("Collections in the database:", collections.map(c => c.name));

    const homepageSections = await db.collection("homepage_sections").find({}).toArray();
    console.log("Homepage sections:", homepageSections);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  } finally {
    await client.close();
  }
}

testConnection();
