import { useState } from 'react';
import { StaffMember, Department } from '../types';
import { X, Phone, Mail, MapPin, Copy, Check, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { updateStaffMember } from '../lib/firebase';

interface StaffDetailsModalProps {
  staff: StaffMember;
  departments: Department[];
  onClose: () => void;
}

export default function StaffDetailsModal({ staff, departments, onClose }: StaffDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const dept = departments.find(d => d.id === staff.departmentId);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div 
      id="staff-details-backdrop" 
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'staff-details-backdrop') {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-md rounded-md shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Banner with Status Badge */}
        <div className="relative bg-slate-900 border-b border-slate-800 h-24 flex items-end justify-between px-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Center Overlap */}
        <div className="px-6 pb-6 pt-1">
          <div className="flex items-start gap-4 -mt-6 relative z-10">
            {staff.avatarUrl ? (
              <img
                src={staff.avatarUrl}
                alt={staff.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-sm object-cover border-4 border-white shadow bg-slate-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-sm bg-slate-200 border-4 border-white shadow flex items-center justify-center text-slate-400 font-bold text-xl">
                {staff.name.charAt(0)}
              </div>
            )}

            <div className="pt-6 flex-1">
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                {staff.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{staff.title}</p>
            </div>
          </div>

          {/* Department Code Pill */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[9px] font-bold uppercase tracking-wider border border-slate-200">
              💼 {dept?.name || 'Academic Faculty'}
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[9px] font-bold border border-slate-200">
              🏢 Bldg: {dept?.building.split(',')[0] || 'Main Campus'}
            </span>
          </div>



          {/* Contact Details Grid */}
          <div className="mt-5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Direct Contacts</h4>
            
            {/* Phone contact */}
            <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition group">
              <a href={`tel:${staff.phone}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase tracking-wide">Mobile Number</span>
                  <span className="text-xs font-bold text-slate-900 phone-number-span line-clamp-1">{staff.phone}</span>
                </div>
              </a>
              <div className="flex items-center gap-2 pr-1.5">
                <a 
                  href={`tel:${staff.phone}`}
                  className="px-2.5 py-1 text-[10px] bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-md shadow-sm transition tracking-tight shrink-0"
                  title="Make call"
                >
                  Call
                </a>
                <button
                  onClick={() => copyToClipboard(staff.phone, 'phone')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition duration-150 shrink-0"
                  title="Copy number to clipboard"
                >
                  {copiedField === 'phone' ? (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 font-sans">
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Email contact */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded transition">
              <a href={`mailto:${staff.email}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-sm">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-[9px] text-slate-400 block font-mono">Send Email</span>
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1 font-mono">{staff.email}</span>
                </div>
              </a>
              <button
                onClick={() => copyToClipboard(staff.email, 'email')}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition"
                title="Copy email"
              >
                {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Office maps pin */}
            {staff.office && (
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-sm">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-[9px] text-slate-400 block font-mono">Office Suite</span>
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">{staff.office}</span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(staff.office || '', 'office')}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition"
                  title="Copy office"
                >
                  {copiedField === 'office' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* User Guide Tip */}
          <div className="mt-4 bg-slate-50 border border-slate-150 p-3 rounded-lg flex items-start gap-2">
            <span className="text-xs shrink-0 select-none">💡</span>
            <p className="text-[10px] leading-relaxed text-slate-500 font-medium font-sans">
              Tap <strong className="text-slate-700">Call</strong> on any card to automatically trigger your device's native telephone dialer. Tap the <strong className="text-slate-700">Copy</strong> icon to instantly copy the mobile number to your device's clipboard so you can note it down easily.
            </p>
          </div>

          {/* Quick Footer Metadata */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono tracking-wider">
            <span>Last change updated:</span>
            <span>{formattedDate(staff.updatedAt)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
