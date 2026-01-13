import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm'; // 👈 1. เพิ่ม Between มาใช้ค้นหาช่วงเวลา
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    // 🛑 เช็คจองซ้ำ: แปลงเป็น Date Object ให้ชัวร์ก่อนเทียบ
    const appointmentDate = new Date(createAppointmentDto.date);
    
    const existing = await this.appointmentRepository.findOne({
      where: {
        doctorName: createAppointmentDto.doctorName,
        date: appointmentDate // เช็ควันที่และเวลาเดียวกันเป๊ะๆ
      }
    });

    if (existing) {
      throw new ConflictException('เวลานี้ถูกจองไปแล้วครับ กรุณาเลือกเวลาอื่น');
    }

    // ✅ สร้าง Appointment ใหม่ (แนบ userId ไปด้วย)
    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      date: appointmentDate, // บันทึกเป็น Date Object
      user: { id: +createAppointmentDto.userId } as User
    });

    return this.appointmentRepository.save(appointment);
  }

  // ✅ ฟังก์ชันเช็คเวลาว่าง (หัวใจสำคัญที่ทำให้ปุ่มเวลาขึ้น!)
  async checkAvailability(doctorName: string, date: string) {
    // 1. กำหนดเวลาที่ร้านเปิด (Hardcode ไว้ก่อนเพื่อความง่าย)
    const allSlots = [
      '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
    ];

    // 2. แปลงวันที่ที่ส่งมา เป็นช่วงเวลา เริ่มต้น-สิ้นสุด ของวันนั้น
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 3. ดึงรายการที่ "ถูกจองไปแล้ว" ในวันนั้น
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        doctorName: doctorName,
        date: Between(startOfDay, endOfDay), // 👈 ใช้ Between ค้นหา
      }
    });

    // 4. แปลงข้อมูลการจอง ให้เป็น List ของ "เวลาที่ไม่ว่าง" (เช่น ['09:00', '14:00'])
    const bookedTimes = existingAppointments.map(app => {
      const appDate = new Date(app.date);
      // แปลงเป็น HH:mm (เช่น 09:00)
      return appDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    });

    // 5. วนลูปเช็ค: เวลาไหนไม่อยู่ใน bookedTimes แปลว่า "ว่าง" (available: true)
    return allSlots.map(time => ({
      time: time,
      available: !bookedTimes.includes(time)
    }));
  }

  async findAll() {
    return this.appointmentRepository.find({
      relations: ['user'], // ✅ ดึงข้อมูล User มาโชว์หน้า Admin
      order: { date: 'DESC' }
    });
  }

  async findOne(id: number) {
    return this.appointmentRepository.findOne({ 
      where: { id },
      relations: ['user'] 
    });
  }

  // ✅ เปลี่ยนชื่อเป็น findByUser เพื่อให้ตรงกับ Controller ที่เคยแก้
  async findByUser(userId: number) {
    return this.appointmentRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { date: 'DESC' }
    });
  }
  
  // (แถม) Alias ไว้กันเหนียว เผื่อ Controller เรียก findMyHistory
  async findMyHistory(userId: number) {
    return this.findByUser(userId);
  }

  update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentRepository.update(id, updateAppointmentDto);
  }

  remove(id: number) {
    return this.appointmentRepository.delete(id);
  }
}