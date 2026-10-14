import React from 'react';

export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const base = 'inline-flex items-center font-medium transition-colors font-mono';
  
  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px] rounded',
    sm: 'px-2 py-0.5 text-[11px] rounded-md',
    md: 'px-2.5 py-1 text-xs rounded-md font-semibold'
  };

  const variants = {
    default: 'bg-stone-100 text-stone-700 border border-stone-200',
    primary: 'bg-blue-50 text-blue-700 border border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    navy: 'bg-[#1E293B] text-white',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    teal: 'bg-teal-50 text-teal-800 border border-teal-200',
    outline: 'bg-white text-stone-700 border border-stone-300'
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
