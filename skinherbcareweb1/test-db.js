// ไฟล์: test-db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 1. ลองโหลดค่าจาก .env
dotenv.config();

console.log("----------------------------------------");
console.log("🛠️  เริ่มทดสอบการเชื่อมต่อ Database...");

// 2. เช็คว่าอ่านค่า Connection String เจอไหม?
const uri = process.env.MONGO_URI;
console.log("📍 อ่านค่า URI จาก .env:", uri ? "✅ เจอแล้ว (ซ่อนรหัสไว้)" : "❌ ไม่เจอ! (ค่าเป็น undefined)");

if (!uri) {
    console.error("⚠️  สาเหตุ: โปรแกรมหาไฟล์ .env ไม่เจอ หรือในไฟล์ไม่ได้ตั้งชื่อตัวแปรว่า MONGO_URI");
    console.log("👉 วิธีแก้: เช็คว่าไฟล์ .env อยู่ที่เดียวกับ package.json ไหม?");
    process.exit(1);
}

// 3. ลองเชื่อมต่อ (ตั้งเวลาแค่ 5 วินาที พอ)
console.log("⏳ กำลังพยายามเชื่อมต่อ (รอ 5 วินาที)...");

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000 // สำคัญ: ถ้าเกิน 5 วิ ให้ตัดเลย อย่าค้าง
})
.then(() => {
    console.log("✅✅✅ สำเร็จ! เชื่อมต่อ Database ได้แล้ว");
    console.log("🎉 สรุป: รหัสถูก, IP ผ่าน, เน็ตใช้ได้");
    console.log("----------------------------------------");
    process.exit(0);
})
.catch((err) => {
    console.log("❌❌❌ ล้มเหลว! เชื่อมต่อไม่ได้");
    console.error("💥 Error Message:", err.message);
    console.log("----------------------------------------");
    process.exit(1);
});