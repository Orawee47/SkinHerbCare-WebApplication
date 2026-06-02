import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Disease from './src/models/Disease.js';
import Herb from './src/models/Herb.js';
import HerbDiseaseRelation from './src/models/HerbDiseaseRelation.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// ✅ ข้อมูลการเชื่อมโยงระหว่าง Herb และ Disease
// โครงสร้าง: { diseaseName: [herbNames, ...], effectiveness: 'สูง'/'ปานกลาง'/'ต่ำ' }
const herbDiseaseMapping = {
  'สิว Acne': {
    herbs: [
      { name: 'ขมิ้นชัน', effectiveness: 'สูง' },
      { name: 'กระเทียม', effectiveness: 'สูง' },
      { name: 'พลูคาว', effectiveness: 'ปานกลาง' },
      { name: 'พลู', effectiveness: 'ปานกลาง' },
      { name: 'โหระพา', effectiveness: 'ปานกลาง' }
    ]
  },
  'สะเก็ดเงิน Psoriasis': {
    herbs: [
      { name: 'ว่านหางจระเข้', effectiveness: 'สูง' },
      { name: 'ขมิ้นชัน', effectiveness: 'สูง' },
      { name: 'แตงกวา', effectiveness: 'ปานกลาง' },
      { name: 'เปลือกมังคุดแห้ง', effectiveness: 'ปานกลาง' }
    ]
  },
  'ลมพิษ Urticaria': {
    herbs: [
      { name: 'ว่านหางจระเข้', effectiveness: 'สูง' },
      { name: 'ข่า', effectiveness: 'สูง' },
      { name: 'แตงกวา', effectiveness: 'ปานกลาง' },
      { name: 'โหระพา', effectiveness: 'ปานกลาง' }
    ]
  },
  'กลากเกลื้อน Tinea': {
    herbs: [
      { name: 'กระเทียม', effectiveness: 'ปานกลาง' },
      { name: 'ข่า', effectiveness: 'ปานกลาง' },
      { name: 'พลู', effectiveness: 'ปานกลาง' },
      { name: 'กระเพรา', effectiveness: 'ปานกลาง' }
    ]
  },
  'ด่างขาว Vitiligo': {
    herbs: [
      { name: 'ข่า', effectiveness: 'ปานกลาง' },
      { name: 'ขมิ้นชัน', effectiveness: 'ปานกลาง' },
      { name: 'กระเทียม', effectiveness: 'ต่ำ' }
    ]
  },
  'โรคเริม (Herpes simplex)': {
    herbs: [
      { name: 'ขมิ้นชัน', effectiveness: 'สูง' },
      { name: 'กระเทียม', effectiveness: 'สูง' },
      { name: 'พลู', effectiveness: 'ปานกลาง' },
      { name: 'โหระพา', effectiveness: 'ปานกลาง' }
    ]
  }
  'งูสวัด Herpes Zoster': {
    herbs: [
      { name: 'พญายอ', effectiveness: 'ปานกลาง' },
      { name: 'ตำลึง', effectiveness: 'ปานกลาง' },
      { name: 'ว่านหางจระเข้', effectiveness: 'ปานกลาง' }
    ]
  }
};

async function createRelations() {
  try {
    // 1. เชื่อมต่อ MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ เชื่อมต่อ MongoDB สำเร็จ');

    // 2. ลบความสัมพันธ์เก่าออก (เพื่อให้สร้างใหม่ได้)
    const deletedCount = await HerbDiseaseRelation.deleteMany({});
    console.log(`🗑️ ลบความสัมพันธ์เก่า: ${deletedCount.deletedCount} รายการ`);

    // 3. วนลูปสร้างความสัมพันธ์ใหม่
    let createdCount = 0;
    for (const [diseaseName, { herbs }] of Object.entries(herbDiseaseMapping)) {
      // ค้นหา Disease ID
      const disease = await Disease.findOne({ name: { $regex: diseaseName.split('(')[0].trim(), $options: 'i' } });
      if (!disease) {
        console.warn(`⚠️ ไม่พบโรค: ${diseaseName}`);
        continue;
      }

      // สร้างความสัมพันธ์กับแต่ละ herb
      for (const herbData of herbs) {
        const herb = await Herb.findOne({ name: herbData.name });
        if (!herb) {
          console.warn(`⚠️ ไม่พบสมุนไพร: ${herbData.name} สำหรับโรค ${diseaseName}`);
          continue;
        }

        // สร้างหรือ Update ความสัมพันธ์
        await HerbDiseaseRelation.updateOne(
          { herb: herb._id, disease: disease._id },
          { effectiveness: herbData.effectiveness, notes: `Recommended for ${diseaseName}` },
          { upsert: true }
        );

        createdCount++;
        console.log(`✅ สร้าง: ${disease.name} ↔️ ${herb.name} (${herbData.effectiveness})`);
      }
    }

    console.log(`\n✅ สร้างความสัมพันธ์ใหม่: ${createdCount} รายการ`);
    console.log('🎉 สำเร็จ!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 ปิดการเชื่อมต่อ MongoDB');
  }
}

createRelations();
