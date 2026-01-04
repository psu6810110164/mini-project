import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 👈 เพิ่ม
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { SymptomsModule } from './symptoms/symptoms.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true,}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'password123',
      database: 'healthwell_db',
      autoLoadEntities: true,
      synchronize: true,
    }),

    UsersModule,
    AppointmentsModule,
    SymptomsModule,
    AuthModule,
  ],
})
export class AppModule {}