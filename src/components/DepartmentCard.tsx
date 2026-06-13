import React from 'react';
import { Department, StaffMember } from '../types';
import * as LucideIcons from 'lucide-react';

interface DepartmentCardProps {
  key?: string;
  department: Department;
  staff: StaffMember[];
  isSelected: boolean;
  onSelect: () => void;
}

export default function DepartmentCard({ department, staff, isSelected, onSelect }: DepartmentCardProps) {
  // Count total staff
  const deptStaff = staff.filter(s => s.departmentId === department.id);

  // Resolve dynamic Lucide Icon
  const IconComponent = (LucideIcons as any)[department.iconName || 'Users'] || LucideIcons.Users;

  return (
    <button
      id={`dept-card-${department.id}`}
      onClick={onSelect}
      className={`relative w-full text-left p-4 rounded transition-all duration-205 border text-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 ${
        isSelected
          ? 'bg-blue-600 border-blue-600 text-white scale-[1.01]'
          : 'bg-white hover:bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-sm ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono border ${
          isSelected 
            ? 'bg-white/20 text-white border-white/20' 
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {department.code}
        </span>
      </div>

      <div className="mt-4">
        <h3 className={`font-bold text-xs leading-none line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
          {department.name}
        </h3>
        <p className={`text-[11px] mt-1.5 line-clamp-1 flex items-center gap-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
          <span>📍</span>
          <span>{department.building}</span>
        </p>
      </div>

      <div className="mt-3.5 pt-2.5 border-t flex justify-between items-center text-[11px] border-dashed border-current/20">
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
          <span className={isSelected ? 'text-blue-50' : 'text-slate-500'}>
            Verified directory
          </span>
        </div>
        <span className={`font-semibold font-mono ${isSelected ? 'text-white' : 'text-slate-700'}`}>
          {deptStaff.length} staff
        </span>
      </div>
    </button>
  );
}
