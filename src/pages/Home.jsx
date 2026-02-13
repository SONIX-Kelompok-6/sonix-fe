import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// --- IMPORT ASET ---
import shoeImg from '../assets/home-images/home-shoe.webp'; 
import runnerImg from '../assets/home-images/runner.webp'; 
import rushLogo from '../assets/home-images/logo-dark.png'; 
import partOfShoeImg from '../assets/home-images/shoe-diagram.webp'; 

const Home = () => {
  // State untuk melacak titik mana yang aktif (Section 2)
  const [activePoint, setActivePoint] = useState(null); 

  // --- STATE & REF UNTUK ANIMASI SCROLL SECTION 2 ---
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // --- TAMBAHAN: STATE & REF UNTUK ANIMASI SCROLL SECTION 3 ---
  const [isSec3Visible, setIsSec3Visible] = useState(false);
  const sec3Ref = useRef(null);

  // Hook untuk mendeteksi scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Logic Section 2
          if (entry.target === sectionRef.current && entry.isIntersecting) {
            setIsVisible(true);
          }
          // Logic Section 3
          if (entry.target === sec3Ref.current && entry.isIntersecting) {
            setIsSec3Visible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    if (sec3Ref.current) observer.observe(sec3Ref.current);

    return () => observer.disconnect();
  }, []);

  // DATA BAGIAN SEPATU (Section 2)
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
          SECTION 1: HERO SECTION
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
          <div className="pl-4 md:pl-16 lg:pl-2 pt-32 lg:pt-1 z-30 animate-in slide-in-from-left duration-700">
            <div className="relative -mt-60 mb-6">
                <p className="absolute top-44 left-22 text-gray-800 font-bold tracking-[0.25em] text-2xl uppercase">WE ARE</p>
                <div className="flex justify-start -ml-3">
                  <img src={rushLogo} alt="RUSH Logo" className="w-[280px] md:w-[380px] lg:w-[450px] object-contain" />
                </div>
            </div>
            <p className="absolute top-69 left-30 text-gray-600 text-xl leading-relaxed max-w-md font-medium">
              Personalized shoe recommendations <br/>to help you find the perfect match <br/>for every run.
            </p>
            <div className="relative left-20 pt-15">
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
            <div className="absolute right-[-1rem] lg:right-[-11rem] top-[45%] -translate-y-1/2 z-20 select-none pointer-events-none">
               <h2 className="text-[100px] md:text-[140px] lg:text-[99px] font-black -rotate-90 tracking-widest flex items-center gap-0 opacity-100 leading-none">
                  <span className="text-[#2a3a81]">R</span>
                  <span className="text-white">U</span>
                  <span className="text-[#2a3a81]">N</span>
                  <span className="text-[#2a3a81]">N</span>
                  <span className="text-white">I</span>
                  <span className="text-[#2a3a81]">N</span>
                  <span className="text-white">G</span>
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
        <div className="relative w-full max-w-5xl h-[600px] flex items-center justify-center">
        
            {/* BACKGROUND STRIPES */}
            <div className="absolute z-0 flex flex-col gap-3 -rotate-[15deg] origin-bottom-left translate-y-[-33%] translate-x-[70%]">
                
                {/* STRIPE 1: ORANGE */}
                <div className="w-[500px] md:w-[700px] h-16 md:h-24 bg-[#FDBA74] flex items-center pl-30 md:pl-40 rounded-r-full shadow-sm overflow-hidden">
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

            {/* GAMBAR SEPATU UTAMA */}
            <div className="relative z-10 w-[350px] md:w-[600px] aspect-square flex items-center justify-center">
                <img 
                    src={partOfShoeImg} 
                    alt="Parts of Shoes Diagram" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                />

                {/* LOOPING HOTSPOTS */}
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
                             {activePoint !== part.id && (
                                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60"></span>
                             )}
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
                                <div className={`bg-white/95 backdrop-blur-md p-2 rounded-[2rem] shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300 flex items-center gap-4
                                    ${part.align === 'left' ? 'flex-row' : 'flex-row-reverse text-right'}
                                `}>
                                    <div className="flex flex-col justify-center min-w-[120px] px-2">
                                        <h3 className="text-[#FDBA74] font-black text-lg md:text-xl uppercase leading-none mb-1">
                                            {part.title}
                                        </h3>
                                        <p className="text-gray-500 text-xs font-medium leading-snug max-w-[150px]">
                                            {part.desc}
                                        </p>
                                    </div>
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 relative shrink-0">
                                        <img 
                                            src={partOfShoeImg} 
                                            alt={part.title}
                                            className="w-full h-full object-cover"
                                            style={part.zoomStyle} 
                                        />
                                    </div>
                                </div>
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

      {/* =========================================================================
          SECTION 3: COMPARE FEATURE (DARK MODE)
      ========================================================================= */}
      <section 
        ref={sec3Ref}
        className="relative w-full min-h-screen bg-[#0a0a5c] flex items-center justify-center overflow-hidden py-20 px-6"
      >
        {/* Background Elements (Hiasan) */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">

          {/* KOLOM KIRI: VISUAL KARTU COMPARE */}
          <div className={`relative flex items-center justify-center h-[500px] perspective-1000 transition-all duration-1000 ease-out
              ${isSec3Visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}
          `}>
            
            {/* Kartu Sepatu 1 (Kiri - Belakang) */}
            <div className="absolute left-0 md:left-10 top-10 w-[260px] md:w-[320px] h-[400px] bg-white rounded-3xl shadow-2xl p-6 transform -rotate-6 transition hover:rotate-0 hover:z-20 hover:scale-105 duration-500 border-4 border-gray-100">
               <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  <img src={shoeImg} alt="Shoe 1" className="w-full object-contain -rotate-12 mix-blend-multiply opacity-80" />
               </div>
               <div className="space-y-3">
                  <div className="h-4 w-1/2 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2 pt-2">
                     <div className="flex justify-between text-xs font-bold text-gray-400"><span>CUSHION</span><span>80%</span></div>
                     <div className="w-full h-2 bg-gray-200 rounded-full"><div className="w-[80%] h-full bg-blue-600 rounded-full"></div></div>
                     
                     <div className="flex justify-between text-xs font-bold text-gray-400"><span>SPEED</span><span>65%</span></div>
                     <div className="w-full h-2 bg-gray-200 rounded-full"><div className="w-[65%] h-full bg-orange-400 rounded-full"></div></div>
                  </div>
               </div>
            </div>

            {/* Kartu Sepatu 2 (Kanan - Depan) */}
            <div className="absolute right-0 md:right-10 bottom-10 w-[260px] md:w-[320px] h-[400px] bg-white rounded-3xl shadow-2xl p-6 transform rotate-6 transition hover:rotate-0 hover:scale-105 duration-500 border-4 border-orange-400 z-10">
               <div className="absolute -top-4 -right-4 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">WINNER CHOICE</div>
               <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {/* Flip image horizontal biar hadap-hadapan */}
                  <img src={shoeImg} alt="Shoe 2" className="w-full object-contain rotate-12 scale-x-[-1] mix-blend-multiply" />
               </div>
               <div className="space-y-3">
                  <div className="h-4 w-2/3 bg-gray-800 rounded-full"></div>
                  <div className="space-y-2 pt-2">
                     <div className="flex justify-between text-xs font-bold text-gray-400"><span>CUSHION</span><span>95%</span></div>
                     <div className="w-full h-2 bg-gray-200 rounded-full"><div className="w-[95%] h-full bg-blue-600 rounded-full"></div></div>
                     
                     <div className="flex justify-between text-xs font-bold text-gray-400"><span>SPEED</span><span>90%</span></div>
                     <div className="w-full h-2 bg-gray-200 rounded-full"><div className="w-[90%] h-full bg-orange-500 rounded-full animate-pulse"></div></div>
                  </div>
               </div>
            </div>

          </div>

          {/* KOLOM KANAN: TEXT CONTENT */}
          <div className={`flex flex-col items-start text-left space-y-8 transition-all duration-1000 delay-300 ease-out
              ${isSec3Visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}
          `}>
                      
             <h2 className="text-5xl md:text-7xl font-black text-white leading-tight">
                COMPARE <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                   & DECIDE
                </span>
             </h2>

             <p className="text-gray-300 text-lg leading-relaxed max-w-lg">
                Stop guessing. View detailed side-by-side breakdowns of specs, 
                features, and performance data. Find the shoe that gives you the 
                competitive edge.
             </p>

             <ul className="space-y-4 text-gray-300 font-medium">
                <li className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">✓</div>
                   Compare Weight & Drop
                </li>
                <li className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">✓</div>
                   Analyze Cushioning Technology
                </li>
                <li className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">✓</div>
                   Check Terrain Suitability
                </li>
             </ul>

             <div className="pt-4">
                <Link to="/compare">
                   <button className="group relative px-8 py-4 bg-white text-[#0a0a5c] font-black rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-transform hover:scale-105 cursor-pointer">
                      <span className="relative z-10 flex items-center gap-2">
                         START COMPARING
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                         </svg>
                      </span>
                   </button>
                </Link>
             </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;