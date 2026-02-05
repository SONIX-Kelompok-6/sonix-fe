import React from "react";
import roadImg from "../assets/recommendation/road.png";
import trailImg from "../assets/recommendation/trail.png";

export default function Recommendation() {
  return (
    /* 1. HAPUS flex justify-center di sini agar tidak mengganggu Navbar Fixed */
    /* Gunakan min-h-screen agar gradient menutupi seluruh layar */
    <div className="bg-gradient-to-b from-sky-100 to-blue-200 min-h-screen pt-30 pb-20">
      
      {/* 2. Gunakan mx-auto untuk menengahkan kartu secara aman */}
      <div className="bg-white rounded-3xl shadow-xl w-[90%] max-w-[420px] p-8 mx-auto">
        <h2 className="text-center font-bold tracking-[0.2em] mb-8 text-gray-800 text-xl">
          TYPES OF RUNNING
        </h2>

        <div className="flex flex-col gap-6">
          {/* Road Running */}
          <div className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm">
            <img
              src={roadImg}
              alt="Road Running"
              className="w-full h-[180px] object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay yang menggelap saat hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-300 group-hover:bg-black/50">
              <span className="text-white text-3xl font-extrabold drop-shadow-2xl [-webkit-text-stroke:1px_orange] transition-transform duration-500 group-hover:scale-110 inline-block uppercase tracking-wider">
                Road Running
              </span>
            </div>
          </div>

          {/* Trail Running */}
          <div className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm">
            <img
              src={trailImg}
              alt="Trail Running"
              className="w-full h-[180px] object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-300 group-hover:bg-black/50">
              <span className="text-white text-3xl font-extrabold drop-shadow-2xl [-webkit-text-stroke:1px_orange] transition-transform duration-500 group-hover:scale-110 inline-block uppercase tracking-wider">
                Trail Running
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}