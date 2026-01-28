import React from 'react';

const InfoTooltip = ({ title, text }) => {
  return (
    <div className="relative inline-block ml-2 group z-10">
      {/* 1. IKON 'i' (Circle) */}
      <div className="w-5 h-5 rounded-full border border-gray-500 text-gray-500 flex items-center justify-center text-xs font-serif italic cursor-help hover:border-blue-600 hover:text-blue-600 transition-colors">
        i
      </div>

      {/* 2. POPUP TOOLTIP (Hidden by default, shown on group-hover) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl">
        {/* Panah Kecil di Bawah Tooltip */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-800"></div>
        
        {/* Isi Teks */}
        <div className="flex flex-col gap-1">
          {title && <span className="font-bold text-blue-200">{title}</span>}
          <span className="leading-snug text-gray-200 text-xs">{text}</span>
        </div>
      </div>
    </div>
  );
};

export default InfoTooltip;