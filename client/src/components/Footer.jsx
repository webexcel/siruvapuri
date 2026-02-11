import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white mt-auto">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 group">
              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 bg-white rounded-lg p-1 sm:p-1.5 flex items-center justify-center">
                <img
                  src="/images/logo.jpeg"
                  alt="Siruvapuri Murugan Matrimony"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base sm:text-lg md:text-xl font-bold">
                  Siruvapuri Murugan
                </h3>
                <span className="text-[10px] sm:text-xs font-medium text-primary tracking-wider uppercase">
                  Matrimony
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
              A trusted platform for South Indian weddings, bringing families together with tradition and technology.
            </p>
            {/* Social/Contact Icons */}
            <div className="flex space-x-2 sm:space-x-3">
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
              >
                <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
              <a
                href="mailto:info@siruvapurimurugan.com"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
              <a
                href="tel:+919999999999"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Phone size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg relative">
              Company
              <span className="absolute bottom-0 left-0 w-6 sm:w-8 h-0.5 bg-primary -mb-1 sm:-mb-2"></span>
            </h4>
            <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm mt-3 sm:mt-4">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 inline-block">
                  Success Stories
                </Link>
              </li>
              {/* <li>
                <Link to="/contact" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 inline-block">
                  Careers
                </Link>
              </li> */}
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 inline-block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg relative">
              Help & Support
              <span className="absolute bottom-0 left-0 w-6 sm:w-8 h-0.5 bg-primary -mb-1 sm:-mb-2"></span>
            </h4>
            <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm mt-3 sm:mt-4">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 inline-block">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 inline-block">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 inline-block">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-semibold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg relative">
              Get in Touch
              <span className="absolute bottom-0 left-0 w-6 sm:w-8 h-0.5 bg-primary -mb-1 sm:-mb-2"></span>
            </h4>
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm mt-3 sm:mt-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Phone size={16} className="text-primary mt-0.5 sm:w-[18px] sm:h-[18px]" />
                <div>
                  <p className="text-gray-400">Call us at</p>
                  <a href="tel:+919999999999" className="text-white hover:text-primary transition-colors">
                    +91 99999 99999
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Mail size={16} className="text-primary mt-0.5 sm:w-[18px] sm:h-[18px]" />
                <div>
                  <p className="text-gray-400">Email us at</p>
                  <a href="mailto:info@siruvapurimurugan.com" className="text-white hover:text-primary transition-colors text-xs sm:text-sm break-all">
                    info@siruvapurimurugan.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col items-center gap-3 sm:gap-4 md:flex-row md:justify-between">
            <p className="text-xs sm:text-sm text-gray-500 text-center md:text-left">
              &copy; {new Date().getFullYear()} Siruvapuri Murugan Matrimonial. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link to="/privacy" className="text-gray-500 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-white transition-colors">
                Terms
              </Link>
              <Link to="/cookies" className="text-gray-500 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
