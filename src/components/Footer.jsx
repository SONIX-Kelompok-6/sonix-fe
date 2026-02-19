import logoImg from '../assets/logo-light.svg'; 

import igIcon from "../assets/footer/instagram.png";
import xIcon from "../assets/footer/x.png";
import fbIcon from "../assets/footer/facebook.png";
import ytIcon from "../assets/footer/youtube.png";

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-transparent py-16 px-6">
      <div className="max-w-6xl mx-auto bg-[#010038] rounded-3xl shadow-lg p-10 grid grid-cols-1 md:grid-cols-4 gap-10 text-white">

        {/* LEFT — BRAND */}
        <div className="space-y-2">
          <img 
            src={logoImg}  
            alt="RUSH Logo"
            className="h-15 object-contain" 
            />
          <p className="text-gray-400 text-sm leading-snug">
            Find your dream running shoes with AI technology.
            Fast, accurate, and budget-friendly.
          </p>
        </div>

        {/* MENU */}
        <div>
            <h3 className="font-semibold mb-4 text-white">Menu</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
                
                <li>
                <Link to="/" className="hover:text-white transition">
                    Home
                </Link>
                </li>

                <li>
                <Link to="/recommendation" className="hover:text-white transition">
                    Recommendation
                </Link>
                </li>

                <li>
                <Link to="/compare" className="hover:text-white transition">
                    Compare
                </Link>
                </li>

                <li>
                <Link to="/favorites" className="hover:text-white transition">
                    Favorites
                </Link>
                </li>

            </ul>
        </div>

        {/* SUPPORT */}
        <div>
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-gray-400 text-sm">

                <li>
                <Link to="/about" className="hover:text-white transition">
                    About
                </Link>
                </li>

                <li>
                <Link to="/contact" className="hover:text-white transition">
                    Contact Us
                </Link>
                </li>

            </ul>
        </div>


        {/* SOCIAL */}
        <div>
            <h3 className="font-semibold mb-3 text-white">Follow us</h3>

            {/* Icon dibuat putih total agar terlihat di background biru gelap */}
            <div className="flex gap-4 items-center">
                <a href="#" className="hover:scale-110 transition">
                <img src={igIcon} alt="Instagram" className="h-6 w-6 object-contain brightness-0 invert" />
                </a>

                <a href="#" className="hover:scale-110 transition">
                <img src={xIcon} alt="X" className="h-6 w-6 object-contain brightness-0 invert" />
                </a>

                <a href="#" className="hover:scale-110 transition">
                <img src={fbIcon} alt="Facebook" className="h-6 w-6 object-contain brightness-0 invert" />
                </a>

                <a href="#" className="hover:scale-110 transition">
                <img src={ytIcon} alt="YouTube" className="h-6 w-6 object-contain brightness-0 invert" />
                </a>
            </div>
        </div>
      </div>
    </footer>
  );
}