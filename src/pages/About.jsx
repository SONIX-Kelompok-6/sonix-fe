import React from "react";
import tornPaper from "../assets/about-page/torn-paper.png";
import rushLogo from "../assets/about-page/logo-dark1.svg";


export default function About() {
  return (
    <div className="pt-55 pb-5">
      {/* LOGO */}
      <div className="flex justify-center mb-0">
        <img 
          src={rushLogo} 
          alt="RUSH Logo" 
          className="h-50 object-contain"
        />
      </div>

      {/* ROBEKAN ATAS */}
      <img 
        src={tornPaper} 
        alt="Torn Paper" 
        className="w-full object-cover"
      />

      {/* BOX PUTIH CONTENT */}
      <div className="bg-gradient-to-b from-gray-100 to-white -mt-1">
        <div className="max-w-5xl mx-auto px-10 py-5 grid md:grid-cols-2 gap-16">

          {/* LEFT */}
          <div>
            <h2 className="text-3xl font-bold mb-5">Background</h2>
            <p className="text-gray-800 text-[15px] italic leading-relaxed mb-4">
              Many people want to start a healthier lifestyle through running, 
              but struggle to find running shoes that truly fit their needs.
              RUSH uses machine learning and a content-based recommendation system 
              to deliver personalized, data-driven shoe recommendations based on 
              foot form, running terrain, and comfort preferences.
            </p>

            <p className="text-gray-800 text-[15px] italic leading-relaxed">
              By making shoe selection more objective, efficient, and personal, 
              RUSH helps runners improve comfort, performance, and overall well-being.
            </p>
          </div>

          {/* RIGHT */}
          <div>
            <h2 className="text-3xl font-bold mb-5">Our Goal</h2>
            <p className="text-gray-800 text-[15px] italic leading-relaxed">
              To help every runner find the perfect shoes faster, 
              reduce the risk of injury, and make running more comfortable, 
              efficient, and enjoyable.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
