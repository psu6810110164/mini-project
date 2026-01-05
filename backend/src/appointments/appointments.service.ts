import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createDto: any, userId: number) {
    // 1. เช็คว่าหมอคิวเต็มหรือยังในเวลานั้น (กันชนกัน)
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctorName: createDto.doctorName,
        date: createDto.date,
        status: Not('cancelled'), // ถ้ามีนัดแล้ว และยังไม่ยกเลิก ถือว่าซ้ำ
      },
    });

    if (existingAppointment) {
      throw new ConflictException(
        `เสียใจด้วยครับ! คุณหมอ ${createDto.doctorName} มีคิวในเวลา ${createDto.date} แล้ว`,
      );
    }

    // 2. สร้างข้อมูลลง Database
    // แนะนำให้ระบุทีละตัวแบบนี้ จะชัวร์กว่าการใช้ ...createDto
    const appointment = this.appointmentRepository.create({
      doctorName: createDto.doctorName,
      date: createDto.date,
      symptom: createDto.symptom, // ✅ บรรทัดสำคัญ! สั่งให้บันทึกอาการลงไปด้วย
      status: 'confirmed',
      user: { id: userId }, // ผูกกับ User ที่ล็อกอินอยู่
    });

    return this.appointmentRepository.save(appointment);
  }

  async findByUser(userId: number) {
    return this.appointmentRepository.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' }, // เรียงจากวันที่ล่าสุดไปเก่า
      relations: ['user'],
    });
  }

  async findAll() {
    return this.appointmentRepository.find({
      order: { date: 'DESC' }, // Admin ควรเห็นล่าสุดก่อน
      relations: ['user'], // ดึงข้อมูล User (ชื่อ, เลขบัตร) มาแสดงด้วย
    });
  }

  async findOne(id: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async update(id: number, updateDto: any) {
    // ใช้ preload หรือ update ก็ได้ แต่ update จะเร็วกว่าสำหรับเคสง่ายๆ
    await this.appointmentRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Appointment not found');
    return { deleted: true };
  }
}