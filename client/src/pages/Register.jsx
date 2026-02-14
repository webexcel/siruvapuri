import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI, membershipAPI } from '../utils/api';
import { useModules } from '../context/ModuleContext';
import { showSuccess, showError } from '../utils/sweetalert';
import { User, Phone, Calendar, Users, Shield, Lock, Crown, Star, Award, Check } from 'lucide-react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

/**
 * ============================================
 * REGISTER PAGE - SIRUVAPURI MATRIMONIAL
 * ============================================
 *
 * PARALLAX ANIMATION STRATEGY:
 * ---------------------------
 * This component uses scroll-based parallax with layered depth:
 *
 * Layer speeds (relative to scroll):
 * - Background layer: 0.1x - 0.2x (slowest, creates depth)
 * - Decorative elements: 0.3x - 0.4x (mid-depth accents)
 * - Content layer: 0.6x - 0.8x (foreground, near-natural)
 *
 * MOBILE PERFORMANCE OPTIMIZATIONS:
 * - Uses only GPU-friendly properties: transform, opacity
 * - will-change hint for compositor optimization
 * - Respects prefers-reduced-motion for accessibility
 * - No heavy 3D transforms or WebGL
 * - Lightweight SVG decorations instead of images
 */

// ============================================
// DECORATIVE SVG COMPONENTS
// ============================================

/**
 * Traditional South Indian Kolam/Rangoli pattern
 * Lightweight SVG - perfect for mobile parallax
 */
const KolamPattern = ({ className = "", size = 100 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.6" />
    <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="1" opacity="0.4" fill="none" />
    <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="0.5" opacity="0.3" fill="none" />
    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.5" opacity="0.2" fill="none" />
    {/* Petal shapes */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <ellipse
        key={angle}
        cx="50"
        cy="25"
        rx="4"
        ry="8"
        fill="currentColor"
        opacity="0.3"
        transform={`rotate(${angle} 50 50)`}
      />
    ))}
  </svg>
);

/**
 * Traditional Mango Paisley motif
 * Common in South Indian wedding decorations
 */
const PaisleyMotif = ({ className = "", size = 80 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M40 10 C60 10, 70 30, 70 50 C70 70, 50 75, 40 70 C30 65, 20 50, 20 35 C20 20, 30 10, 40 10"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      opacity="0.4"
    />
    <circle cx="40" cy="40" r="3" fill="currentColor" opacity="0.5" />
    <path
      d="M40 25 C45 25, 50 30, 50 40 C50 50, 45 55, 40 55"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.3"
    />
  </svg>
);

/**
 * Jasmine flower garland element
 * Represents the maalai shown in the screenshot
 */
const JasmineFlower = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.8" />
    {[0, 60, 120, 180, 240, 300].map((angle) => (
      <ellipse
        key={angle}
        cx="12"
        cy="6"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
        transform={`rotate(${angle} 12 12)`}
      />
    ))}
  </svg>
);

/**
 * Lotus flower - sacred symbol in Hindu weddings
 */
const LotusFlower = ({ className = "", size = 60 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 60"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    {/* Outer petals */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
      <ellipse
        key={`outer-${angle}`}
        cx="30"
        cy="12"
        rx="5"
        ry="12"
        fill="currentColor"
        opacity="0.3"
        transform={`rotate(${angle} 30 30)`}
      />
    ))}
    {/* Inner petals */}
    {[15, 75, 135, 195, 255, 315].map((angle) => (
      <ellipse
        key={`inner-${angle}`}
        cx="30"
        cy="18"
        rx="4"
        ry="9"
        fill="currentColor"
        opacity="0.5"
        transform={`rotate(${angle} 30 30)`}
      />
    ))}
    {/* Center */}
    <circle cx="30" cy="30" r="6" fill="currentColor" opacity="0.7" />
  </svg>
);

// ============================================
// PARALLAX LAYER COMPONENT
// ============================================

/**
 * ParallaxLayer - Reusable parallax wrapper
 */
const ParallaxLayer = ({
  children,
  speed = 0.5,
  direction = "vertical",
  className = "",
  style = {},
}) => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yTransform = useTransform(
    scrollYProgress,
    [0, 1],
    [100 * speed, -100 * speed]
  );

  const xTransform = useTransform(
    scrollYProgress,
    [0, 1],
    [50 * speed, -50 * speed]
  );

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.6]);

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y: direction === "vertical" || direction === "both" ? yTransform : 0,
        x: direction === "horizontal" || direction === "both" ? xTransform : 0,
        opacity,
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// MAIN REGISTER COMPONENT
// ============================================

const Register = () => {
  const location = useLocation();
  const { isModuleEnabled } = useModules();
  const isMembershipEnabled = isModuleEnabled('membership');
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    age: '',
    gender: '',
    interested_membership: '',
  });

  // Membership plans fetched from API
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const navigate = useNavigate();

  // Container ref for scroll-based animations
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Parallax transforms for different layers
  const bgParallaxY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const midParallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const contentParallaxY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  // Pre-fill form with quick registration data if available
  useEffect(() => {
    const quickData = location.state?.quickData;
    const storedData = localStorage.getItem('quickRegisterData');
    const parsedStoredData = storedData ? JSON.parse(storedData) : null;
    const data = quickData || parsedStoredData;

    if (data) {
      const nameParts = (data.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        first_name: firstName,
        last_name: lastName,
        phone: data.mobile || '',
        gender: data.gender || '',
      }));

      localStorage.removeItem('quickRegisterData');
    }
  }, [location.state]);

  // Fetch membership plans from API
  useEffect(() => {
    if (!isMembershipEnabled) return;

    const fetchPlans = async () => {
      try {
        const response = await membershipAPI.getActivePlans();
        if (response.data?.success && response.data.plans) {
          const plans = response.data.plans.map((plan, index) => {
            // Parse features if it's a string
            const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || []);
            const color = plan.color || 'from-gray-400 to-gray-600';

            // Map color family to Tailwind-safe border/bg classes
            const colorMap = {
              yellow: { borderColor: 'border-yellow-400', bgColor: 'bg-yellow-50' },
              gray: { borderColor: 'border-gray-400', bgColor: 'bg-gray-50' },
              purple: { borderColor: 'border-purple-400', bgColor: 'bg-purple-50' },
              blue: { borderColor: 'border-blue-400', bgColor: 'bg-blue-50' },
              green: { borderColor: 'border-green-400', bgColor: 'bg-green-50' },
              red: { borderColor: 'border-red-400', bgColor: 'bg-red-50' },
              pink: { borderColor: 'border-pink-400', bgColor: 'bg-pink-50' },
              orange: { borderColor: 'border-orange-400', bgColor: 'bg-orange-50' },
              amber: { borderColor: 'border-amber-400', bgColor: 'bg-amber-50' },
              indigo: { borderColor: 'border-indigo-400', bgColor: 'bg-indigo-50' },
            };
            const colorMatch = color.match(/from-(\w+)-/);
            const colorFamily = colorMatch ? colorMatch[1] : 'gray';
            const { borderColor, bgColor } = colorMap[colorFamily] || colorMap.gray;

            // Assign icons based on plan index
            const icons = [Award, Star, Crown];
            const icon = icons[index] || Crown;

            return {
              id: plan.name.toLowerCase(),
              name: plan.name,
              price: `₹${Number(plan.price).toLocaleString('en-IN')}`,
              duration: `${plan.duration_months} Months`,
              icon,
              color,
              borderColor,
              bgColor,
              features,
            };
          });
          setMembershipPlans(plans);
        }
      } catch (err) {
        console.error('Failed to fetch membership plans:', err);
      }
    };

    fetchPlans();
  }, [isMembershipEnabled]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);

      if (response.data.success) {
        await showSuccess(
          'Registration successful! Please wait for admin approval to set your password.',
          'Registration Submitted'
        );
        navigate('/');
      }
    } catch (err) {
      // Handle different error response formats
      const errorMsg = err.response?.data?.error ||
                       err.response?.data?.message ||
                       (err.response?.data?.errors && err.response?.data?.errors[0]?.msg) ||
                       'Registration failed. Please try again.';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden"
    >
      {/* ============================================
          BACKGROUND PARALLAX LAYER (Slowest - 0.15x)
          ============================================ */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ y: prefersReducedMotion ? 0 : bgParallaxY }}
      >
        {/* Top-left Kolam pattern */}
        <div className="absolute -top-10 -left-10 text-primary/10">
          <KolamPattern size={200} />
        </div>

        {/* Bottom-right Lotus */}
        <div className="absolute bottom-20 right-10 text-primary/10 hidden md:block">
          <LotusFlower size={120} />
        </div>

        {/* Scattered Jasmine flowers */}
        <div className="absolute top-1/4 right-1/4 text-primary/15">
          <JasmineFlower size={32} />
        </div>
        <div className="absolute top-1/2 left-10 text-primary/10 hidden sm:block">
          <JasmineFlower size={24} />
        </div>
      </motion.div>

      {/* ============================================
          MID-LAYER PARALLAX (Medium - 0.3x)
          ============================================ */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ y: prefersReducedMotion ? 0 : midParallaxY }}
      >
        {/* Paisley motifs */}
        <div className="absolute top-1/3 -left-5 text-primary/15 rotate-45">
          <PaisleyMotif size={100} />
        </div>
        <div className="absolute bottom-1/4 right-5 text-primary/10 -rotate-12 hidden lg:block">
          <PaisleyMotif size={80} />
        </div>

        {/* Additional Kolam */}
        <div className="absolute bottom-10 left-1/4 text-primary/8 hidden md:block">
          <KolamPattern size={150} />
        </div>
      </motion.div>

      {/* ============================================
          MAIN CONTENT LAYER
          ============================================ */}
      <motion.div
        className="relative z-10 min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
        style={{ y: prefersReducedMotion ? 0 : contentParallaxY }}
      >
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-stretch gap-0 bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden">

            {/* ============================================
                LEFT PANEL - Hero Image
                ============================================ */}
            <div className="relative lg:w-5/12 min-h-[280px] sm:min-h-[350px] lg:min-h-[700px] overflow-hidden">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/images/register.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />

              {/* Parallax floating decorations */}
              <ParallaxLayer
                speed={0.2}
                direction="vertical"
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute top-10 left-10 text-white/20">
                  <KolamPattern size={60} />
                </div>
                <div className="absolute bottom-20 right-8 text-white/15 hidden sm:block">
                  <LotusFlower size={50} />
                </div>
              </ParallaxLayer>

              {/* Content overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
                {/* Heart icon badge */}
                <ParallaxLayer speed={0.3} direction="vertical">
                  <motion.div
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 sm:mb-6"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                  >
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </motion.div>
                </ParallaxLayer>

                {/* Main heading */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.h1
                    variants={itemVariants}
                    className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white leading-tight mb-3 sm:mb-4"
                  >
                    Start your sacred journey today.
                  </motion.h1>

                  <motion.p
                    variants={itemVariants}
                    className="text-white/80 text-sm sm:text-base lg:text-lg mb-4 max-w-md"
                  >
                    Join thousands of families who found their perfect match through our trusted platform.
                  </motion.p>
                </motion.div>
              </div>
            </div>

            {/* ============================================
                RIGHT PANEL - Registration Form
                ============================================ */}
            <div className="lg:w-7/12 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center overflow-y-auto">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full"
              >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Create Your Profile
                  </h2>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Join us to find your perfect life partner with confidence.
                  </p>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Fields Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="First name"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Middle Name - Optional */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Middle Name <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="middle_name"
                        value={formData.middle_name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        placeholder="Middle name"
                      />
                    </div>
                  </motion.div>

                  {/* Phone and Age Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="9876543210"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="Age"
                          min="18"
                          max="100"
                          required
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Gender Field */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className='hover:bg-primary-light'>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Membership Interest - Optional - Only show if membership module is enabled */}
                  {isMembershipEnabled && (
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interested Membership <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        Choose a plan you're interested in. You can decide later after registration.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {membershipPlans.map((plan) => {
                          const Icon = plan.icon;
                          const isSelected = formData.interested_membership === plan.id;
                          return (
                            <motion.label
                              key={plan.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`relative cursor-pointer rounded-xl border-2 p-3 sm:p-4 transition-all duration-200 ${
                                isSelected
                                  ? `${plan.borderColor} ${plan.bgColor} shadow-md`
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                              }`}
                            >
                              <input
                                type="radio"
                                name="interested_membership"
                                value={plan.id}
                                checked={isSelected}
                                onChange={handleChange}
                                className="sr-only"
                              />

                              {/* Selected indicator */}
                              {isSelected && (
                                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}

                              {/* Plan Icon & Name */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-gray-800 text-sm">{plan.name}</span>
                              </div>

                              {/* Price & Duration */}
                              <div className="mb-2">
                                <span className="text-lg font-bold text-gray-900">{plan.price}</span>
                                <span className="text-xs text-gray-500 ml-1">/ {plan.duration}</span>
                              </div>

                              {/* Features (truncated for mobile) */}
                              <ul className="space-y-1 hidden sm:block">
                                {plan.features.slice(0, 2).map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                                    <span className="truncate">{feature}</span>
                                  </li>
                                ))}
                                {plan.features.length > 2 && (
                                  <li className="text-xs text-gray-400">+{plan.features.length - 2} more</li>
                                )}
                              </ul>
                            </motion.label>
                          );
                        })}
                      </div>

                      {/* Clear Selection */}
                      {formData.interested_membership && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, interested_membership: '' }))}
                          className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          Clear selection
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* Info Note */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3"
                  >
                    <Lock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>Admin will create your password after approval. You'll be notified once approved.</span>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full cursor-pointer bg-primary hover:bg-primary-dark text-white font-semibold py-3 sm:py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Register
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </motion.div>
                </form>

                {/* Login Link */}
                <motion.p
                  variants={itemVariants}
                  className="text-center text-gray-600 text-sm sm:text-base mt-6"
                >
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary font-semibold hover:text-primary-dark transition-colors"
                  >
                    Sign in here
                  </Link>
                </motion.p>

                {/* Trust Badges */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-gray-100"
                >
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Secure Registration</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Privacy Protected</span>
                  </div>
                </motion.div>

                {/* Terms & Privacy */}
                <motion.p
                  variants={itemVariants}
                  className="text-center text-xs text-gray-400 mt-4"
                >
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
