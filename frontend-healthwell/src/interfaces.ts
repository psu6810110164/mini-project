export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Appointment {
  id: number;
  doctorName: string;
  date: string;
  status: string;
  symptom: string;
  user?: User;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}