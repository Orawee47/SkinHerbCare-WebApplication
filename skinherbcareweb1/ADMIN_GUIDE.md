# 🔐 วิธีการเข้าถึง Admin Dashboard

## 1️⃣ สร้าง Admin Account ในครั้งแรก

### วิธีที่ 1: ใช้ Script (ง่ายที่สุด)
```bash
# รันคำสั่งนี้ในเครื่องของคุณ
node create-admin.js
```

**Output ที่จะได้:**
```
✅ เชื่อมต่อ MongoDB สำเร็จ
✅ สร้าง Admin Account สำเร็จ!
📧 Email: admin@skinherbcare.com
🔑 Password: admin123456
⚠️  กรุณาเปลี่ยนรหัสผ่านหลังจากล็อกอินแล้ว
```

### วิธีที่ 2: ใช้ MongoDB Atlas (ถ้าต้องการสร้างเองมี)
ไปที่ MongoDB Atlas → Database → Collections → Users → Insert one document

เติมข้อมูล:
```json
{
  "firstName": "Admin",
  "lastName": "SkinHerbCare",
  "email": "admin@skinherbcare.com",
  "password": "ระบบจะ hash อัตโนมัติ",
  "age": 30,
  "occupation": "Administrator",
  "role": "admin"
}
```

---

## 2️⃣ เข้าสู่ระบบเป็น Admin

1. **ไปที่หน้า Login:**
   ```
   https://skinherbcareweb1.onrender.com/login.html
   ```

2. **ใส่ข้อมูลการเข้าสู่ระบบ:**
   - 📧 **Email:** `admin@skinherbcare.com`
   - 🔑 **Password:** `admin123456`

3. **กดปุ่ม "เข้าสู่ระบบ"**

---

## 3️⃣ ระบบจะ Redirect ไปให้โดยอัตโนมัติ

### ✅ ถ้าเป็น Admin:
```
ระบบจะเปลี่ยนไปที่: /admin-dashboard.html ✅
```

### ❌ ถ้าเป็น User ทั่วไป:
```
ระบบจะเปลี่ยนไปที่: /user-dashboard.html
```

---

## 🛡️ การป้องกันการเข้าถึง

### ✅ ระบบตรวจสอบ 2 สิ่ง:

1. **Token ใน localStorage**
   - ถ้าไม่มี Token → Redirect ไป `/login.html`

2. **Role = 'admin'**
   - ถ้า Role ไม่ใช่ admin → Redirect ไป `/user-dashboard.html`

### 📋 ตัวอย่าง:
```javascript
// ระบบจะตรวจสอบแบบนี้
if (!token) {
    alert('❌ กรุณาเข้าสู่ระบบก่อน');
    window.location.href = '/login.html';
}

if (user.role !== 'admin') {
    alert('❌ เฉพาะแอดมินเท่านั้นที่เข้าได้');
    window.location.href = '/user-dashboard.html';
}
```

---

## 🎯 ใน Admin Dashboard คุณทำได้:

### ➕ **เพิ่มข้อมูล:**
- 🏥 เพิ่มโรค → `/add_disease.html`
- 🌿 เพิ่มสมุนไพร → `/add_herb.html`

### 📋 **ดูรายการ:**
- 📊 ดูโรคทั้งหมด → `/disease_list.html`
- 📊 ดูสมุนไพรทั้งหมด → `/herb_list.html`

### 🚪 **ออกจากระบบ:**
- กดปุ่ม "ออกจากระบบ" ที่มุมล่างของ Sidebar

---

## 📌 หมายเหตุสำคัญ:

1. **เปลี่ยนรหัสผ่าน** หลังจากล็อกอินครั้งแรก
2. **ค่า Token** จะเก็บใน `localStorage` โดยอัตโนมัติ
3. **ค่า User Info** จะเก็บเป็น JSON string ใน `localStorage`
4. **Token หมดอายุ** หลังจาก 30 วัน

---

## 🔧 ถ้ามีปัญหา:

### ❌ "ไม่สามารถเข้าสู่ระบบได้"
→ ตรวจสอบว่า JWT_SECRET ตั้งค่าใน Render environment variables หรือไม่

### ❌ "เข้าได้ แต่ redirect ไป user-dashboard"
→ ตรวจสอบว่า user ที่สร้างมี `role: 'admin'` หรือไม่

### ❌ "ไม่สามารถส่งข้อมูลโรค/สมุนไพรได้"
→ ตรวจสอบว่า:
- ✅ เป็น Admin จริง
- ✅ JWT_SECRET ตั้งค่า
- ✅ MongoDB เชื่อมต่อปกติ

---

## 🚀 สำหรับผู้พัฒนา:

### เปลี่ยน Admin Email/Password:
แก้ไขใน `create-admin.js`:
```javascript
// เปลี่ยนบรรทัดนี้:
const adminUser = await User.create({
    email: 'admin@skinherbcare.com', // ← เปลี่ยนตรงนี้
    password: 'admin123456',          // ← หรือตรงนี้
    // ...
});
```

จากนั้นรัน: `node create-admin.js`

---

**✨ สำเร็จแล้ว! ขณะนี้คุณสามารถเข้า Admin Dashboard ได้แล้ว!**
