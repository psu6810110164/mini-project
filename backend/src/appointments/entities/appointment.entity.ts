import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctorName: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  symptom: string;

  @Column({ default: 'confirmed' })
  status: string;

  @ManyToOne(() => User, (user) => user.appointments, {
    onDelete: 'CASCADE',
  })
  user: User;

}