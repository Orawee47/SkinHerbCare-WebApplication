/**
 * ============================================================================
 * Main Site Logic (main.js)
 * ============================================================================
 * สคริปต์หลักสำหรับจัดการฟังก์ชันที่ใช้ร่วมกันในทุกหน้าของเว็บ เช่น
 * - การตรวจสอบสถานะล็อกอิน
 * - การแสดง/ซ่อนเมนูตามสถานะ
 * - การดึงข้อมูลผู้ใช้มาแสดง
 * - การจัดการออกจากระบบ
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    
    console.log('🌿 SkinHerbCare main.js loaded successfully!');
    const API_BASE_URL = window.location.hostname.includes('netlify.app')
        ? 'https://skinherbcareweb1.onrender.com'
        : window.location.origin;

    // สร้าง Object หลักสำหรับจัดการฟังก์ชันต่างๆ ของแอป
    const App = {
        // ดึง Token ของผู้ใช้ออกจาก localStorage เมื่อโหลดหน้า
        // รองรับทั้ง key เก่า (userToken) และ key ใหม่ (token)
        token: localStorage.getItem('token') || localStorage.getItem('userToken'),

        /**
         * ฟังก์ชันสำหรับอัปเดตหน้าตาของเว็บ (UI) ตามสถานะการล็อกอิน
         */
        updateUI: function() {
            const navUserSection = document.getElementById('nav-user-section');
            const navGuestSection = document.getElementById('nav-guest-section');

            if (navGuestSection && navUserSection) {
                if (this.token) {
                    // ถ้ามี token (หมายถึงล็อกอินแล้ว)
                    navGuestSection.classList.add('hidden'); // ซ่อนเมนูสำหรับ Guest
                    navUserSection.classList.remove('hidden'); // แสดงเมนูสำหรับ User
                    this.fetchUserProfile(); // ไปดึงข้อมูลผู้ใช้มาแสดง
                } else {
                    // ถ้าไม่มี token (ยังไม่ล็อกอิน)
                    navGuestSection.classList.remove('hidden'); // แสดงเมนูสำหรับ Guest
                    navUserSection.classList.add('hidden'); // ซ่อนเมนูสำหรับ User
                }
            }
        },

        /**
         * ฟังก์ชันสำหรับดึงข้อมูลโปรไฟล์ผู้ใช้ (เช่น ชื่อ) จากเซิร์ฟเวอร์
         */
        fetchUserProfile: async function() {
            if (!this.token) return; // ถ้าไม่มี token ก็ไม่ต้องทำอะไร

            try {
                // เรียก API ไปยัง /api/auth/profile พร้อมแนบ token ไปเพื่อยืนยันตัวตน
                const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });

                if (!response.ok) {
                    // ถ้า Server ตอบกลับมาว่าไม่สำเร็จ (เช่น Token หมดอายุ)
                    throw new Error('Invalid token');
                }

                const data = await response.json();

                if (data.success) {
                    // ถ้าดึงข้อมูลสำเร็จ
                    const userNameElement = document.getElementById('user-name-display');
                    if (userNameElement) {
                        // นำชื่อผู้ใช้ไปแสดงผลบนหน้าเว็บ
                        userNameElement.textContent = data.user.firstName || 'ผู้ใช้งาน';
                    }
                } else {
                    // ถ้า Token ไม่ถูกต้อง ให้ทำการ Logout
                    this.handleLogout();
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                this.handleLogout(); // ถ้ามี Error ใดๆ เกิดขึ้น ให้ Logout เพื่อความปลอดภัย
            }
        },

        /**
         * ฟังก์ชันสำหรับจัดการการออกจากระบบ
         */
        handleLogout: function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            window.location.href = '/login.html'; // ส่งผู้ใช้กลับไปที่หน้าล็อกอิน
        },

        /**
         * ฟังก์ชันเริ่มต้นการทำงานของสคริปต์ทั้งหมด
         */
        init: function() {
            this.updateUI(); // เริ่มจากการอัปเดต UI ก่อน

            // เพิ่ม Event Listener ให้กับปุ่ม Logout
            const logoutButton = document.getElementById('logout-btn');
            if (logoutButton) {
                logoutButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout(); // เมื่อคลิกปุ่ม Logout ให้เรียกใช้ฟังก์ชัน handleLogout
                });
            }
        }
    };

    // สั่งให้ App เริ่มทำงาน
    App.init();
});

