import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Symptom } from '../../symptoms/entities/symptom.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];

  @ManyToMany(() => Symptom, (symptom) => symptom.users)
  @JoinTable({ name: 'user_symptoms' })
  symptoms: Symptom[];

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

}