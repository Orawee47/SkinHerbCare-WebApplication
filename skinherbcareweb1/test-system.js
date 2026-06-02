// test-system.js
import axios from 'axios';

async function testSystem() {
    console.log("----------------------------------------");
    console.log("🧪 กำลังทดสอบระบบ SkinHerbCare...");
    console.log("----------------------------------------");
    
    // จำลองข้อมูลอาการ (เปลี่ยนข้อความตรงนี้เพื่อลองเคสอื่น)
    const testData = {
        symptoms: "มีตุ่มแดง คันที่แขน" 
    };

    console.log(`📤 1. ส่งข้อมูลไปที่ Node.js (Port 5000): "${testData.symptoms}"`);

    try {
        // ยิงไปหา Node.js -> Node.js จะส่งต่อให้ Python
        const response = await axios.post('http://localhost:5000/api/analyze-bridge', testData);

        console.log("✅ 2. ได้รับคำตอบกลับมาแล้ว!");
        console.log("----------------------------------------");
        console.log("📊 ผลการวิเคราะห์จาก AI:");
        console.log(JSON.stringify(response.data, null, 2));
        console.log("----------------------------------------");

    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาด:", error.message);
        if (error.response) {
            console.error("Server Response:", error.response.data);
        }
    }
}

testSystem();