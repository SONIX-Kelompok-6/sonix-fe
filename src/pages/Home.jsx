import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// --- IMPORT ASET ---
import shoeImg from '../assets/home-images/home-shoe.webp'; 
import runnerImg from '../assets/home-images/runner.webp'; 
import rushLogo from '../assets/home-images/logo-dark.png'; 
import partOfShoeImg from '../assets/home-images/shoe-diagram.webp'; 

const Home = () => {
  // State untuk melacak titik mana yang aktif
  const [activePoint, setActivePoint] = useState(null); 

  // --- STATE & REF UNTUK ANIMASI SCROLL ---
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Hook untuk mendeteksi scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); 
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // DATA BAGIAN SEPATU 
  const shoeParts = [
    {
      id: 1,
      title: "HEEL COUNTER",
      desc: "Rear shoe structure stabilizing and supporting heel.",
      top: "10%", 
      left: "67%", 
      align: "right", 
      zoomStyle: { objectPosition: "85% 15%", transform: "scale(2)" } 
    },
    {
      id: 2,
      title: "OUTSOLE",
      desc: "Bottom shoe layer providing grip and durability",
      top: "58%", 
      left: "39%", 
      align: "right",
      zoomStyle: { objectPosition: "50% 40%", transform: "scale(2.5)" }
    },
    {
      id: 3,
      title: "MIDSOLE",
      desc: "Middle shoe layer cushioning impact and energy return",
      top: "38%", 
      left: "62%", 
      align: "right",
      zoomStyle: { objectPosition: "80% 70%", transform: "scale(2)" }
    },
    {
      id: 4,
      title: "TOE BOX",
      desc: "Front shoe area providing toe space comfort.",
      top: "48%", 
      left: "28%", 
      align: "left", 
      zoomStyle: { objectPosition: "15% 95%", transform: "scale(2.2)" }
    }
  ];

  return (
    <div className="w-full bg-gray-50 font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden">
      
      {/* =========================================================================
          SECTION 1: HERO (Tidak Berubah)
      ========================================================================= */}
      <section className="relative w-full min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1340 900" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 950 0 C 350 300 1000 650 0 1000 H 1440 V 0 Z" fill="#02015A" transform="translate(-40, 10)" />
            <path d="M 950 0 C 350 300 1000 650 0 1000 H 1440 V 0 Z" fill="#293A80" transform="translate(-20, 0)" />
            <path d="M 990 0 C 350 300 1000 650 0 1050 H 1440 V 0 Z" fill="#537EC5" />
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-screen items-center px-6 pb-20">
          <div className="pl-4 md:pl-16 lg:pl-2 pt-32 lg:pt-15 z-30 animate-in slide-in-from-left duration-700">
            <div className="relative -mt-40 mb-6">
                <p className="absolute top-44 left-22 text-gray-800 font-bold tracking-[0.25em] text-2xl uppercase">WE ARE</p>
                <div className="flex justify-start -ml-3">
                  <img src={rushLogo} alt="RUSH Logo" className="w-[280px] md:w-[380px] lg:w-[450px] object-contain" />
                </div>
            </div>
            <p className="absolute top-95 left-30 text-gray-600 text-xl leading-relaxed max-w-md font-medium">
              Personalized shoe recommendations <br/>to help you find the perfect match <br/>for every run.
            </p>
            <div className="relative left-20 pt-9">
              <Link to="/recommendation">
                <button className="bg-[#0a0a5c] text-white px-12 py-4 rounded-full font-bold tracking-widest shadow-2xl hover:bg-blue-900 hover:scale-105 transition transform duration-300 text-base md:text-lg ring-4 ring-[#0a0a5c]/20">
                  TRY NOW
                </button>
              </Link>
            </div>
          </div>

          <div className="relative w-full h-full flex items-center justify-center overflow-visible mt-10 lg:mt-0">
            <div className="absolute -left-50 inset-0 z-19 flex items-center justify-end pointer-events-none">
               <div className="w-[85%] h-full relative ">
                  <img src={runnerImg} alt="Runner Overlay" className="w-full h-full object-cover object-top opacity-100 mix-blend-overlay contrast-125 scale-150 translate-x-10"/>
               </div>
            </div>
            <div className="absolute right-[-1rem] lg:right-[-13rem] top-[50%] -translate-y-1/2 z-20 select-none pointer-events-none">
               <h2 className="text-[100px] md:text-[140px] lg:text-[99px] font-black -rotate-90 tracking-widest flex items-center gap-0 opacity-100 leading-none">
                  <span className="text-[#2a3a81]">R</span><span className="text-white">U</span><span className="text-[#2a3a81]">N</span><span className="text-[#2a3a81]">N</span><span className="text-white">I</span><span className="text-[#2a3a81]">N</span><span className="text-white">G</span>
               </h2>
            </div>
            <div className="relative z-20 -ml-[20%] lg:-ml-[30%] -mt-10 lg:-mt-40 w-full flex justify-center">
               <img src={shoeImg} alt="Running Shoe" className="w-[135%] md:w-[800px] lg:w-[1200px] max-w-none -rotate-[5deg]"/>
               <div className="hidden lg:flex flex-col absolute bottom-[2%] right-[20%] items-end">
                  <div className="flex items-center gap-4">
                      <div className="w-24 h-[2px] bg-white/80 relative shadow-sm"><div className="absolute left-0 bottom-0 w-[1px] h-15 bg-white/80 shadow-sm"></div></div>
                      <div className="text-left drop-shadow-md">
                          <p className="text-white text-xs font-bold tracking-[0.2em] uppercase opacity-90 mb-1">FIND YOUR RUSH IN</p>
                          <p className="text-white text-2xl font-black tracking-wider">THE RIGHT SHOES</p>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
           <svg viewBox="0 0 1440 160" className="w-full h-auto min-h-[120px]" preserveAspectRatio="none">
               <path fill="#f3f4f6" d="M0,120 C300,160 600,80 900,100 C1200,120 1350,100 1440,110 V160 H0 Z"></path>
           </svg>
        </div>
      </section>


      {/* =========================================================================
          SECTION 2: PARTS OF SHOES (TEXT ONLY SLIDE)
      ========================================================================= */}
      <section 
        ref={sectionRef} 
        className="relative w-full min-h-[120vh] bg-[#f3f4f6] flex items-center justify-center overflow-hidden py-10"
      >
        
        {/* CONTAINER UTAMA */}
        <div className="relative w-full max-w-5xl h-[600px] flex items-center justify-center">
        
            {/* --- 1. BACKGROUND STRIPES (STATIC - DIAM DI TEMPAT) --- */}
            {/* Note: Tidak ada transition di wrapper ini, posisi fix di translate-x-[70%] */}
            <div className="absolute z-0 flex flex-col gap-3 -rotate-[15deg] origin-bottom-left translate-y-[-33%] translate-x-[70%]">
                
                {/* STRIPE 1: ORANGE */}
                <div className="w-[500px] md:w-[700px] h-16 md:h-24 bg-[#FDBA74] flex items-center pl-30 md:pl-40 rounded-r-full shadow-sm overflow-hidden">
                    {/* ANIMASI TEKS: Slide dari kanan (+200px) ke posisi 0 */}
                    <h2 className={`text-white font-black text-4xl md:text-6xl tracking-wider drop-shadow-sm transition-all duration-1000 ease-out
                        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[200px] opacity-0'}
                    `}>
                        PARTS
                    </h2>
                </div>
                
                {/* STRIPE 2: LIGHT BLUE */}
                <div className="w-[500px] md:w-[700px] h-16 md:h-24 bg-[#93C5FD] flex items-center pl-24 md:pl-60 rounded-r-full shadow-sm -ml-8 overflow-hidden">
                    <h2 className={`text-white font-black text-4xl md:text-6xl tracking-wider drop-shadow-sm transition-all duration-1000 delay-100 ease-out
                        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[200px] opacity-0'}
                    `}>
                        OF
                    </h2>
                </div>
                
                {/* STRIPE 3: DARK BLUE */}
                <div className="w-[500px] md:w-[700px] h-16 md:h-24 bg-[#5fa5f9] flex items-center pl-24 md:pl-70 rounded-r-full shadow-sm -ml-30 overflow-hidden">
                    <h2 className={`text-white font-black text-4xl md:text-6xl tracking-wider drop-shadow-sm transition-all duration-1000 delay-200 ease-out
                        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[200px] opacity-0'}
                    `}>
                        SHOES
                    </h2>
                </div>

            </div>

            {/* --- 2. GAMBAR SEPATU UTAMA (TIDAK BERUBAH) --- */}
            <div className="relative z-10 w-[350px] md:w-[600px] aspect-square flex items-center justify-center">
                
                <img 
                    src={partOfShoeImg} 
                    alt="Parts of Shoes Diagram" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                />

                {/* --- 3. LOOPING HOTSPOTS (TIDAK BERUBAH) --- */}
                {shoeParts.map((part) => (
                    <div 
                        key={part.id}
                        className="absolute w-8 h-8 flex items-center justify-center z-50"
                        style={{ top: part.top, left: part.left }}
                    >
                        {/* A. TITIK UTAMA */}
                        <div 
                           className="relative w-8 h-8 flex items-center justify-center cursor-pointer group"
                           onClick={() => setActivePoint(activePoint === part.id ? null : part.id)}
                        >
                             {/* Animasi Ping */}
                             {activePoint !== part.id && (
                                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60"></span>
                             )}
                             {/* Titik Tengah */}
                             <span className={`relative inline-flex rounded-full transition-all duration-300 border-2 shadow-lg
                                ${activePoint === part.id 
                                    ? 'h-5 w-5 bg-cyan-500 border-white ring-4 ring-cyan-500/30' 
                                    : 'h-4 w-4 bg-white border-cyan-400 group-hover:scale-125'
                                }
                             `}></span>
                        </div>

                        {/* B. CARD DETAIL */}
                        {activePoint === part.id && (
                            <div className={`absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none w-[400px]
                                ${part.align === 'left' 
                                    ? 'flex-row right-6 justify-end' 
                                    : 'flex-row-reverse left-6 justify-end'
                                }
                            `}>
                                {/* 1. CONTAINER INFO */}
                                <div className={`bg-white/95 backdrop-blur-md p-2 rounded-[2rem] shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300 flex items-center gap-4
                                    ${part.align === 'left' ? 'flex-row' : 'flex-row-reverse text-right'}
                                `}>
                                    {/* TEKS */}
                                    <div className="flex flex-col justify-center min-w-[120px] px-2">
                                        <h3 className="text-[#FDBA74] font-black text-lg md:text-xl uppercase leading-none mb-1">
                                            {part.title}
                                        </h3>
                                        <p className="text-gray-500 text-xs font-medium leading-snug max-w-[150px]">
                                            {part.desc}
                                        </p>
                                    </div>
                                    {/* GAMBAR ZOOM */}
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 relative shrink-0">
                                        <img 
                                            src={partOfShoeImg} 
                                            alt={part.title}
                                            className="w-full h-full object-cover"
                                            style={part.zoomStyle} 
                                        />
                                    </div>
                                </div>
                                {/* 2. GARIS PENGHUBUNG */}
                                <div className="w-8 md:w-16 h-[2px] bg-cyan-400 relative mx-2">
                                     <div className={`absolute w-1.5 h-1.5 bg-cyan-400 rounded-full top-1/2 -translate-y-1/2
                                        ${part.align === 'left' ? '-left-1' : '-right-1'}
                                     `}></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

            </div>

        </div>
      </section>
    </div>
  );
};

export default Home;