import React from "react";
import { Facebook, Twitter, Linkedin } from "lucide-react";

function Footer() {
  return (
    <footer className="relative bg-black/80 backdrop-blur-xl border-t border-white/20 text-white py-6 mt-16">
      {/* Neon glow line on top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 animate-pulse"></div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Left - Copyright */}
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()}{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent font-bold">
            FitTronix
          </span>
          . All rights reserved.
        </p>

        {/* Right - Socials */}
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a
            href="#"
            className="hover:text-cyan-400 transition transform hover:scale-110"
          >
            <Facebook size={20} />
          </a>
          <a
            href="#"
            className="hover:text-pink-500 transition transform hover:scale-110"
          >
            <Twitter size={20} />
          </a>
          <a
            href="#"
            className="hover:text-purple-400 transition transform hover:scale-110"
          >
            <Linkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
