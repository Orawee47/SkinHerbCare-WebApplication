import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Herb from './src/models/Herb.js';

dotenv.config();

const addHerbs = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ตรวจสอบว่า User หรือ Admin มีอยู่ก่อน
    const users = await mongoose.connection.collection('users').findOne();
    let adminId;

    if (users) {
      // ใช้ user ที่มีอยู่
      const firstUser = await mongoose.connection.collection('users').findOne();
      adminId = firstUser._id;
      console.log(`Using existing user: ${adminId}`);
    } else {
      // สร้าง ObjectId dummy
      adminId = new mongoose.Types.ObjectId();
      console.log(`Using dummy admin ID: ${adminId}`);
    }

    const herbsData = [
      {
        name: "ว่านหางจระเข้",
        scientificName: "Aloe barbadensis",
        description: "ว่านหางจระเข้มีเจลใสภายในใบที่เต็มไปด้วยสารอุดมสมบูรณ์ ช่วยบำรุงผิว ลดการอักเสบ และฟื้นฟูผิวที่ได้รับความเสียหาย",
        properties: ["ลดการอักเสบ", "บำรุงผิว", "ลดรอยแดง"],
        usage: "ทาเจลว่านหางจระเข้โดยตรงบนผิว 1-2 ครั้งต่อวัน หรือผสมกับครีมบำรุง",
        image: "/uploads/herbs/aloe.jpg",
        addedBy: adminId
      },
      {
        name: "ขมิ้นชัน",
        scientificName: "Curcuma longa",
        description: "ขมิ้นชันมีสารคูร์คูมินซึ่งมีฤทธิ์ต้านเชื้อแบคทีเรีย ลดการอักเสบ และช่วยลดสิว",
        properties: ["ต้านแบคทีเรีย", "ลดการอักเสบ", "ลดสิว"],
        usage: "ผสมกับน้ำหรือน้ำมะหาด ทารอบ 2-3 ครั้งต่อสัปดาห์",
        image: "/uploads/herbs/turmeric.jpg",
        addedBy: adminId
      },
      {
        name: "ใบบัวบก",
        scientificName: "Centella asiatica",
        description: "ใบบัวบกช่วยลดอาการคัน บำรุงผิว ลดการอักเสบ และช่วยในการฟื้นฟูผิวที่เสียหาย",
        properties: ["ลดการอักเสบ", "ลดการคัน", "บำรุงผิว"],
        usage: "ข้มกับน้ำเปล่า ดื่มทุกวัน หรือทาแบบสดบนผิว",
        image: "/uploads/herbs/centella.jpg",
        addedBy: adminId
      },
      {
        name: "น้ำมันมะพร้าว",
        scientificName: "Cocos nucifera",
        description: "น้ำมันมะพร้าวบริสุทธิ์มีฤทธิ์ลดความแห้ง บำรุงผิว และมีคุณสมบัติต้านเชื้อ",
        properties: ["ลดความแห้ง", "บำรุงผิว", "ต้านเชื้อ"],
        usage: "ทาน้ำมันมะพร้าวบริสุทธิ์บนผิวกายหลังอาบน้ำ",
        image: "/uploads/herbs/coconut.jpg",
        addedBy: adminId
      },
      {
        name: "มะขามเปียก",
        scientificName: "Tamarindus indica",
        description: "มะขามเปียกมีวิตามิน C สูง ช่วยให้ผิวสว่างใส ลดรอยดำจากแดด",
        properties: ["ลดรอยดำ", "สว่างใส", "ลดตำหนิ"],
        usage: "ข้มมะขามเปียกกับน้ำหรือน้ำไข่ มาสก์บนหน้า 2 ครั้งต่อสัปดาห์",
        image: "/uploads/herbs/tamarind.jpg",
        addedBy: adminId
      },
      {
        name: "พญายอ",
        scientificName: "Curcuma domestica",
        description: "พญายอมีสารอุดมสมบูรณ์ ช่วยลดการอักเสบ ลดขนดำ บำรุงผิว",
        properties: ["ลดการอักเสบ", "ลดขนดำ", "บำรุงผิว"],
        usage: "ผสมพญายอกับน้ำ ทาเป็นมาสก์บนหน้า 1-2 ครั้งต่อสัปดาห์",
        image: "/uploads/herbs/galangal.jpg",
        addedBy: adminId
      },
      {
        name: "มะนาว",
        scientificName: "Citrus aurantifolia",
        description: "มะนาวมีวิตามิน C และสารแอนติออกซิแดนท์ ช่วยให้ผิวสว่างใส ลดสิว",
        properties: ["สว่างใส", "ลดสิว", "เก็บระดับความเป็นกรด"],
        usage: "สกัดน้ำมะนาวผสมกับน้ำหรือน้ำหนึ่ง ทาเบา ๆ บนหน้า 1-2 ครั้งต่อสัปดาห์",
        image: "/uploads/herbs/lime.jpg",
        addedBy: adminId
      },
      {
        name: "แตงกวา",
        scientificName: "Cucumis sativus",
        description: "แตงกวาช่วยให้ผิวชุ่มชื้น ลดความร้อน-แดด บำรุงผิว",
        properties: ["ชุ่มชื้น", "บำรุงผิว", "ลดความร้อน"],
        usage: "สไลด์แตงกวาแตะบนผิว หรือทำให้เป็นน้ำแตงกวา บอกลิ้ก 3-5 นาที",
        image: "/uploads/herbs/cucumber.jpg",
        addedBy: adminId
      }
    ];

    // ลบ herbs เก่า
    await Herb.deleteMany({});
    console.log("🗑️  Cleared old herbs");

    // เพิ่มสมุนไพรใหม่
    const result = await Herb.insertMany(herbsData);
    console.log(`✅ Added ${result.length} herbs to database`);

    result.forEach((herb, index) => {
      console.log(`${index + 1}. ${herb.name} (${herb.scientificName})`);
    });

    await mongoose.connection.close();
    console.log("\n✅ Herb insertion complete");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

addHerbs();
