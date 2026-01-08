import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
// ถ้ามี Import อื่นๆ เก็บไว้เหมือนเดิมนะครับ

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    // ใส่ user id หรือแก้ตาม logic เดิมของคุณ
    const userId = req.user ? req.user.id : 1; // แก้ขัดไปก่อนถ้ายังไม่ได้ทำ auth จริงจัง
    return this.appointmentsService.create(createAppointmentDto, userId);
  }

  // 👇👇 จุดสำคัญ! ต้องมีอันนี้ หน้าเว็บถึงจะดึงเวลาได้ 👇👇
  @Get('check-availability')
  async checkAvailability(
    @Query('doctorName') doctorName: string,
    @Query('date') date: string,
  ) {
    console.log('มีการเรียกเช็คเวลา:', doctorName, date); // ✅ ใส่ log ให้ดูว่า Frontend ยิงมาถึงไหม
    return this.appointmentsService.checkAvailability(doctorName, date);
  }
  // 👆👆 ------------------------------------------ 👆👆

  @Get('my-history')
  findByUser(@Request() req) {
    const userId = req.user ? req.user.id : 1; 
    return this.appointmentsService.findByUser(userId);
  }

  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(+id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
}