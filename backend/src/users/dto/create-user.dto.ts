import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(13, 13, { message: 'Username must be a valid 13-digit Citizen ID' })
  @Matches(/^[0-9]+$/, { message: 'Citizen ID must contain only numbers' })
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

}