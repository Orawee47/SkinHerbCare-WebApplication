const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// ใช้ .env ก่อน ถ้าไม่มีค่อยใช้ URI สำรอง
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb+srv://nattakamon04_db_user:SkinHerb2024@cluster0.j5ybvto.mongodb.net/SkinHerbDB';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('🔥 เชื่อมต่อ DB แล้ว... กำลังล้างข้อมูลเก่า...'))
  .catch((err) => console.error('❌ ต่อ DB ไม่ติด:', err));

const results = [];
let headersChecked = false;

fs.createReadStream('data2.csv')
  .pipe(
    csv({
      headers: ['name', 'symptoms', 'subSymptoms', 'locations', 'cause', 'treatment'],
      skipLines: 1,
      newline: '\n',
      quote: '"',
      escape: '"'
    })
  )
  .on('headers', (headers) => {
    headersChecked = true;
    const expected = ['name', 'symptoms', 'subSymptoms', 'locations', 'cause', 'treatment'];
    const ok = expected.every((h, i) => headers[i] === h);
    console.log('🧭 Header mapping:', headers.join(', '));
    if (!ok) {
      console.warn('⚠️ Header ไม่ตรงตามลำดับที่ต้องการ');
    }
  })
  .on('data', (row) => {
    if (row.name && row.name.length < 100 && row.name.trim() !== '') {
      results.push({
        name: row.name.trim(),
        symptoms: row.symptoms,
        subSymptoms: row.subSymptoms,
        locations: row.locations,
        cause: row.cause,
        treatment: row.treatment
      });
    }
  })
  .on('end', async () => {
    try {
      if (!headersChecked) {
        console.warn('⚠️ ไม่พบ event headers (ยัง parse ตาม mapping ที่กำหนดไว้)');
      }

      console.log(`🔎 เจอข้อมูลที่อ่านได้: ${results.length} โรค`);

      await mongoose.connection.collection('datadiseases').deleteMany({});
      console.log('🗑️ ลบข้อมูลเก่าใน datadiseases เกลี้ยงแล้ว');

      await mongoose.connection.collection('datadiseases').insertMany(results);
      console.log('✅ ยัดข้อมูลใหม่เสร็จสมบูรณ์! เช็คใน Atlas ได้เลยพี่');

      if (results.length > 0) {
        console.log('--- ตัวอย่างข้อมูลแรก ---');
        console.log('ชื่อโรค:', results[0].name);
        console.log('อาการ:', String(results[0].symptoms || '').substring(0, 50) + '...');
      }

      process.exit(0);
    } catch (error) {
      console.error('❌ พังตอนยัด DB:', error);
      process.exit(1);
    }
  })
  .on('error', (error) => {
    console.error('❌ อ่าน CSV ไม่สำเร็จ:', error);
    process.exit(1);
  });
