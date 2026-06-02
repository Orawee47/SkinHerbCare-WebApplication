import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Herb from './src/models/Herb.js';

dotenv.config();

const importHerbsFromCSV = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // อ่าน CSV file
    const fileContent = fs.readFileSync('./herbs_all1.csv', 'utf-8');
    const lines = fileContent.trim().split('\n');

    console.log(`📖 Read ${lines.length} lines from CSV`);

    // ดึง admin user
    const users = await mongoose.connection.collection('users').findOne();
    let adminId;

    if (users) {
      adminId = users._id;
      console.log(`✅ Using admin user: ${adminId}`);
    } else {
      adminId = new mongoose.Types.ObjectId();
      console.log(`⚠️  No admin found, using dummy ID: ${adminId}`);
    }

    // แปลงข้อมูล CSV เป็นรูปแบบ Herb (ใช้ regex สำหรับ CSV parsing)
    const herbsData = lines.map((line, index) => {
      // Split by comma แต่อย่างระวัง เพราะ description อาจมี comma
      const parts = line.split(',');
      
      if (parts.length < 6) return null;

      const id = parts[0]?.trim();
      const name = parts[1]?.trim();
      const scientificName = parts[2]?.trim();
      const localName = parts[3]?.trim();
      const description = parts[4]?.trim();
      const part = parts[5]?.trim();
      const usage = parts[6]?.trim();
      const properties = parts[7]?.trim();
      const warning = parts[8]?.trim();

      if (!name || !scientificName) return null;

      return {
        name,
        scientificName,
        description,
        properties: properties ? properties.split(/;|,/).map(p => p.trim()).filter(p => p && p.length > 3) : [],
        usage,
        image: '/uploads/default-herb.png',
        addedBy: adminId
      };
    }).filter(h => h !== null);

    console.log(`✅ Parsed ${herbsData.length} herbs from CSV\n`);

    // ลบข้อมูลเก่า
    await Herb.deleteMany({});
    console.log("🗑️  Cleared old herbs");

    // เพิ่มข้อมูลใหม่
    const result = await Herb.insertMany(herbsData);
    console.log(`✅ Added ${result.length} herbs to database\n`);

    result.forEach((herb, index) => {
      console.log(`${index + 1}. ${herb.name}`);
      console.log(`   Scientific: ${herb.scientificName}`);
      console.log(`   Properties: ${herb.properties.slice(0, 2).join(', ')}`);
    });

    await mongoose.connection.close();
    console.log("\n✅ CSV Import complete");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

importHerbsFromCSV();
