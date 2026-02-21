import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    // Uses your brand's Navy Blue color #000080
    <div className="min-h-screen bg-[#537EC5] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Subtle light pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none"
        style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px' 
        }}
      ></div>

      <div className="max-w-2xl mx-auto text-center animate-in fade-in zoom-in-95 duration-700 relative z-10">
        
        <p className="text-orange-400 font-bold tracking-[0.2em] uppercase text-xs mb-6">
          Project RUSH
        </p>

        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 uppercase drop-shadow-lg">
          Coming Soon.
        </h1>
        
        <p className="text-blue-100 text-base md:text-lg max-w-md mx-auto leading-relaxed mb-12 font-medium opacity-90">
          We're currently working on something awesome for our social platforms. 
          Good things take time. Check back later!
        </p>

        <button 
          onClick={() => navigate('/')} 
          className="group flex items-center justify-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest text-[#000080] bg-white hover:bg-gray-100 px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all active:scale-95"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor" 
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </button>

      </div>
      
    </div>
  );
}