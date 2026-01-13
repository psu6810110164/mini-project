import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto, 
    @Body('userId') userIdFromBody: string, // กรณีส่งแยกมา
    @Request() req
  ) {
    const userId = userIdFromBody ? parseInt(userIdFromBody) : (req.user ? req.user.id : 1);
    
    createAppointmentDto.userId = userId;

    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get('check-availability')
  async checkAvailability(
    @Query('doctorName') doctorName: string,
    @Query('date') date: string,
  ) {
    console.log('มีการเรียกเช็คเวลา:', doctorName, date);
    return this.appointmentsService.checkAvailability(doctorName, date);
  }

  @Get('my-history')
  async findByUser(@Query('userId') userId: string) {
    const id = userId ? parseInt(userId) : 1;
    return this.appointmentsService.findMyHistory(id); 
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