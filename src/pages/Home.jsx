import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// --- IMPORT ASET ---
import shoeImg from '../assets/home-images/home-shoe.webp'; 
import runnerImg from '../assets/home-images/runner.webp'; 
import rushLogo from '../assets/home-images/logo-dark.png'; 
import partOfShoeImg from '../assets/home-images/shoe-diagram.webp'; 

// --- IMPORT ASET DETAIL BAGIAN SEPATU ---
import heelImg from '../assets/home-images/heel-counter.png';
import outsoleImg from '../assets/home-images/outsole.png';
import midsoleImg from '../assets/home-images/midsole.png';
import toeboxImg from '../assets/home-images/toebox.png';
import sonixMemberImg from '../assets/home-images/sonix-member.png';

const Home = () => {
  // State untuk melacak titik mana yang aktif (Section 2)
  const [activePoint, setActivePoint] = useState(null); 

  // --- STATE & REF UNTUK ANIMASI SCROLL ---
  // Section 2
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Section 3 (Compare)
  const [isSec3Visible, setIsSec3Visible] = useState(false);
  const sec3Ref = useRef(null);

  // Section 4 (About - NEW)
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const aboutRef = useRef(null);

  // Hook untuk mendeteksi scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === sectionRef.current && entry.isIntersecting) {
            setIsVisible(true);
          }
          if (entry.target === sec3Ref.current && entry.isIntersecting) {
            setIsSec3Visible(true);
          }
          if (entry.target === aboutRef.current && entry.isIntersecting) {
            setIsAboutVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    // Simpan ref ke variabel lokal untuk cleanup yang aman
    const currentSectionRef = sectionRef.current;
    const currentSec3Ref = sec3Ref.current;
    const currentAboutRef = aboutRef.current;

    if (currentSectionRef) observer.observe(currentSectionRef);
    if (currentSec3Ref) observer.observe(currentSec3Ref);
    if (currentAboutRef) observer.observe(currentAboutRef);

    return () => {
      // Cleanup menggunakan variabel lokal
      if (currentSectionRef) observer.unobserve(currentSectionRef);
      if (currentSec3Ref) observer.unobserve(currentSec3Ref);
      if (currentAboutRef) observer.unobserve(currentAboutRef);
      observer.disconnect();
    };
  }, []);

  // DATA BAGIAN SEPATU (Section 2)
  const shoeParts = [
    {
      id: 1,
      title: "HEEL COUNTER",
      desc: "Rear shoe structure stabilizing and supporting heel.",
      top: "10%", left: "67%", align: "right", 
      img: heelImg,
    },
    {
      id: 2,
      title: "OUTSOLE",
      desc: "Bottom shoe layer providing grip and durability",
      top: "58%", left: "39%", align: "right",
      img: outsoleImg,
    },
    {
      id: 3,
      title: "MIDSOLE",
      desc: "Middle shoe layer cushioning impact and energy return",
      top: "38%", left: "62%", align: "right",
      img: midsoleImg,
    },
    {
      id: 4,
      title: "TOE BOX",
      desc: "Front shoe area providing toe space comfort.",
      top: "48%", left: "28%", align: "left", 
      img: toeboxImg
    }
  ];

  return (
    // Update bg-gray-50 ke white atau warna yang sangat muda, selection color disesuaikan
    <div className="w-full bg-white font-sans selection:bg-[#F39422] selection:text-white overflow-x-hidden">
      
      {/* =========================================================================
          SECTION 1: HERO SECTION
          Palette: Backgrounds using Brand Blues
      ========================================================================= */}
      <section className="relative w-full min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1340 900" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {/* Menggunakan Palette: #010038 (Darkest) */}
            <path d="M 950 0 C 350 300 1000 650 0 900 H 1440 V 0 Z" fill="#010038" transform="translate(-40, 10)" />
            {/* Menggunakan Palette: #293A80 (Mid Blue) */}
            <path d="M 950 0 C 350 300 1000 650 0 900 H 1440 V 0 Z" fill="#293A80" transform="translate(-20, 0)" />
            {/* Menggunakan Palette: #537EC5 (Light Blue) */}
            <path d="M 990 0 C 350 300 1000 650 0 950 H 1440 V 0 Z" fill="#537EC5" />
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-screen items-center px-6 pb-20">
          <div className="pl-4 md:pl-16 lg:pl-2 pt-32 lg:pt-45 z-30 animate-in slide-in-from-left duration-700">
            <div className="relative -mt-68 mb-6">
                {/* Text Color: #293A80 */}
                <p className="absolute top-44 left-22 text-[#293A80] font-bold tracking-[0.25em] text-2xl uppercase">WE ARE</p>
                <div className="flex justify-start -ml-3">
                  <img src={rushLogo} alt="RUSH Logo" className="w-[280px] md:w-[380px] lg:w-[450px] object-contain" />
                </div>
            </div>
            {/* Text Color: #010038 (Darkest Blue for reading) */}
            <p className="absolute top-91 left-30 text-[#010038]/80 text-xl leading-relaxed max-w-md font-medium">
              Personalized shoe recommendations <br/>to help you find the perfect match <br/>for every run.
            </p>
            <div className="relative left-20 pt-15">
              <Link to="/recommendation">
                {/* Button: Main Blue #293A80 to Darkest #010038 on hover */}
                <button className="bg-[#293A80] text-white px-12 py-4 rounded-full font-bold tracking-widest shadow-2xl hover:bg-[#010038] hover:scale-105 transition transform duration-300 text-base md:text-lg ring-4 ring-[#293A80]/20">
                  TRY NOW
                </button>
              </Link>
            </div>
          </div>

          <div className="relative w-full h-full flex items-center justify-center overflow-visible mt-10 lg:mt-40">
            <div className="absolute -left-50 inset-0 z-19 flex items-center justify-end pointer-events-none">
               <div className="w-[85%] h-full relative ">
                  <img src={runnerImg} alt="Runner Overlay" className="w-full h-full object-cover object-top opacity-100 mix-blend-overlay contrast-125 scale-150 translate-x-10"/>
               </div>
            </div>
            <div className="absolute right-[-1rem] lg:right-[-11rem] top-[45%] -translate-y-1/2 z-20 select-none pointer-events-none">
               <h2 className="text-[100px] md:text-[140px] lg:text-[99px] font-black -rotate-90 tracking-widest flex items-center gap-0 opacity-100 leading-none">
                  {/* Alternating Text Colors based on Palette */}
                  <span className="text-[#293A80]">R</span>
                  <span className="text-white">U</span>
                  <span className="text-[#293A80]">N</span>
                  <span className="text-[#293A80]">N</span>
                  <span className="text-white">I</span>
                  <span className="text-[#293A80]">N</span>
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
                          {/* Accent Color: #F39422 (Orange) for impact */}
                          <p className="text-[#F39422] text-2xl font-black tracking-wider drop-shadow-sm bg-white/10 backdrop-blur-sm px-2 rounded">THE RIGHT SHOES</p>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
           <svg viewBox="0 0 1440 160" className="w-full h-auto min-h-[120px]" preserveAspectRatio="none">
               <path fill="#f8fafc" ></path>
           </svg>
        </div>
      </section>


      {/* =========================================================================
          SECTION 2: PARTS OF SHOES (INTERACTIVE)
          Palette: Using lighter shades and accents
      ========================================================================= */}
      <section 
        ref={sectionRef} 
        className="relative w-full min-h-[120vh] bg-slate-50 flex items-center justify-center overflow-hidden py-24">
        
        {/* Gradient Shadow */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#537EC5]/20 to-transparent pointer-events-none z-0"></div>

        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
             style={{ 
                 backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
             }}>
        </div>

        <div className="relative w-full max-w-5xl h-[600px] flex items-center justify-center">
            {/* BACKGROUND STRIPES - Updated to Palette */}
            <div className="absolute z-0 flex flex-col gap-3 -rotate-[15deg] origin-bottom-left translate-y-[-33%] translate-x-[70%]">
                {/* Orange #F39422 */}
                <div className="w-[500px] md:w-[700px] h-16 md:h-24 bg-[#F39422] flex items-center pl-30 md:pl-40 rounded-r-full shadow-sm overflow-hidden">
                    <h2 className={`text-white font-black text-4xl md:text-6xl tracking-wider drop-shadow-sm transition-all duration-1000 ease-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[200px] opacity-0'}`}>PARTS</h2>
                </div>
                {/* Light Blue #537EC5 */}
                <div className="w-[500px] md:w-[700px] h-16 md:h-24 bg-[#537EC5] flex items-center pl-24 md:pl-60 rounded-r-full shadow-sm -ml-8 overflow-hidden">
                    <h2 className={`text-white font-black text-4xl md:text-6xl tracking-wider drop-shadow-sm transition-all duration-1000 delay-100 ease-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[200px] opacity-0'}`}>OF</h2>
                </div>
                {/* Mid Blue #293A80 */}
                <div className="w-[500px] md:w-[700px] h-16 md:h-24 bg-[#293A80] flex items-center pl-24 md:pl-70 rounded-r-full shadow-sm -ml-30 overflow-hidden">
                    <h2 className={`text-white font-black text-4xl md:text-6xl tracking-wider drop-shadow-sm transition-all duration-1000 delay-200 ease-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[200px] opacity-0'}`}>SHOES</h2>
                </div>
            </div>

            {/* GAMBAR SEPATU UTAMA + INTERACTIVE HOTSPOTS */}
            <div 
                className="relative z-10 w-[350px] md:w-[600px] aspect-square flex items-center justify-center"
                onClick={() => setActivePoint(null)}
            >
                <img src={partOfShoeImg} alt="Parts of Shoes Diagram" className="w-full h-full object-contain drop-shadow-2xl"/>
                
                {shoeParts.map((part) => (
                    <div 
                        key={part.id} 
                        className="absolute w-8 h-8 flex items-center justify-center z-50" 
                        style={{ top: part.top, left: part.left }}
                    >
                        <div 
                            className="relative w-8 h-8 flex items-center justify-center cursor-pointer group" 
                            onClick={(e) => {
                                e.stopPropagation(); 
                                setActivePoint(activePoint === part.id ? null : part.id);
                            }}
                        >
                             {/* Hotspot color: Cyan/Light Blue related */}
                             {activePoint !== part.id && (<span className="absolute inline-flex h-full w-full rounded-full bg-[#537EC5] opacity-60 animate-ping"></span>)}
                             <span className={`relative inline-flex rounded-full transition-all duration-300 border-2 shadow-lg ${activePoint === part.id ? 'h-5 w-5 bg-[#F39422] border-white ring-4 ring-[#F39422]/30' : 'h-4 w-4 bg-white border-[#537EC5] group-hover:scale-125'}`}></span>
                        </div>

                        {/* Popup Tooltip */}
                        {activePoint === part.id && (
                            <div 
                                className={`absolute top-1/2 -translate-y-1/2 flex items-center cursor-default w-[400px] ${part.align === 'left' ? 'flex-row right-6 justify-end' : 'flex-row-reverse left-6 justify-end'}`}
                                onClick={(e) => e.stopPropagation()} 
                            >
                                <div className={`bg-white/95 backdrop-blur-md p-2 rounded-[2rem] shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-300 flex items-center gap-4 ${part.align === 'left' ? 'flex-row' : 'flex-row-reverse text-right'}`}>
                                    <div className="flex flex-col justify-center min-w-[120px] px-2">
                                        {/* Title Color: Orange #F39422 */}
                                        <h3 className="text-[#F39422] font-black text-lg md:text-xl uppercase leading-none mb-1">{part.title}</h3>
                                        <p className="text-[#010038]/70 text-xs font-medium leading-snug max-w-[150px]">{part.desc}</p>
                                    </div>
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 relative shrink-0">
                                        <img src={part.img} alt={part.title} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                {/* Line Color: Orange #F39422 to match title */}
                                <div className="w-8 md:w-16 h-[2px] bg-[#F39422] relative mx-2">
                                     <div className={`absolute w-1.5 h-1.5 bg-[#F39422] rounded-full top-1/2 -translate-y-1/2 ${part.align === 'left' ? '-left-1' : '-right-1'}`}></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: COMPARE FEATURE (RUSH BRAND PALETTE)
          Palette: Gradient #293A80 -> #010038, Accents #537EC5 & #F39422
      ========================================================================= */}
      <section ref={sec3Ref} className="relative w-full min-h-screen bg-gradient-to-br from-[#293A80] to-[#010038] flex items-center justify-center overflow-hidden py-20 px-6">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#537EC5]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F39422]/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

        <div className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
          
          {/* LEFT: VISUAL (Cards) */}
          <div className={`relative flex items-center justify-center h-[500px] perspective-1000 transition-all duration-1000 ease-out ${isSec3Visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
            
            {/* Card 1 (Belakang) */}
            <div className="absolute left-4 md:left-10 top-10 w-[260px] md:w-[300px] bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 transform -rotate-6 transition-transform hover:rotate-0 hover:z-20 hover:scale-105 duration-500 shadow-xl">
               <div className="w-full h-32 bg-white/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-white/10">
                  <img src={shoeImg} alt="Shoe 1" className="w-full object-contain -rotate-12 brightness-110 drop-shadow-lg" />
               </div>
               <div className="space-y-3">
                  <div className="h-3 w-1/2 bg-white/20 rounded-full"></div>
                  <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-bold text-[#537EC5]"><span>CUSHION</span><span>80%</span></div>
                      <div className="w-full h-1.5 bg-[#010038]/30 rounded-full"><div className="w-[80%] h-full bg-[#537EC5] rounded-full shadow-[0_0_10px_rgba(83,126,197,0.5)]"></div></div>
                  </div>
               </div>
            </div>

            {/* Card 2 (Depan) */}
            <div className="absolute right-4 md:right-10 bottom-10 w-[260px] md:w-[300px] bg-[#293A80]/90 backdrop-blur-xl border border-[#537EC5]/50 rounded-3xl p-6 transform rotate-6 transition-transform hover:rotate-0 hover:scale-105 duration-500 shadow-[0_20px_50px_rgba(1,0,56,0.5)] z-10">
               {/* Badge Winner: Orange #F39422 */}
               <div className="absolute -top-4 -right-4 bg-[#F39422] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-orange-400/50 flex items-center gap-1">
                  WINNER CHOICE
               </div>
               
               <div className="w-full h-32 bg-white/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-white/10 relative group">
                  <div className="absolute inset-0 bg-[#537EC5]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img src={shoeImg} alt="Shoe 2" className="w-full object-contain rotate-12 scale-x-[-1] brightness-110 drop-shadow-2xl relative z-10" />
               </div>
               
               <div className="space-y-3">
                  <div className="h-3 w-2/3 bg-white/30 rounded-full"></div>
                  <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-bold text-white"><span>CUSHION</span><span>95%</span></div>
                      {/* Bar Gradient: Light Blue to Orange */}
                      <div className="w-full h-1.5 bg-[#010038]/50 rounded-full"><div className="w-[95%] h-full bg-gradient-to-r from-[#537EC5] to-[#F39422] rounded-full shadow-[0_0_15px_rgba(243,148,34,0.4)]"></div></div>
                  </div>
               </div>
            </div>
          </div>

          {/* RIGHT: CONTENT */}
          <div className={`flex flex-col items-start text-left space-y-6 transition-all duration-1000 delay-300 ease-out ${isSec3Visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
              <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-[3px] bg-[#F39422]"></div>
                  <span className="text-[#537EC5] font-bold tracking-[0.2em] uppercase text-sm">SMART COMPARISON</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
                COMPARE <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F39422] to-[#ffb347] filter drop-shadow-sm">& DECIDE</span>
              </h2>
              
              <p className="text-blue-100/90 text-lg leading-relaxed max-w-lg font-light">
                Stop guessing based on looks alone. View detailed side-by-side breakdowns of cushion, stability, and energy return. Find the shoe that scientifically matches your running style.
              </p>
              
              <div className="pt-6">
                 <Link to="/compare">
                    <button className="group relative px-10 py-4 bg-white text-[#293A80] font-black rounded-full overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(83,126,197,0.4)] cursor-pointer ring-4 ring-transparent hover:ring-[#537EC5]/30">
                       <span className="relative z-10 flex items-center gap-3">
                          START COMPARING 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#F39422] transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                       </span>
                    </button>
                 </Link>
              </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: ABOUT RUSH (CONCEPT: OVERLAPPING CARD)
      ========================================================================= */}
      <section 
        ref={aboutRef}
        className="relative w-full py-24 bg-white overflow-hidden" 
      >
        <div className="container max-w-7xl mx-auto px-6">
          
          <div className="relative flex flex-col md:flex-row items-center">
            
            {/* 1. IMAGE LAYER (Behind) */}
            {/* Gambar dibuat lebar dan tinggi, posisinya agak ke kiri */}
            <div className={`w-full md:w-3/5 h-[500px] md:h-[600px] relative rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-1000 ease-out z-0
               ${isAboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}
            `}>
                <img 
                  src={sonixMemberImg} 
                  alt="About Rush" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100" 
               />
               {/* Overlay Gradient biar teks (kalau ada) terbaca, atau sekadar estetika */}
               <div className="absolute inset-0 bg-gradient-to-r from-[#010038]/40 to-transparent mix-blend-multiply"></div>
            </div>

            {/* 2. CONTENT CARD LAYER (Overlapping) */}
            {/* Kartu putih ini posisinya absolut di kanan (md), menimpa gambar */}
            <div className={`w-full md:w-1/2 md:-ml-20 lg:-ml-32 mt-[-100px] md:mt-0 relative z-10 bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] border border-slate-100 transition-all duration-1000 delay-200 ease-out
               ${isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
            `}>
               
               {/* Decorative Element */}
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 50C0 22.3858 22.3858 0 50 0C77.6142 0 100 22.3858 100 50" stroke="#293A80" strokeWidth="8"/>
                      <path d="M50 100C22.3858 100 0 77.6142 0 50" stroke="#F39422" strokeWidth="8"/>
                  </svg>
               </div>

               <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-[2px] bg-[#F39422]"></span>
                  <span className="text-[#F39422] font-bold tracking-[0.25em] uppercase text-sm">WHO WE ARE</span>
               </div>

               <h2 className="text-4xl md:text-5xl font-black text-[#010038] leading-tight mb-6">
                  Running Science, <br/> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#293A80] to-[#537EC5]">Simplified.</span>
               </h2>

               <p className="text-[#010038]/70 text-lg leading-relaxed mb-8">
                  We believe finding the right shoe shouldn't be a marathon. RUSH uses data-driven insights to match your unique biomechanics with the perfect pair. No guesswork, just precision.
               </p>

               {/* Stats / Features Grid */}
               <div className="grid grid-cols-2 gap-6 mb-8 border-t border-slate-100 pt-8">
                  <div>
                      <h4 className="text-3xl font-black text-[#293A80]">98%</h4>
                      <p className="text-sm text-slate-500 font-medium">Match Accuracy</p>
                  </div>
                  <div>
                      <h4 className="text-3xl font-black text-[#293A80]">50+</h4>
                      <p className="text-sm text-slate-500 font-medium">Brands Analyzed</p>
                  </div>
               </div>

               <Link to="/about" className="group inline-flex items-center gap-3 text-[#010038] font-bold text-lg hover:text-[#F39422] transition-colors">
                  READ OUR STORY 
                  <span className="w-8 h-8 rounded-full bg-[#F39422]/10 flex items-center justify-center group-hover:bg-[#F39422] group-hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
               </Link>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;