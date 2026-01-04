import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard) 
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Roles(UserRole.USER)
  @Post()
  create(@Body() body: any, @Request() req) {
    return this.appointmentsService.create(body, req.user.userId);
  }

  @Roles(UserRole.USER)
  @Get('my-history')
  findMyHistory(@Request() req) {
    return this.appointmentsService.findByUser(req.user.userId);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.appointmentsService.update(+id, body);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
}
