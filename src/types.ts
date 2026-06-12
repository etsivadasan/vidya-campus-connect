export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  title: string;
  office?: string;
  updatedAt: string; // ISO String
  updatedBy?: string; // email or name
  avatarUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  building: string;
  iconName?: string;
}

export interface ActivityLog {
  id: string;
  staffId: string;
  staffName: string;
  action: string;
  timestamp: string; // ISO String
}

export interface UserSession {
  isActive: boolean;
  email: string;
  name: string;
  staffId?: string; // if they associated with a staff profile
}
