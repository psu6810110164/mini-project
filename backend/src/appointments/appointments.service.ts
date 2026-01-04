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
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctorName: createDto.doctorName,
        date: createDto.date,
        status: Not('cancelled'),
      },
    });

    if (existingAppointment) {
      throw new ConflictException(
        `เสียใจด้วยครับ! คุณหมอ ${createDto.doctorName} มีคิวในเวลา ${createDto.date} แล้ว (สถานะ: ${existingAppointment.status})`,
      );
    }

    const appointment = this.appointmentRepository.create({
      ...createDto,
      status: 'pending',
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
    await this.appointmentRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Appointment not found');
    return { deleted: true };
  }
}