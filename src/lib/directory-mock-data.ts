import { Department, StaffMember } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-cs',
    name: 'Computer Science & Information Technology',
    code: 'CSIT',
    building: 'Turing Science Hall, West Wing',
    iconName: 'Binary'
  },
  {
    id: 'dept-adm',
    name: 'Admissions & Student Records',
    code: 'ASR',
    building: 'Student Services Center, Floor 1',
    iconName: 'FileText'
  },
  {
    id: 'dept-lib',
    name: 'Library & Information Commons',
    code: 'LIC',
    building: 'Main Campus Library, Central Atrium',
    iconName: 'BookOpen'
  },
  {
    id: 'dept-ath',
    name: 'Athletics & Recreation',
    code: 'REC',
    building: 'Falcon Gymnasium & Fieldhouse',
    iconName: 'Activity'
  },
  {
    id: 'dept-hr',
    name: 'Human Resources & Payroll',
    code: 'HRP',
    building: 'Administration Building, Suite 300',
    iconName: 'Users'
  },
  {
    id: 'dept-sec',
    name: 'Campus Police & Safety',
    code: 'CPS',
    building: 'North Gatehouse & Operations Center',
    iconName: 'ShieldAlert'
  },
  {
    id: 'dept-adv',
    name: 'Academic Advising & Counseling',
    code: 'AAC',
    building: 'Student Services Center, Floor 2',
    iconName: 'GraduationCap'
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  // Computer Science & IT
  {
    id: 'staff-1',
    name: 'Dr. Alan McTuring',
    email: 'mcturing@campus.edu',
    phone: '+1 (555) 432-1001',
    departmentId: 'dept-cs',
    title: 'Department Head & Professor',
    office: 'Turing Hall, Rm 401',
    updatedAt: new Date().toISOString(),
    updatedBy: 'mcturing@campus.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'staff-2',
    name: 'Sarah Lovelace',
    email: 'slovelace@campus.edu',
    phone: '+1 (555) 431-2004',
    departmentId: 'dept-cs',
    title: 'Senior IT Support Technician',
    office: 'Turing Hall, Rm 105',
    updatedAt: new Date().toISOString(),
    updatedBy: 'slovelace@campus.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'staff-3',
    name: 'Prof. Grace Hopper',
    email: 'ghopper@campus.edu',
    phone: '+1 (555) 432-1002',
    departmentId: 'dept-cs',
    title: 'Associate Professor of Software Eng.',
    office: 'Turing Hall, Rm 412',
    updatedAt: new Date().toISOString(),
    updatedBy: 'ghopper@campus.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
  },

  // Admissions & Registrar
  {
    id: 'staff-4',
    name: 'Marcus Vance',
    email: 'mvance@campus.edu',
    phone: '+1 (555) 432-2110',
    departmentId: 'dept-adm',
    title: 'Director of Admissions',
    office: 'Student Services, Rm 112A',
    updatedAt: new Date().toISOString(),
    updatedBy: 'mvance@campus.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'staff-5',
    name: 'Emily Jenkins',
    email: 'ejenkins@campus.edu',
    phone: '+1 (555) 432-2115',
    departmentId: 'dept-adm',
    title: 'Registrar Coordinator',
    office: 'Student Services, Desk 4',
    updatedAt: new Date().toISOString(),
    updatedBy: 'ejenkins@campus.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },

  // Library
  {
    id: 'staff-6',
    name: 'Brooke Dewey',
    email: 'bdewey@campus.edu',
    phone: '+1 (555) 438-5020',
    departmentId: 'dept-lib',
    title: 'Head Librarian',
    office: 'Library Center Desk, Floor 2',
    updatedAt: new Date().toISOString(),
    updatedBy: 'bdewey@campus.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },

  // Athletics
  {
    id: 'staff-7',
    name: 'Coach Richard Falcon',
    email: 'rfalcon@campus.edu',
    phone: '+1 (555) 434-8800',
    departmentId: 'dept-ath',
    title: 'Athletics Coordinator & Head Coach',
    office: 'Gymnasium, Rm 12',
    updatedAt: new Date().toISOString(),
    updatedBy: 'rfalcon@campus.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
  },

  // Human Resources
  {
    id: 'staff-8',
    name: 'Deborah Vance',
    email: 'dvance@campus.edu',
    phone: '+1 (555) 431-9011',
    departmentId: 'dept-hr',
    title: 'HR Employee Relations Manager',
    office: 'Admin Building, Suite 302',
    updatedAt: new Date().toISOString(),
    updatedBy: 'dvance@campus.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },

  // Campus Security
  {
    id: 'staff-9',
    name: 'Officer John Spartan',
    email: 'jspartan@campus.edu',
    phone: '+1 (555) 435-9111',
    departmentId: 'dept-sec',
    title: 'Chief Safety Operations Officer',
    office: 'North Gatehouse, Main Desk',
    updatedAt: new Date().toISOString(),
    updatedBy: 'jspartan@campus.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  },

  // Academic Advising
  {
    id: 'staff-10',
    name: 'Sophia Wise',
    email: 'swise@campus.edu',
    phone: '+1 (555) 432-3510',
    departmentId: 'dept-adv',
    title: 'Senior Curriculum Advisor',
    office: 'Student Services, Rm 215',
    updatedAt: new Date().toISOString(),
    updatedBy: 'swise@campus.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  }
];
