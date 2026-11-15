import React from 'react';
import { Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 shadow-xs">
          <Ban className="w-3.5 h-3.5 text-slate-500" />
          Cancelled
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Pending
        </span>
      );
  }
};

export default StatusBadge;
