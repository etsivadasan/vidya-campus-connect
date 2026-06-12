import { useState, useEffect, useMemo } from 'react';
import { 
  subscribeStaff, 
  subscribeDepartments, 
  isFirebaseActive,
  seedCloudDatabase
} from './lib/firebase';
import { StaffMember, Department } from './types';
import DepartmentCard from './components/DepartmentCard';
import StaffDetailsModal from './components/StaffDetailsModal';
import ManageDirectoryModal from './components/ManageDirectoryModal';

import { 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Wifi, 
  ChevronRight,
  Info,
  X,
  Globe,
  Grid,
  TrendingUp,
  AlertTriangle,
  Clock,
  Briefcase,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Tab Bar routing: 'directory' | 'departments' | 'stats'
  const [activeTab, setActiveTab] = useState<'directory' | 'departments' | 'stats'>('directory');
  
  // Selection and Search States
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  
  // Simulated Mobile Status Bar Time
  const [statusBarTime, setStatusBarTime] = useState('12:00 PM');
  
  // Connection Indicator
  const [connectionStatus, setConnectionStatus] = useState<'cloud' | 'simulation'>('simulation');

  // Trigger seeding of Cloud database if Cloud Mode is active
  useEffect(() => {
    if (isFirebaseActive) {
      setConnectionStatus('cloud');
      seedCloudDatabase();
    } else {
      setConnectionStatus('simulation');
    }
  }, []);

  // Update Status Bar standard hour/minute Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // structural 12-hour fallback
      setStatusBarTime(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to real-time sync feeds
  useEffect(() => {
    const unsubStaff = subscribeStaff((allStaff) => {
      setStaffList(allStaff);
    });

    const unsubDepts = subscribeDepartments((allDepts) => {
      setDepartments(allDepts);
    });

    return () => {
      unsubStaff();
      unsubDepts();
    };
  }, []);

  // Compute stats metrics dynamically
  const stats = useMemo(() => {
    const total = staffList.length;
    return { total };
  }, [staffList]);

  // Process fuzzy filters & search queries
  const filteredStaff = useMemo(() => {
    let list = [...staffList];

    // Filter by Selected Department
    if (selectedDeptId) {
      list = list.filter(person => person.departmentId === selectedDeptId);
    }

    // Filter by Query text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((person) => {
        const dept = departments.find(d => d.id === person.departmentId);
        return (
          person.name.toLowerCase().includes(q) ||
          person.title.toLowerCase().includes(q) ||
          person.phone.toLowerCase().includes(q) ||
          (person.office || '').toLowerCase().includes(q) ||
          person.email.toLowerCase().includes(q) ||
          (dept && dept.name.toLowerCase().includes(q)) ||
          (dept && dept.code.toLowerCase().includes(q))
        );
      });
    }

    // Sort alphabetically by name
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [staffList, selectedDeptId, searchQuery, departments]);



  // Quick helper to select dept from tab 2 and redirect
  const handleSelectDepartmentFromCard = (deptId: string) => {
    setSelectedDeptId(deptId);
    setActiveTab('directory');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-800 font-sans flex items-center justify-center p-0 sm:p-6 sm:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] sm:from-slate-850 sm:via-slate-900 sm:to-black">
      
      {/* High-fidelity mock smartphone wrapper - adapts to full screen on raw mobile viewports */}
      <div className="w-full sm:max-w-[410px] h-screen sm:h-[840px] bg-slate-50 flex flex-col sm:rounded-[36px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] sm:ring-[12px] sm:ring-slate-950 border-none relative overflow-hidden select-none">
        
        {/* Device Status Bar */}
        <header className="h-7 bg-slate-950 px-5 flex items-center justify-between text-[11px] text-white/90 font-medium shrink-0 tracking-tight z-20 select-none">
          <span className="font-semibold">{statusBarTime}</span>
          <div className="flex items-center gap-1.5">
            {connectionStatus === 'cloud' ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span className="text-[9px] font-bold tracking-widest font-mono">5G</span>
            <div className="w-4 h-2.5 bg-white/20 rounded-sm relative p-[1px] flex items-center">
              <div className="w-[10px] h-full bg-white rounded-2xs" />
              <span className="w-[1px] h-1 bg-white absolute top-[3px] -right-[2px] rounded-r-xs" />
            </div>
          </div>
        </header>

        {/* Brand App Bar / Navigation Header */}
        <div className="h-14 bg-slate-900 flex items-center justify-between px-4 shrink-0 text-white z-10 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white font-black text-sm">V</div>
            <div>
              <h1 className="text-white font-bold text-xs tracking-tight">VIDYA Campus Connect</h1>
              <span className="text-[8px] text-slate-400 font-mono uppercase tracking-widest block leading-none">Official Directory</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 font-sans">
            <a
              href="/campus-connect-source.zip"
              download="campus-connect-source.zip"
              className="p-1 px-2 border border-blue-800 bg-blue-900/40 hover:bg-blue-900/60 text-blue-200 hover:text-white rounded-md text-[9.5px] font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
              title="Download source code ZIP for Windows 11 compilation"
            >
              <Download className="w-2.5 h-2.5 text-blue-450" />
              <span>Export ZIP</span>
            </a>
            <button
              onClick={() => setIsManageOpen(true)}
              className="p-1 px-2 border border-slate-705 bg-slate-800 hover:bg-slate-750 text-slate-100 hover:text-white rounded-md text-[9.5px] font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
              title="Directory Admin Console"
            >
              <Briefcase className="w-2.5 h-2.5 text-blue-400" />
              <span>Admin</span>
            </button>
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/40 rounded-md border border-slate-950/20">
              <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'cloud' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
              <span className="text-[9px] font-bold font-mono tracking-wide text-slate-300 uppercase shrink-0 leading-none">
                {connectionStatus === 'cloud' ? 'Cloud' : 'Local'}
              </span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* VIEW BODY TABS LAYOUT */}
        {/* ---------------------------------------------------- */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          
          {/* TAB 1: DIRECTORY SCREEN */}
          {activeTab === 'directory' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Dense Sticky Search Section */}
              <div className="p-3.5 bg-white border-b border-slate-150 shadow-sm shrink-0 space-y-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400 m-0 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, room, extension..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-xs transition outline-none text-slate-900 placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Department Filter Selector - stacked on its own line for mobile usability */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono shrink-0">Department:</span>
                  <select
                    value={selectedDeptId || ''}
                    onChange={(e) => setSelectedDeptId(e.target.value || null)}
                    className="flex-1 min-w-0 bg-slate-50 border border-slate-200 text-slate-700 text-xs py-1.5 px-2 rounded-lg outline-none focus:bg-white focus:border-blue-400 font-semibold transition cursor-pointer"
                    title="Filter by Department"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>


              </div>

              {/* Department Active Filter Banner */}
              {selectedDeptId && (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-700 shrink-0">
                  <span className="truncate pr-4 font-medium flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Dept: {departments.find(d => d.id === selectedDeptId)?.name}
                  </span>
                  <button
                    onClick={() => setSelectedDeptId(null)}
                    className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 bg-white shadow-sm px-2 py-0.5 rounded border border-blue-150"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Dense List Content Scroll Area */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-bold uppercase tracking-wider">
                  <span>Contacts ({filteredStaff.length})</span>
                  {selectedDeptId && <span>Filtered</span>}
                </div>

                {filteredStaff.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-150 rounded-xl p-6 shadow-sm">
                    <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2.5">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">No profile matches</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try widening search terms or clearing status filters.</p>
                  </div>
                ) : (
                  filteredStaff.map((person) => {
                    const dept = departments.find(d => d.id === person.departmentId);

                    return (
                      <div
                        key={person.id}
                        id={`staff-item-${person.id}`}
                        onClick={() => setSelectedStaff(person)}
                        className="bg-white border border-slate-150 r-base p-3 px-3.5 rounded-xl shadow-sm hover:border-slate-300 active:bg-slate-50 transition flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Left Avatar block */}
                          <div className="relative shrink-0">
                            {person.avatarUrl ? (
                              <img
                                src={person.avatarUrl}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg font-bold flex items-center justify-center text-xs">
                                {person.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Profile textual lines */}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate leading-snug group-hover:text-blue-600 transition">
                              {person.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                              {person.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
                                {dept?.code || 'FAC'}
                              </span>
                              {person.office && (
                                <span className="text-[9px] text-slate-400">
                                  &bull; Rm {person.office}
                                </span>
                              )}
                              {person.phone && (
                                <span className="text-[9px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded font-mono font-bold ml-auto flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5" />
                                  {person.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Slide action icon */}
                        <div className="shrink-0 pl-2 text-slate-300 group-hover:text-slate-500 transition">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DEPARTMENTS GRID */}
          {activeTab === 'departments' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 bg-white border-b border-slate-150 shrink-0">
                <h3 className="font-bold text-sm text-slate-800">Org Departments</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Select a building department to list active college faculty.</p>
              </div>

              {/* Browse Scroll List */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {selectedDeptId && (
                  <button
                    onClick={() => setSelectedDeptId(null)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 rounded-lg border border-slate-200 transition"
                  >
                    Display All Departments Staff ({staffList.length})
                  </button>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {departments.map((dept) => (
                    <DepartmentCard
                      key={dept.id}
                      department={dept}
                      staff={staffList}
                      isSelected={selectedDeptId === dept.id}
                      onSelect={() => handleSelectDepartmentFromCard(dept.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATS & CAMPUS INFO */}
          {activeTab === 'stats' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 bg-white border-b border-slate-150 shrink-0">
                <h3 className="font-bold text-sm text-slate-800">Campus Status & Utilities</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Live index counts, hotlines, and cloud sync status.</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* Visual grid status counts */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Instructors Index</span>
                    <span className="text-xl font-bold text-slate-900 mt-1">{stats.total}</span>
                    <span className="text-[8.5px] text-slate-400 mt-1 leading-none font-sans">&bull; Active Faculty</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Departments</span>
                    <span className="text-xl font-bold text-blue-600 mt-1">{departments.length}</span>
                    <span className="text-[8.5px] text-slate-400 mt-1 leading-none font-sans">&bull; Campus Divisions</span>
                  </div>
                </div>

                {/* Hotlines Helpdesk and Quick Extensions */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono px-1">Campus Hotlines</h4>
                  
                  {/* Security Dial */}
                  <a
                    href="tel:911"
                    className="p-3 bg-red-50 border border-red-150 hover:bg-red-100 rounded-xl flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="text-left font-sans">
                        <p className="text-[11px] font-bold text-red-800">Campus Emergency Patrol</p>
                        <p className="text-[10px] text-red-500">Immediate response hot extension</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-600 pr-1 px-2 py-0.5 bg-red-100/50 rounded-md">Ext. 911</span>
                  </a>

                  {/* IT Service Dial */}
                  <a
                    href="tel:4000"
                    className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="text-left font-sans">
                        <p className="text-[11px] font-bold text-slate-800 font-sans">IT Helpdesk Support</p>
                        <p className="text-[10px] text-slate-400">System, network & account support</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 pr-1 px-2 py-0.5 bg-slate-100 rounded-md">Ext. 4000</span>
                  </a>
                </div>

                {/* Admin Management console access */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-750 text-white rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/15 text-blue-400 rounded-lg">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-sans">Directory Admin Console</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Add, Edit or Delete Campus profiles</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsManageOpen(true)}
                    className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Open Admin Console &rarr;
                  </button>
                </div>

                {/* System Infrastructure Card */}
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 pt-2 pr-2 text-white">
                    <Briefcase className="w-20 h-20" />
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 font-mono">Infrastructure Stack</p>
                  </div>
                  
                  <div className="mt-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Sync Engine</span>
                      <span className="font-bold text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-emerald-400 uppercase tracking-widest">
                        {connectionStatus === 'cloud' ? 'Google Firestore (Cloud)' : 'Local Offline Mode'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Campus Code</span>
                      <span className="font-semibold text-slate-300">CAMPUS-CONNECT-2026</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Database Status</span>
                      <span className="text-emerald-400 font-bold">&#10003; Online & Seeded</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* ---------------------------------------------------- */}
        {/* NATIVE BOTTOM NAVIGATION BAR */}
        {/* ---------------------------------------------------- */}
        <footer className="h-16 bg-white border-t border-slate-200/80 flex items-center justify-around shrink-0 pb-safe z-10 pt-1.5 px-4 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.06)] select-none">
          {/* TAB 1 Button */}
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
              activeTab === 'directory' ? 'text-blue-600 scale-102 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium tracking-tight">Directory</span>
          </button>

          {/* TAB 2 Button */}
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
              activeTab === 'departments' ? 'text-blue-600 scale-102 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Grid className="w-5 h-5" />
              {selectedDeptId && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-400" />
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium tracking-tight">Depts</span>
          </button>

          {/* TAB 3 Button */}
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
              activeTab === 'stats' ? 'text-blue-600 scale-102 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-1 font-medium tracking-tight">Utilities</span>
          </button>
        </footer>

      </div>

      {/* ---------------------------------------------------- */}
      {/* DIALOGS / SLIDEOVER MODALS */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {selectedStaff && (() => {
          const currentStaff = staffList.find(s => s.id === selectedStaff.id) || selectedStaff;
          return (
            <StaffDetailsModal
              staff={currentStaff}
              departments={departments}
              onClose={() => setSelectedStaff(null)}
            />
          );
        })()}
      </AnimatePresence>

      {/* Directory Management Overlay Portal */}
      {isManageOpen && (
        <ManageDirectoryModal
          staffList={staffList}
          departments={departments}
          onClose={() => setIsManageOpen(false)}
        />
      )}
    </div>
  );
}
