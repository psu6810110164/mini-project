import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Between } from 'typeorm'; 
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createDto: any, userId: number) {
      const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctorName: createDto.doctorName,
        date: createDto.date,
        status: Not('cancelled'),
      },
    });

    if (existingAppointment) {
      throw new ConflictException(
        `เสียใจด้วยครับ! คุณหมอ ${createDto.doctorName} มีคิวในเวลา ${new Date(createDto.date).toLocaleString()} แล้ว`,
      );
    }

    const appointment = this.appointmentRepository.create({
      doctorName: createDto.doctorName,
      date: createDto.date,
      symptom: createDto.symptom,
      status: 'confirmed',
      user: { id: userId },
    });

    return this.appointmentRepository.save(appointment);
  }

  async findByUser(userId: number) {
    return this.appointmentRepository.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
      relations: ['user'],
    });
  }

  async findAll() {
    return this.appointmentRepository.find({
      order: { date: 'DESC' },
      relations: ['user'],
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
    const oldAppointment = await this.findOne(id);
    
    if (updateDto.date || updateDto.doctorName) {
      const targetDate = updateDto.date || oldAppointment.date;
      const targetDoctor = updateDto.doctorName || oldAppointment.doctorName;

      const conflict = await this.appointmentRepository.findOne({
        where: {
          doctorName: targetDoctor,
          date: targetDate,
          status: Not('cancelled'), 
          id: Not(id), 
        },
      });

      if (conflict) {
        throw new ConflictException(
          `แก้ไขไม่ได้! หมอ ${targetDoctor} มีคิววันที่ ${new Date(targetDate).toLocaleString()} แล้ว`,
        );
      }
    }

    await this.appointmentRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async checkAvailability(doctorName: string, dateString: string) {
    const searchDate = new Date(dateString);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const appointments = await this.appointmentRepository.find({
      where: {
        doctorName: doctorName,
        date: Between(startOfDay, endOfDay), 
        status: Not('cancelled'),
      },
    });

    const allSlots = [
      '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
    ];

    const result = allSlots.map(slot => {
      const isBooked = appointments.some(app => {
        const appTime = new Date(app.date).getHours();
        const slotTime = parseInt(slot.split(':')[0]);
        return appTime === slotTime;
      });

      return { time: slot, available: !isBooked };
    });

    return result;
  }

  async remove(id: number) {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Appointment not found');
    return { deleted: true };
  }
}