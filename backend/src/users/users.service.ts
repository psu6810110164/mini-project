import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async onModuleInit() {
    const adminUsername = '9999999999999';
    const adminExists = await this.userRepository.findOneBy({ username: adminUsername });

    if (!adminExists) {
      console.log('🚀 Creating Default Admin...');

      const admin = this.userRepository.create({
        username: adminUsername,
        password: await bcrypt.hash('admin1234', 10), 
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.ADMIN,
      });

      await this.userRepository.save(admin);
      console.log('✅ Admin Created! Username: 9999999999999 / Pass: admin1234');
    }
  }

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword
    });
    return this.userRepository.save(user);
  }

  async findOneByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async remove(id: number) {
    return this.userRepository.delete(id);
  }
}