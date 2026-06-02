import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Disease from './src/models/Disease.js';
import Herb from './src/models/Herb.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function checkDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ เชื่อมต่อ MongoDB สำเร็จ\n');

    // Check Diseases
    console.log('=== 🏥 โรคในระบบ ===');
    const diseases = await Disease.find();
    diseases.forEach((d, i) => {
      console.log(`${i + 1}. ${d.name}`);
      if (d.symptoms && d.symptoms.length > 0) {
        console.log(`   อาการ: ${d.symptoms.join(', ')}`);
      }
    });

    // Check Herbs
    console.log('\n=== 🌿 สมุนไพรในระบบ ===');
    const herbs = await Herb.find();
    herbs.forEach((h, i) => {
      console.log(`${i + 1}. ${h.name}`);
      if (h.properties && h.properties.length > 0) {
        console.log(`   คุณสมบัติ: ${h.properties.join(', ')}`);
      }
    });

    console.log(`\nรวม: ${diseases.length} โรค, ${herbs.length} สมุนไพร`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabase();
