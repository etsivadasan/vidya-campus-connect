import React, { useState, useEffect, useMemo } from 'react';
import { StaffMember, Department } from '../types';
import { 
  updateStaffMember, 
  deleteStaffMember, 
  addDepartment, 
  deleteDepartment,
  auth,
  isFirebaseActive,
  signInWithGoogle,
  signOutUser
} from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  UserPlus, 
  Building, 
  Briefcase, 
  FolderPlus, 
  Save, 
  ArrowLeft,
  ChevronRight,
  Shield,
  Search,
  ExternalLink,
  Upload,
  Camera,
  Image as ImageIcon,
  Download
} from 'lucide-react';

interface ManageDirectoryModalProps {
  staffList: StaffMember[];
  departments: Department[];
  onClose: () => void;
}

const CONSTANT_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
];

export default function ManageDirectoryModal({ staffList, departments, onClose }: ManageDirectoryModalProps) {
  // Session User Authentication States
  const [sessionUser, setSessionUser] = useState<{ email: string; name: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (isFirebaseActive && auth) {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user) {
          const u = {
            email: user.email || '',
            name: user.displayName || user.email || 'Admin Staff'
          };
          setSessionUser(u);
          localStorage.setItem('campus_directory_sim_user', JSON.stringify(u));
        } else {
          setSessionUser(null);
        }
        setIsAuthLoading(false);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('campus_directory_auth_change'));
      });
      return () => unsub();
    } else {
      const getSim = () => {
        const dummyUser = localStorage.getItem('campus_directory_sim_user');
        setSessionUser(dummyUser ? JSON.parse(dummyUser) : null);
        setIsAuthLoading(false);
      };
      getSim();
      const handleStorage = () => getSim();
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
  }, []);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Failed to authenticate via Google.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSimulatedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginEmail.trim()) {
      setAuthError('Please enter your campus email address.');
      return;
    }
    if (loginPasscode !== '1234' && loginPasscode !== 'campus2026') {
      setAuthError('Invalid passcode. Use demo code "1234" or "campus2026".');
      return;
    }
    const user = {
      email: loginEmail.trim().toLowerCase(),
      name: loginEmail.trim().split('@')[0].toUpperCase().replace('.', ' ') + ' (Coordinator)'
    };
    localStorage.setItem('campus_directory_sim_user', JSON.stringify(user));
    setSessionUser(user);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campus_directory_auth_change'));
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      localStorage.removeItem('campus_directory_sim_user');
      setSessionUser(null);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('campus_directory_auth_change'));
    } catch (err) {
      console.error(err);
    }
  };

  const [activeTab, setActiveTab] = useState<'staff' | 'depts'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  
  // CSV Bulk Management states
  const [csvPanelOpen, setCsvPanelOpen] = useState(false);
  const [csvError, setCsvError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState('');

  const downloadCsvTemplate = () => {
    const headers = 'Full Name,Affiliation Or Job Title,Assigned Department Code,Official Email,Mobile Number,Office Lab Or Room Number,Photo URL';
    const row1 = 'Dr. Alan McTuring,Professor of Computer Science,CSIT,mcturing@campus.edu,+1 (555) 432-1001,"Turing Hall, Rm 401",https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format';
    const row2 = 'Sarah Lovelace,Senior IT Support Technician,CSIT,slovelace@campus.edu,+1 (555) 431-2004,"Turing Hall, Rm 105",https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format';
    const row3 = 'Dr. Evelyn Boyd,Associate Professor of Mathematics,,eboyd@campus.edu,+1 (555) 432-1005,,https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format';
    const csvContent = `${headers}\n${row1}\n${row2}\n${row3}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', 'VIDYA_Campus_Connect_Directory_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError('');
    setCsvSuccess('');
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onerror = () => {
      setCsvError('Failed to read selected CSV file.');
    };
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) {
        setCsvError('CSV file is empty or corrupted.');
        return;
      }
      
      try {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) {
          setCsvError('The CSV file does not contain any faculty data lines.');
          return;
        }
        
        // Match headers (case-insensitive fuzzy match)
        const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        
        const findIndex = (aliases: string[]) => {
          return rawHeaders.findIndex(h => aliases.some(alias => h.includes(alias)));
        };
        
        const nameIdx = findIndex(['name', 'full', 'full name', 'fullname']);
        const titleIdx = findIndex(['title', 'job', 'affiliation', 'role', 'job title', 'affiliation or job title']);
        const deptIdx = findIndex(['dept', 'department', 'code', 'department code', 'assigned department']);
        const emailIdx = findIndex(['email', 'mail', 'official email']);
        const phoneIdx = findIndex(['phone', 'mobile', 'cell', 'mobile number']);
        const officeIdx = findIndex(['office', 'room', 'lab', 'room number', 'office lab']);
        const avatarIdx = findIndex(['avatar', 'photo', 'image', 'url', 'photo url']);
        
        if (nameIdx === -1 || emailIdx === -1) {
          setCsvError('Critical Header Missing! CSV must contain columns for "Full Name" and "Official Email".');
          return;
        }
        
        // Parse row lines Helper supporting quotes
        const parseLine = (line: string) => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };
        
        let successCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
          const rowValues = parseLine(lines[i]);
          if (rowValues.length < 2) continue; // skip blank line
          
          const name = rowValues[nameIdx];
          const email = rowValues[emailIdx];
          if (!name || !email) continue;
          
          const title = titleIdx !== -1 && rowValues[titleIdx] ? rowValues[titleIdx] : 'Campus Faculty';
          const deptCodeVal = deptIdx !== -1 && rowValues[deptIdx] ? rowValues[deptIdx].trim().toUpperCase() : '';
          
          // Try to lookup department match by code (e.g. CSIT, REC) or name
          let deptIdMatch = '';
          if (deptCodeVal) {
            const foundDept = departments.find(d => 
              d.code === deptCodeVal || 
              d.name.toLowerCase().includes(deptCodeVal.toLowerCase())
            );
            if (foundDept) {
              deptIdMatch = foundDept.id;
            }
          }
          
          const phone = phoneIdx !== -1 && rowValues[phoneIdx] ? rowValues[phoneIdx] : '+1 (555) 431-0010';
          const office = officeIdx !== -1 && rowValues[officeIdx] ? rowValues[officeIdx] : '';
          const avatarUrl = avatarIdx !== -1 && rowValues[avatarIdx] ? rowValues[avatarIdx] : '';
          
          const id = 'staff-' + Math.random().toString(36).substring(2, 9);
          
          const importedMember: StaffMember = {
            id,
            name,
            email,
            phone,
            departmentId: deptIdMatch,
            title,
            office: office || undefined,
            avatarUrl: avatarUrl || undefined,
            updatedAt: new Date().toISOString()
          };
          
          await updateStaffMember(importedMember, 'Bulk Spreadsheet import coordinator session');
          successCount++;
        }
        
        setCsvSuccess(`Successfully processed & imported ${successCount} campus faculty profiles!`);
        showFeedback('success', `CSV: Loaded ${successCount} profiles.`);
        if (e.target) e.target.value = ''; // reset uploader
      } catch (err: any) {
        setCsvError('Parsing Error: Could not parse CSV rows successfully.');
      }
    };
    reader.readAsText(file);
  };

  // Form modes: 'list' | 'add_staff' | 'edit_staff' | 'add_dept' | 'edit_dept'
  const [formMode, setFormMode] = useState<'list' | 'add_staff' | 'edit_staff' | 'add_dept' | 'edit_dept'>('list');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  // Custom confirmation modal state to avoid native window.confirm blocked inside iframe
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'staff' | 'dept';
    id: string;
    name: string;
    relatedCount?: number;
  } | null>(null);

  // Staff Form state
  const [staffId, setStaffId] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffDept, setStaffDept] = useState('');
  const [staffTitle, setStaffTitle] = useState('');
  const [staffOffice, setStaffOffice] = useState('');
  const [staffAvatar, setStaffAvatar] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Department Form state
  const [deptId, setDeptId] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptBuilding, setDeptBuilding] = useState('');

  // Filters staff inside management tab
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.office || '').toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [staffList, searchQuery]);

  // Filters departments inside management tab
  const sortedDepts = useMemo(() => {
    return [...departments].sort((a, b) => a.name.localeCompare(b.name));
  }, [departments]);

  // Triggers feedback message helper
  const showFeedback = (status: 'success' | 'error', msg: string) => {
    setSaveStatus(status);
    setStatusMsg(msg);
    setTimeout(() => {
      setSaveStatus('idle');
      setStatusMsg('');
    }, 2500);
  };

  // Reset forms
  const resetStaffForm = () => {
    setStaffId('');
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    setStaffDept(departments[0]?.id || '');
    setStaffTitle('');
    setStaffOffice('');
    setStaffAvatar(CONSTANT_AVATARS[Math.floor(Math.random() * CONSTANT_AVATARS.length)]);
  };

  const resetDeptForm = () => {
    setDeptId('');
    setDeptName('');
    setDeptCode('');
    setDeptBuilding('');
  };

  // Switch to Add Staff view
  const triggerAddStaff = () => {
    resetStaffForm();
    setFormMode('add_staff');
  };

  // Switch to Edit Staff view
  const triggerEditStaff = (member: StaffMember) => {
    setStaffId(member.id);
    setStaffName(member.name);
    setStaffEmail(member.email);
    setStaffPhone(member.phone);
    setStaffDept(member.departmentId);
    setStaffTitle(member.title);
    setStaffOffice(member.office);
    setStaffAvatar(member.avatarUrl || '');
    setFormMode('edit_staff');
  };

  // Handle local photo upload processing (resizing and optimizing via canvas)
  const handlePhotoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Please select an image file (PNG, JPG, etc.)');
      return;
    }
    
    setIsUploading(true);
    const reader = new FileReader();
    reader.onerror = () => {
      showFeedback('error', 'Error reading selected photo file.');
      setIsUploading(false);
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        showFeedback('error', 'Selected file is not a valid image.');
        setIsUploading(false);
      };
      img.onload = () => {
        try {
          // Downsize to maximum 250x250 for efficient Firestore storage
          const maxDim = 250;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress as JPEG to make sure the data URI stays very small (usually ~10-25 KB)
            const base64Str = canvas.toDataURL('image/jpeg', 0.8);
            setStaffAvatar(base64Str);
            showFeedback('success', 'Custom photo loaded. Save profile to write changes.');
          } else {
            // Fallback
            setStaffAvatar(event.target?.result as string);
            showFeedback('success', 'Custom photo loaded.');
          }
        } catch (e) {
          showFeedback('error', 'Failed to process custom photo.');
        } finally {
          setIsUploading(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePhotoUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle Staff Save
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim() || !staffPhone.trim() || !staffTitle.trim()) {
      showFeedback('error', 'Name, email, phone, and job title are required.');
      return;
    }

    setSaveStatus('saving');
    const id = staffId || 'staff-' + Math.random().toString(36).substring(2, 9);
    
    const newMember: StaffMember = {
      id,
      name: staffName.trim(),
      email: staffEmail.trim(),
      phone: staffPhone.trim(),
      departmentId: staffDept,
      title: staffTitle.trim(),
      office: staffOffice.trim() || undefined,
      avatarUrl: staffAvatar.trim() || undefined,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateStaffMember(newMember, staffId ? 'Edited Profile via Directory Console' : 'Created New Profile in Directory Console');
      showFeedback('success', staffId ? 'Profile updated successfully!' : 'New Profile created successfully!');
      setFormMode('list');
    } catch (err) {
      showFeedback('error', 'Database write error occurred.');
    }
  };

  // Handle Staff Delete (No window.confirm to avoid iframe sandbox blocking policies)
  const handleDeleteStaff = async (id: string, name: string) => {
    setSaveStatus('saving');
    try {
      await deleteStaffMember(id);
      showFeedback('success', `${name} deleted successfully.`);
      if (formMode !== 'list') setFormMode('list');
    } catch (err) {
      showFeedback('error', 'Could not delete staff member.');
    }
  };

  // Switch to Add Dept view
  const triggerAddDept = () => {
    resetDeptForm();
    setFormMode('add_dept');
  };

  // Switch to Edit Dept view
  const triggerEditDept = (dept: Department) => {
    setDeptId(dept.id);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptBuilding(dept.building);
    setFormMode('edit_dept');
  };

  // Handle Dept Save
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim() || !deptBuilding.trim()) {
      showFeedback('error', 'All fields are required');
      return;
    }

    setSaveStatus('saving');
    const id = deptId || 'dept-' + Math.random().toString(36).substring(2, 9);
    const newDept: Department = {
      id,
      name: deptName.trim(),
      code: deptCode.toUpperCase().trim(),
      building: deptBuilding.trim()
    };

    try {
      await addDepartment(newDept);
      showFeedback('success', deptId ? 'Department updated successfully!' : 'New Department created!');
      setFormMode('list');
    } catch (err) {
      showFeedback('error', 'Could not save the department.');
    }
  };

  // Handle Dept Delete (No window.confirm to avoid iframe sandbox blocking policies)
  const handleDeleteDept = async (id: string, name: string) => {
    setSaveStatus('saving');
    try {
      const relatedStaffCount = staffList.filter(s => s.departmentId === id).length;
      if (relatedStaffCount > 0) {
        // Find and reassign all staff in this department to ""
        const staffToUpdate = staffList.filter(s => s.departmentId === id);
        for (const staff of staffToUpdate) {
          const updatedStaff: StaffMember = {
            ...staff,
            departmentId: ''
          };
          await updateStaffMember(updatedStaff, `Department "${name}" was deleted. Profile reassigned to Unassigned.`);
        }
      }

      await deleteDepartment(id);
      showFeedback('success', `Department "${name}" deleted and personnel reassigned successfully.`);
      if (formMode !== 'list') setFormMode('list');
    } catch (err) {
      showFeedback('error', 'Could not delete the department.');
    }
  };

  if (isAuthLoading) {
    return (
      <div id="manage-directory-modal-overlay" className="absolute inset-0 bg-slate-950/80 overflow-hidden flex items-center justify-center z-45 max-sm:rounded-none">
        <div className="flex flex-col items-center gap-3 bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm w-full mx-4 shadow-xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-xs font-mono">Securing channel...</span>
        </div>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div id="manage-directory-modal-overlay" className="absolute inset-0 bg-slate-950/85 overflow-hidden flex items-center justify-center z-45 max-sm:rounded-none p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
          
          {/* Close button */}
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top visual brand */}
          <div className="p-6 pb-2 text-center">
            <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-slate-100 font-bold text-base tracking-tight">Staff Authentication Portal</h3>
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block mt-1">VIDYA Campus Connect</span>
          </div>

          <div className="px-6 py-4 flex-1">
            <p className="text-slate-400 text-xs text-center leading-relaxed mb-6 bg-slate-950/45 border border-slate-850 p-3 rounded-lg font-medium">
              This space requires active staff credentials. Google Play Store users and general viewers have restricted, read-only directory access.
            </p>

            {isFirebaseActive ? (
              /* Firebase Auth - Active Cloud Mode */
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isAuthenticating}
                  className="w-full h-11 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer border border-slate-200"
                >
                  {isAuthenticating ? (
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6a5.64 5.64 0 0 1-2.45 3.7v3.08h3.95c2.3-2.1 3.64-5.2 3.64-8.61z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.95-3.08c-1.1.75-2.5 1.2-3.98 1.2-3.06 0-5.64-2.07-6.57-4.85H1.47v3.19C3.44 21.43 7.42 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.43 14.36A7.16 7.16 0 0 1 5 12c0-.83.14-1.64.43-2.36V6.45H1.47A11.96 11.96 0 0 0 0 12c0 2.1.55 4.09 1.47 5.55l3.96-3.19z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.92 1.19 15.21 0 12 0 7.42 0 3.44 2.57 1.47 6.45l3.96 3.19c.93-2.78 3.51-4.87 6.57-4.87z"
                      />
                    </svg>
                  )}
                  <span>Sign In with Google</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center leading-normal mt-2">
                  Access is synced securely using Google single sign-on.
                </p>
              </div>
            ) : (
              /* Simulated Mode Passcode Entry */
              <form onSubmit={handleSimulatedLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">Campus Staff Email</label>
                  <input
                    type="email"
                    required
                    placeholder="coordinator@vidya.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 text-xs rounded-xl outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider font-sans">Passcode</label>
                    <span className="text-[9px] text-slate-500 font-medium">Demo: 1234</span>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Enter staff security code"
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 text-xs rounded-xl outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-10 mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Authenticate Session</span>
                </button>
              </form>
            )}

            {authError && (
              <div className="mt-4 p-2.5 bg-rose-900/20 border border-rose-900/30 text-rose-400 text-[10.5px] rounded-xl text-center font-semibold">
                {authError}
              </div>
            )}
          </div>

          <div className="bg-slate-950/40 p-4 border-t border-slate-850 text-center">
            <span className="text-[9px] text-slate-500 block">Restricted Campus Network Console</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div id="manage-directory-modal-overlay" className="absolute inset-0 bg-slate-950/80 overflow-hidden flex flex-col z-45 max-sm:rounded-none">
      
      {/* Top action header */}
      <div className="bg-slate-900 border-b border-slate-800 h-14 flex items-center justify-between px-4 text-white shrink-0">
        <div className="flex items-center gap-2">
          {formMode !== 'list' ? (
            <button 
              onClick={() => setFormMode('list')}
              className="p-1 px-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md flex items-center gap-1 text-xs transition font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-xs tracking-tight uppercase font-mono text-orange-400">Directory Console</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2.5">
          {sessionUser && (
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-[10px] font-bold text-slate-300 leading-none">{sessionUser.name.split(' ')[0]}</span>
              <span className="text-[8px] text-slate-500 font-mono leading-none mt-0.5">{sessionUser.email}</span>
            </div>
          )}
          {sessionUser && (
            <a
              href="/campus-connect-source.zip"
              download="campus-connect-source.zip"
              className="p-1 px-2 border border-blue-800 bg-blue-900/40 hover:bg-blue-900/60 text-blue-200 hover:text-white rounded-md text-[9.5px] font-bold flex items-center gap-1 transition shadow-sm cursor-pointer mr-1"
              title="Download source code ZIP for offline devices"
            >
              <Download className="w-2.5 h-2.5 text-blue-400" />
              <span>Export ZIP</span>
            </a>
          )}
          {sessionUser && (
            <button
              onClick={handleSignOut}
              className="p-1 px-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer mr-2.5"
              title="Sign Out Admin"
            >
              Sign Out
            </button>
          )}
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Exit Admin Console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Sub-Nav Bar - Only visible in List Mode */}
      {formMode === 'list' && (
        <div className="bg-slate-850 h-10 border-b border-slate-850 flex items-center px-2 shrink-0 select-none">
          <button
            onClick={() => { setActiveTab('staff'); setSearchQuery(''); }}
            className={`flex-1 h-full font-bold text-[10px] uppercase tracking-wider transition ${
              activeTab === 'staff' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'
            }`}
          >
            Manage Staff ({staffList.length})
          </button>
          <button
            onClick={() => { setActiveTab('depts'); setSearchQuery(''); }}
            className={`flex-1 h-full font-bold text-[10px] uppercase tracking-wider transition ${
              activeTab === 'depts' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'
            }`}
          >
            Manage Depts ({departments.length})
          </button>
        </div>
      )}

      {/* Dynamic Feedback Toaster Status banner */}
      {saveStatus !== 'idle' && (
        <div className={`p-2.5 text-center text-xs font-bold text-white tracking-wide shrink-0 ${
          saveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 
          saveStatus === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {saveStatus === 'saving' ? 'Saving changes to cloud...' : statusMsg}
        </div>
      )}

      {/* MAIN BODY SCROLL AREA */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4">

        {/* -------------------------------------------------------------------- */}
        {/* VIEW A: LISTING MODE (DIRECTORY OR DEPARTMENTS) */}
        {/* -------------------------------------------------------------------- */}
        {formMode === 'list' && (
          <div className="space-y-4">
            
            {/* SEARCH AND ADD ACTION ROW */}
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder={activeTab === 'staff' ? "Search contacts to edit..." : "Filter departments..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-250 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 rounded-lg text-xs outline-none text-slate-800 transition shadow-xs"
                />
              </div>
              
              {activeTab === 'staff' ? (
                <button
                  onClick={triggerAddStaff}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-[11px] font-bold shadow-sm transition tracking-tight shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Staff
                </button>
              ) : (
                <button
                  onClick={triggerAddDept}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-[11px] font-bold shadow-sm transition tracking-tight shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Dept
                </button>
              )}
            </div>

            {/* BULK CSV IMPORT SUBPANEL (ACCORDION STYLE) */}
            {activeTab === 'staff' && (
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
                <div 
                  onClick={() => setCsvPanelOpen(!csvPanelOpen)}
                  className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-700 leading-none select-none"
                >
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Excel / CSV Bulk Importer</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${csvPanelOpen ? 'rotate-90' : ''}`} />
                </div>
                
                {csvPanelOpen && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-2 font-sans animate-in fade-in duration-150">
                    <p className="leading-normal">
                      Organize your campus contacts in Microsoft Excel, Google Sheets, or any table editor. Ensure headers match the columns below, export as <strong>CSV</strong>, and upload below.
                    </p>
                    
                    {/* Columns pill description */}
                    <div className="flex flex-wrap gap-1 py-1">
                      {['Full Name', 'Affiliation or Job Title', 'Assigned Department Code', 'Official Email', 'Mobile Number', 'Office Lab Or Room Number (Optional)', 'Photo URL (Optional)'].map((col) => (
                        <span key={col} className="text-[9px] bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded border border-slate-150 font-medium font-mono leading-none">
                          {col}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1 font-sans">
                      <button
                        type="button"
                        onClick={downloadCsvTemplate}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-150 text-blue-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-blue-600" />
                        Download Excel Sample
                      </button>

                      <label className="p-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer relative">
                        <Upload className="w-3 h-3 text-slate-600" />
                        <span>Upload Completed CSV</span>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleCsvImport}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </label>
                    </div>

                    {csvError && (
                      <div className="p-2 bg-rose-50 border border-rose-150 text-rose-600 text-[10px] font-semibold rounded-lg mt-1.5 font-sans">
                        ⚠️ {csvError}
                      </div>
                    )}

                    {csvSuccess && (
                      <div className="p-2 bg-emerald-50 border border-emerald-150 text-emerald-600 text-[10px] font-semibold rounded-lg mt-1.5 font-sans">
                        ✓ {csvSuccess}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB : STAFF REGISTER LIST */}
            {activeTab === 'staff' && (
              <div className="space-y-2">
                {filteredStaff.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-semibold bg-white rounded-xl border border-dashed border-slate-300 p-6">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  filteredStaff.map((person) => {
                    const dept = departments.find(d => d.id === person.departmentId);
                    return (
                      <div 
                        key={person.id}
                        className="bg-white border border-slate-200 hover:border-slate-300 p-3 px-3.5 rounded-xl shadow-xs flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {person.avatarUrl ? (
                            <img 
                              src={person.avatarUrl} 
                              alt="" 
                              className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0" 
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                              {person.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{person.name}</h4>
                            <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{person.title}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[8px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-1 rounded">
                                {dept?.code || 'FAC'}
                              </span>
                              {person.office && (
                                <span className="text-[8px] text-slate-400 font-mono">
                                  Office: {person.office}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Edit & Delete Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => triggerEditStaff(person)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                            title="Edit profile details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'staff', id: person.id, name: person.name })}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                            title="Delete profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB : DEPARTMENTS GRID */}
            {activeTab === 'depts' && (
              <div className="grid grid-cols-1 gap-2.5">
                {sortedDepts.map((dept) => {
                  const personnelCount = staffList.filter(s => s.departmentId === dept.id).length;
                  return (
                    <div 
                      key={dept.id}
                      className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[10px] bg-blue-50 font-bold text-blue-600 px-1.5 py-0.5 rounded font-mono">
                            {dept.code}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 truncate">{dept.name}</h4>
                        </div>
                        <p className="text-[10px] font-sans text-slate-400 mt-1 truncate">
                          🏢 {dept.building}
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 mt-0.5">
                          &bull; Assigned personnel count: {personnelCount} staff
                        </p>
                      </div>

                      <div className="flex items-center gap-1 pl-2">
                        <button
                          onClick={() => triggerEditDept(dept)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          title="Edit Department"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'dept', id: dept.id, name: dept.name, relatedCount: personnelCount })}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title={`Delete Department (${personnelCount} staff will be unassigned)`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* VIEW B: ADD / EDIT STAFF MEMBER FORM */}
        {/* -------------------------------------------------------------------- */}
        {(formMode === 'add_staff' || formMode === 'edit_staff') && (
          <form onSubmit={handleSaveStaff} className="space-y-4 font-sans max-w-md mx-auto">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" />
                {formMode === 'add_staff' ? 'New Staff Profile' : 'Modify Staff Profile'}
              </h3>

              {/* Avatar Selector Block */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5 font-mono">Profile Image</label>
                <div className="flex items-center gap-3">
                  <div className="shrink-0 relative">
                    {staffAvatar ? (
                      <div className="relative group">
                        <img 
                          src={staffAvatar} 
                          alt="Preview" 
                          className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 bg-slate-50" 
                        />
                        <button
                          type="button"
                          onClick={() => setStaffAvatar('')}
                          className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center hover:bg-slate-900 transition"
                          title="Remove custom photo"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-lg font-bold border-2 border-dashed border-slate-250">
                        <Camera className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-500 leading-tight mb-2 font-sans">
                      Upload from your machine, drag image here, or choose a preset:
                    </p>
                    
                    {/* Visual presets row */}
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 shrink-0">
                      {CONSTANT_AVATARS.slice(0, 5).map((src, idx) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setStaffAvatar(src)}
                          className={`w-7 h-7 rounded-md overflow-hidden shrink-0 border-2 transition ${
                            staffAvatar === src ? 'border-blue-600 scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img src={src} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Drag-and-drop & Select Area */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-photo-input')?.click()}
                  className={`mt-2.5 p-3.5 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50/40 text-blue-600' 
                      : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="file" 
                    id="file-photo-input" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handlePhotoUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden" 
                  />
                  
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-650 font-mono animate-pulse">
                      <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                      Optimizing photo...
                    </div>
                  ) : (
                    <>
                      <Upload className={`w-5 h-5 mb-1 ${isDragging ? 'text-blue-550 animate-bounce' : 'text-slate-450'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider font-sans block">
                        Select / Drop Photo File
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        JPEG/PNG (re-scaled dynamically for speed)
                      </span>
                    </>
                  )}
                </div>

                {/* Fallback Custom URL Input */}
                <div className="relative flex items-center mt-2">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    placeholder="Or paste secure image URL (https://...)"
                    value={staffAvatar}
                    onChange={(e) => setStaffAvatar(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 focus:border-blue-400 text-xs rounded-lg outline-none text-slate-800 transition"
                  />
                </div>
              </div>

              {/* Direct inputs */}
              <div className="grid grid-cols-1 gap-3 mt-2">
                
                {/* Full name */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block font-mono">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Foster"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-250 focus:bg-white focus:border-blue-500 text-xs rounded-lg outline-none text-slate-800 transition shadow-inner"
                  />
                </div>

                {/* Job Title */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block font-mono">Affiliation or Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assistant Professor / Lead Secretary"
                    value={staffTitle}
                    onChange={(e) => setStaffTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-250 focus:bg-white focus:border-blue-500 text-xs rounded-lg outline-none text-slate-800 transition shadow-inner"
                  />
                </div>

                 {/* Department */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block font-mono">Assigned Department</label>
                  <select
                    value={staffDept}
                    onChange={(e) => setStaffDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 focus:bg-white text-xs rounded-lg outline-none cursor-pointer text-slate-800 transition"
                  >
                    <option value="">Unassigned / General Affiliated</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block font-mono">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jfoster@campus.edu"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-250 focus:bg-white focus:border-blue-500 text-xs rounded-lg outline-none text-slate-800 transition shadow-inner"
                  />
                </div>

                {/* Mobile / Phone */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block font-mono">Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +1 (555) 432-6011"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-250 focus:bg-white focus:border-blue-500 text-xs rounded-lg outline-none text-slate-800 transition shadow-inner"
                  />
                </div>

                {/* Room Office Location */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block font-mono">Office Lab / Room Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Science Suite, Rm 204B"
                    value={staffOffice}
                    onChange={(e) => setStaffOffice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-250 focus:bg-white focus:border-blue-500 text-xs rounded-lg outline-none text-slate-800 transition shadow-inner"
                  />
                </div>



              </div>

              {/* Cancel / Submit Buttons */}
              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormMode('list')}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Save className="w-3.5 h-3.5" /> Save Profile
                </button>
              </div>

              {formMode === 'edit_staff' && (
                <div className="border-t border-red-100 pt-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ type: 'staff', id: staffId, name: staffName })}
                    className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] rounded-lg border border-red-200 uppercase tracking-wider transition"
                  >
                    Delete Staff Record
                  </button>
                </div>
              )}
            </div>

          </form>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* VIEW C: ADD / EDIT DEPARTMENT FORM */}
        {/* -------------------------------------------------------------------- */}
        {(formMode === 'add_dept' || formMode === 'edit_dept') && (
          <form onSubmit={handleSaveDept} className="space-y-4 font-sans max-w-md mx-auto">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-600" />
                {formMode === 'add_dept' ? 'New College Department' : 'Modify College Department'}
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {/* Department Name */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block font-mono">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Department of Mechanical Engineering"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-250 focus:bg-white focus:border-blue-500 text-xs rounded-lg outline-none text-slate-800 transition shadow-inner"
                  />
                </div>

                {/* Department Short Code */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block font-mono">Short Code / Tag (e.g. MECH)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="e.g. MECH"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-250 focus:bg-white focus:border-blue-500 text-xs rounded-lg outline-none text-slate-800 uppercase tracking-widest transition shadow-inner"
                  />
                </div>

                {/* Office Building / Campus Address */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block font-mono">Building & Campus Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering Block B, Floor 2"
                    value={deptBuilding}
                    onChange={(e) => setDeptBuilding(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-250 focus:bg-white focus:border-blue-500 text-xs rounded-lg outline-none text-slate-800 transition shadow-inner"
                  />
                </div>
              </div>

              {/* Save Controls */}
              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormMode('list')}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Save className="w-3.5 h-3.5" /> Save Dept
                </button>
              </div>

              {formMode === 'edit_dept' && (
                <div className="border-t border-red-100 pt-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const personnelCount = staffList.filter(s => s.departmentId === deptId).length;
                      setDeleteConfirm({ type: 'dept', id: deptId, name: deptName, relatedCount: personnelCount });
                    }}
                    className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] rounded-lg border border-red-200 uppercase tracking-wider transition"
                  >
                    Delete Department
                  </button>
                </div>
              )}
            </div>

          </form>
        )}

      </div>

      {/* Absolute Confirmation Alert Modal Overlay */}
      {deleteConfirm && (
        <div id="delete-confirm-overlay" className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5 font-sans">
              <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">!</span>
              Are you absolutely sure?
            </h4>
            
            {deleteConfirm.type === 'staff' ? (
              <p className="text-xs text-slate-600 leading-relaxed font-sans mb-4">
                You are about to permanently delete the staff member profile for <strong className="text-slate-800 font-bold">"{deleteConfirm.name}"</strong>. This action is irreversible. All associated contact records will be removed.
              </p>
            ) : (
              <div className="text-xs text-slate-600 leading-relaxed font-sans mb-4 space-y-2">
                <p>
                  You are about to permanently delete the department <strong className="text-slate-800 font-bold">"{deleteConfirm.name}"</strong>.
                </p>
                {deleteConfirm.relatedCount && deleteConfirm.relatedCount > 0 ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg text-[11px] font-sans leading-relaxed">
                    <strong>Warning:</strong> There are currently <strong>{deleteConfirm.relatedCount} staff member(s)</strong> assigned to this department. If you proceed, they will automatically be set to <strong>"Unassigned"</strong>.
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">This department has no assigned personnel and can be deleted cleanly.</p>
                )}
              </div>
            )}

            <div className="flex gap-2.5 pt-1.5">
              <button
                type="button"
                id="delete-confirm-cancel-btn"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="delete-confirm-action-btn"
                onClick={async () => {
                  const { type, id, name } = deleteConfirm;
                  setDeleteConfirm(null);
                  if (type === 'staff') {
                     await handleDeleteStaff(id, name);
                  } else {
                     await handleDeleteDept(id, name);
                  }
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
