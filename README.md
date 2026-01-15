# HealthQueue: Medical Check-up Reservation System
ระบบจองคิวตรวจสุขภาพออนไลน์ (Health Check-up Queue Management System)

สมาชิกในกลุ่ม
6810110164 นางสาวธีริศรา คงลิขิต

# คำอธิบายโปรเจ็ค (Project Description)
**HealthQueue** คือเว็บสำหรับบริหารจัดการการจองคิวตรวจสุขภาพ เพื่อลดความซับซ้อนและอำนวยความสะดวกให้ผู้ป่วยสามารถจองเวลาที่ต้องการได้ด้วยตนเอง
โดยระบบแบ่งผู้ใช้งานออกเป็น 2 ส่วนหลัก:

**User (ผู้รับบริการ):**
    * สามารถดูตารางเวลาที่ว่างของแพทย์แต่ละท่านได้ (Real-time Availability Check)
    * จองคิวตรวจสุขภาพล่วงหน้า ระบุแพทย์และอาการเบื้องต้น
    * แก้ไขวันและเวลาจองได้ด้วยตนเอง
    * ตรวจสอบประวัติการนัดหมายและสถานะคิว

**Admin (ผู้ดูแลระบบ):**
    * Dashboard แสดงรายการนัดหมายทั้งหมดในระบบ
    * ระบบค้นหาข้อมูลผู้ป่วยและแพทย์ (Search & Filter)
    * จัดการข้อมูลนัดหมายและลบคิวที่ไม่ต้องการ (Cancel/Delete Booking)

# Tech Stack
* **Backend:** NestJS (Node.js Framework), TypeORM, PostgreSQL/MySQL
* **Frontend:** React (Vite), TypeScript, CSS Modules (Custom Styled)
* **Authentication:** JWT (JSON Web Tokens) with Role-based Guard (User/Admin)
* **Tools:** Docker, Docker Compose
