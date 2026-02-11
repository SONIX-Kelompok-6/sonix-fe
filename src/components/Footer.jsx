import logoImg from '../assets/logo-dark.svg'; 

import igIcon from "../assets/footer/instagram.png";
import xIcon from "../assets/footer/x.png";
import fbIcon from "../assets/footer/facebook.png";
import ytIcon from "../assets/footer/youtube.png";

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-transparent py-16 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-md p-10 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* LEFT — BRAND */}
        <div className="space-y-0">
          <img 
            src={logoImg}  
            alt="RUSH Logo "
            className="h-15 object-contain"
            />
          <p className="text-gray-500 text-sm leading-snug">
            Find your dream running shoes with AI technology.
            Fast, accurate, and budget-friendly.
          </p>
        </div>

        {/* MENU */}
        <div>
            <h3 className="font-semibold mb-4">Menu</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
                
                <li>
                <Link to="/" className="hover:text-black transition">
                    Home
                </Link>
                </li>

                <li>
                <Link to="/recommendation" className="hover:text-black transition">
                    Recommendation
                </Link>
                </li>

                <li>
                <Link to="/compare" className="hover:text-black transition">
                    Compare
                </Link>
                </li>

                <li>
                <Link to="/favorite" className="hover:text-black transition">
                    Favorite
                </Link>
                </li>

            </ul>
        </div>

        {/* SUPPORT */}
        <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-600 text-sm">

                <li>
                <Link to="/about" className="hover:text-black transition">
                    About
                </Link>
                </li>

                <li>
                <Link to="/contact" className="hover:text-black transition">
                    Contact Us
                </Link>
                </li>

            </ul>
        </div>


        {/* SOCIAL */}
        <div>
            <h3 className="font-semibold mb-3">Follow us</h3>

            <div className="flex gap-4 items-center">
                <a href="#" className="hover:scale-110 transition">
                <img src={igIcon} alt="Instagram" className="h-6 w-6 object-contain" />
                </a>

                <a href="#" className="hover:scale-110 transition">
                <img src={xIcon} alt="X" className="h-6 w-6 object-contain" />
                </a>

                <a href="#" className="hover:scale-110 transition">
                <img src={fbIcon} alt="Facebook" className="h-6 w-6 object-contain" />
                </a>

                <a href="#" className="hover:scale-110 transition">
                <img src={ytIcon} alt="YouTube" className="h-6 w-6 object-contain" />
                </a>
            </div>
        </div>
     </div>
    </footer>
  );
}