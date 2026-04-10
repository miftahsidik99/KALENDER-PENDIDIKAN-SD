export interface SchoolIdentity {
  name: string;
  npsn: string;
  address: string;
  principalName: string;
  principalNip: string;
  city: string;
}

export interface TeacherIdentity {
  name: string;
  nip: string;
  schoolName: string;
  className: string;
  city: string;
  principalName: string;
  principalNip: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD format
  endDate?: string; // For multi-day events
  description: string;
  color: string;
}

export interface AcademicYear {
  startYear: number;
  endYear: number;
  label: string;
}

export interface CurriculumSubject {
  id: string;
  no: string;
  name: string;
  hoursPerWeek: number | string;
  isSubItem?: boolean;
}

