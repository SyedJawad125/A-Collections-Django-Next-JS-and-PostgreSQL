// 'use client';
// import React from 'react';
// import Image from 'next/image';
// import logo from '../../public/images/logo5.jpg';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
// import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

// const Footer = () => {
//   return (
//     <footer className="relative bg-gradient-to-br from-gray-900 via-black to-gray-950 text-gray-300 pt-16 pb-8 border-t border-gray-800">
//       {/* Decorative top border */}
//       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
//       {/* Top section */}
//       <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 px-6 md:px-16">
        
//         {/* Logo & Description */}
//         <div className="flex flex-col items-center md:items-start lg:col-span-2">
//           <a href="/" className="mb-4">
//             <Image
//               src={logo}
//               alt="Logo"
//               width={160}
//               height={90}
//               className="rounded-lg shadow-lg border border-gray-700 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all duration-500"
//             />
//           </a>
//           <p className="text-gray-400 text-sm leading-relaxed text-center md:text-left max-w-sm">
//             Exploring ideas, sharing stories, and inspiring minds. Join our community of passionate writers and curious readers as we journey through the world of knowledge and creativity.
//           </p>
          
//           {/* Newsletter */}
//           <div className="mt-6 w-full max-w-sm">
//             <h4 className="text-sm font-semibold text-gray-200 mb-2">Subscribe to our newsletter</h4>
//             <div className="flex gap-2">
//               <input 
//                 type="email" 
//                 placeholder="Enter your email" 
//                 className="flex-1 px-4 py-2 text-sm border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-200 placeholder-gray-500"
//               />
//               <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
//                 Subscribe
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Quick Links */}
//         <div>
//           <h2 className="text-lg font-bold mb-4 text-white relative inline-block">
//             Quick Links
//             <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></span>
//           </h2>
//           <ul className="space-y-3 text-sm">
//             <li><a href="/" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
//               <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
//               Home
//             </a></li>
//             <li><a href="/about" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
//               <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
//               About Us
//             </a></li>
//             <li><a href="/blog" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
//               <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
//               Blog
//             </a></li>
//             <li><a href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
//               <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
//               Contact
//             </a></li>
//           </ul>
//         </div>

//         {/* Categories */}
//         <div>
//           <h2 className="text-lg font-bold mb-4 text-white relative inline-block">
//             Categories
//             <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></span>
//           </h2>
//           <ul className="space-y-3 text-sm">
//             <li><a href="/publicproduct" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
//               <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
//               Products
//             </a></li>
//             <li><a href="/publiccategory" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
//               <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
//               Categories
//             </a></li>
//             <li><a href="/blog" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
//               <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
//               Blog
//             </a></li>
//             <li><a href="/faq" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
//               <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
//               FAQ
//             </a></li>
//           </ul>
//         </div>

//         {/* Contact */}
//         <div>
//           <h2 className="text-lg font-bold mb-4 text-white relative inline-block">
//             Get in Touch
//             <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></span>
//           </h2>
//           <ul className="text-sm space-y-3">
//             <li className="flex items-start group">
//               <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-blue-500 mt-0.5 flex-shrink-0" />
//               <span className="text-gray-400 group-hover:text-blue-400 transition-colors">
//                 DHA Phase 2, Islamabad, Pakistan
//               </span>
//             </li>
//             <li className="flex items-center group">
//               <FontAwesomeIcon icon={faPhone} className="mr-3 text-blue-500 flex-shrink-0" />
//               <a href="tel:+923331906382" className="text-gray-400 group-hover:text-blue-400 transition-colors">
//                 (+92) 333 1906382
//               </a>
//             </li>
//             <li className="flex items-center group">
//               <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-blue-500 flex-shrink-0" />
//               <a href="mailto:nicenick1992@gmail.com" className="text-gray-400 group-hover:text-blue-400 transition-colors break-all">
//                 nicenick1992@gmail.com
//               </a>
//             </li>
//           </ul>

//           {/* Social Icons */}
//           <div className="flex gap-3 mt-6">
//             {[
//               { icon: <FaFacebookF />, href: 'https://www.facebook.com' },
//               { icon: <FaTwitter />, href: 'https://www.twitter.com' },
//               { icon: <FaInstagram />, href: 'https://www.instagram.com' },
//               { icon: <FaWhatsapp />, href: 'https://wa.me/923331906382' },
//               { icon: <FaLinkedinIn />, href: 'https://www.linkedin.com/in/syed-jawad-ali-080286b9/' },
//               { icon: <FaYoutube />, href: 'https://www.youtube.com' },
//             ].map((social, i) => (
//               <a
//                 key={i}
//                 href={social.href}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1"
//               >
//                 {social.icon}
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Divider */}
//       <div className="mt-12 border-t border-gray-800 w-11/12 mx-auto"></div>

//       {/* Bottom section */}
//       <div className="container mx-auto px-6 md:px-16 mt-8">
//         <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
//           <p className="mb-4 md:mb-0">
//             © {new Date().getFullYear()} <span className="text-blue-400 font-semibold">Your Company</span>. All rights reserved.
//           </p>
//           <div className="flex gap-6 text-xs">
//             <a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
//             <a href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</a>
//             <a href="/returns" className="hover:text-blue-400 transition-colors">Returns</a>
//           </div>
//         </div>
//         <p className="text-center mt-4 text-xs text-gray-500">
//           Crafted with <span className="text-red-500">♥</span> by <span className="text-blue-400 font-medium">Syed Jawad Ali</span>
//         </p>
//       </div>
//     </footer>
//   );
// };

// export default Footer;




'use client';

import React from 'react';
import Image from 'next/image';
import logo from '../../public/images/logo5.jpg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';

import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaLinkedinIn,
  FaYoutube
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-300 pt-14 pb-7 border-t border-amber-400/20 overflow-hidden">

      {/* Luxury Top Border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>

      {/* Background Glow */}
      <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl"></div>

      {/* Decorative Circles */}
      <div className="absolute right-10 top-10 w-32 h-32 rounded-full border border-amber-400/10"></div>
      <div className="absolute right-16 top-16 w-20 h-20 rounded-full border border-amber-400/10"></div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 px-6 md:px-16">

        {/* Logo & Description */}
        <div className="flex flex-col items-center md:items-start lg:col-span-2">

          {/* Logo */}
          <a href="/" className="mb-5 group">
            <div className="relative">

              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-500/30 blur opacity-60 group-hover:opacity-100 transition-all duration-500"></div>

              <Image
                src={logo}
                alt="Logo"
                width={160}
                height={90}
                className="relative rounded-2xl shadow-2xl border border-amber-400/30 group-hover:border-amber-400/60 group-hover:shadow-amber-500/30 transition-all duration-500"
              />
            </div>
          </a>

          {/* Description */}
          <p className="text-slate-400 text-sm leading-relaxed text-center md:text-left max-w-sm">
            Exploring ideas, sharing stories, and inspiring minds. Join our
            community of passionate writers and curious readers as we journey
            through the world of knowledge and creativity.
          </p>

          {/* Newsletter */}
          <div className="mt-6 w-full max-w-sm">

            <h4 className="text-sm font-semibold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-3">
              Subscribe to our newsletter
            </h4>

            <div className="flex gap-2">

              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 text-sm rounded-full border border-slate-700/70 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 bg-slate-800/70 backdrop-blur-xl text-slate-200 placeholder-slate-500 transition-all duration-300"
              />

              <button
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 text-sm font-semibold rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300"
              >
                Subscribe
              </button>

            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>

          <h2 className="text-lg font-bold mb-5 text-white relative inline-block">
            Quick Links

            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></span>
          </h2>

          <ul className="space-y-3 text-sm">

            {[
              { name: 'Home', href: '/' },
              { name: 'About Us', href: '/about' },
              { name: 'Blog', href: '/blog' },
              { name: 'Contact', href: '/contact' },
            ].map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="text-slate-400 hover:text-amber-300 transition-all duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-3 group-hover:bg-amber-400 group-hover:shadow-[0_0_8px_rgba(251,191,36,0.7)] transition-all duration-300"></span>

                  {item.name}
                </a>
              </li>
            ))}

          </ul>
        </div>

        {/* Categories */}
        <div>

          <h2 className="text-lg font-bold mb-5 text-white relative inline-block">
            Categories

            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></span>
          </h2>

          <ul className="space-y-3 text-sm">

            {[
              { name: 'Products', href: '/publicproduct' },
              { name: 'Categories', href: '/publiccategory' },
              { name: 'Blog', href: '/blog' },
              { name: 'FAQ', href: '/faq' },
            ].map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="text-slate-400 hover:text-amber-300 transition-all duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-3 group-hover:bg-amber-400 group-hover:shadow-[0_0_8px_rgba(251,191,36,0.7)] transition-all duration-300"></span>

                  {item.name}
                </a>
              </li>
            ))}

          </ul>
        </div>

        {/* Contact */}
        <div>

          <h2 className="text-lg font-bold mb-5 text-white relative inline-block">
            Get in Touch

            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></span>
          </h2>

          <ul className="text-sm space-y-4">

            {/* Address */}
            <li className="flex items-start group">

              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="mr-3 text-amber-400 mt-0.5 flex-shrink-0"
              />

              <span className="text-slate-400 group-hover:text-amber-300 transition-colors duration-300">
                DHA Phase 2, Islamabad, Pakistan
              </span>

            </li>

            {/* Phone */}
            <li className="flex items-center group">

              <FontAwesomeIcon
                icon={faPhone}
                className="mr-3 text-amber-400 flex-shrink-0"
              />

              <a
                href="tel:+923331906382"
                className="text-slate-400 group-hover:text-amber-300 transition-colors duration-300"
              >
                (+92) 333 1906382
              </a>

            </li>

            {/* Email */}
            <li className="flex items-center group">

              <FontAwesomeIcon
                icon={faEnvelope}
                className="mr-3 text-amber-400 flex-shrink-0"
              />

              <a
                href="mailto:nicenick1992@gmail.com"
                className="text-slate-400 group-hover:text-amber-300 transition-colors duration-300 break-all"
              >
                nicenick1992@gmail.com
              </a>

            </li>

          </ul>

          {/* Social Icons */}
          <div className="flex gap-3 mt-6">

            {[
              {
                icon: <FaFacebookF />,
                href: 'https://www.facebook.com'
              },
              {
                icon: <FaTwitter />,
                href: 'https://www.twitter.com'
              },
              {
                icon: <FaInstagram />,
                href: 'https://www.instagram.com'
              },
              {
                icon: <FaWhatsapp />,
                href: 'https://wa.me/923331906382'
              },
              {
                icon: <FaLinkedinIn />,
                href: 'https://www.linkedin.com/in/syed-jawad-ali-080286b9/'
              },
              {
                icon: <FaYoutube />,
                href: 'https://www.youtube.com'
              },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/70 hover:bg-gradient-to-br hover:from-amber-500 hover:to-yellow-500 hover:text-slate-900 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                {social.icon}
              </a>
            ))}

          </div>
        </div>

      </div>

      {/* Divider */}
      <div className="relative z-10 mt-12 w-11/12 mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 container mx-auto px-6 md:px-16 mt-7">

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">

          <p className="mb-4 md:mb-0 text-center md:text-left">
            © {new Date().getFullYear()}{' '}

            <span className="text-amber-400 font-semibold">
              Your Company
            </span>

            . All rights reserved.
          </p>

          <div className="flex gap-6 text-xs">

            <a
              href="/privacy"
              className="hover:text-amber-300 transition-colors duration-300"
            >
              Privacy Policy
            </a>

            <a
              href="/terms"
              className="hover:text-amber-300 transition-colors duration-300"
            >
              Terms of Service
            </a>

            <a
              href="/returns"
              className="hover:text-amber-300 transition-colors duration-300"
            >
              Returns
            </a>

          </div>
        </div>

        {/* Crafted By */}
        <p className="text-center mt-5 text-xs text-slate-600">

          Crafted with{' '}

          <span className="text-amber-400">
            ♥
          </span>{' '}

          by{' '}

          <span className="text-amber-400 font-medium">
            Syed Jawad Ali
          </span>

        </p>

      </div>

    </footer>
  );
};

export default Footer;
