import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showError } from "../utils/sweetalert";
import { Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/**
 * ============================================
 * LOGIN PAGE - SIRUVAPURI MATRIMONIAL
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
        opacity="6"
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
      opacity="1"
    />
    <circle cx="40" cy="40" r="3" fill="currentColor" opacity="0.5" />
    <path
      d="M40 25 C45 25, 50 30, 50 40 C50 50, 45 55, 40 55"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="1"
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
 *
 * @param {number} speed - Parallax speed multiplier (0.1 to 1.0)
 *   - Lower = slower movement = appears further away
 *   - Higher = faster movement = appears closer
 *
 * @param {string} direction - 'vertical' | 'horizontal' | 'both'
 *
 * Performance notes:
 * - Uses translateY/translateX only (GPU accelerated)
 * - will-change: transform for compositor optimization
 * - Respects prefers-reduced-motion
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

  // Get scroll progress for this element
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Transform scroll progress to pixel movement
  // Range: -100 to 100 pixels based on speed
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

  // Subtle opacity fade for depth effect
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.6]);

  // If user prefers reduced motion, render without animations
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
// MAIN LOGIN COMPONENT
// ============================================

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { login } = useAuth();
  const navigate = useNavigate();

  // Container ref for scroll-based animations
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Parallax transforms for different layers
  // Background decorations - slowest (0.15x scroll speed)
  const bgParallaxY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Mid-layer decorations - medium speed (0.3x scroll speed)
  const midParallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Content layer - near natural (0.7x scroll speed)
  const contentParallaxY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData);

      if (result.success) {
        navigate("/dashboard");
      } else {
        showError(result.error || "Invalid email or password", "Login Failed");
      }
    } catch (err) {
      showError("Unable to login. Please try again later.", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        ease: [0.25, 0.46, 0.45, 0.94], // Custom ease for smooth feel
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
          Creates depth illusion with decorative elements
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
          Decorative elements at mid-depth
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
          MAIN CONTENT LAYER (0.7x scroll speed)
          ============================================ */}
      <motion.div
        className="relative z-10 min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
        style={{ y: prefersReducedMotion ? 0 : contentParallaxY }}
      >
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-stretch gap-0 lg:gap-0 bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden">

            {/* ============================================
                LEFT PANEL - Hero Image with Maalai
                ============================================ */}
            <div className="relative lg:w-1/2 min-h-[300px] sm:min-h-[400px] lg:min-h-[600px] overflow-hidden">
              {/* Background Image - Wedding Maalai */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/images/maalai.jpg')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* Fallback gradient if image doesn't load */}
              {/* <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950" /> */}

              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />

              {/* Parallax floating decorations on hero */}
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
                    transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
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
                    Begin your journey to a blessed union.
                  </motion.h1>

                  <motion.p
                    variants={itemVariants}
                    className="text-white/80 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md"
                  >
                    Trusted by thousands of families for authentic and traditional matchmaking.
                  </motion.p>

                  {/* Happy couples indicator */}
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-3"
                  >
                    {/* Avatar stack */}
                    {/* <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-semibold"
                        >
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-white/90 text-sm sm:text-base font-medium">
                      Join 10,000+ happy couples
                    </span> */}
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* ============================================
                RIGHT PANEL - Login Form
                ============================================ */}
            <div className="lg:w-1/2 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-sm mx-auto w-full"
              >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
                  {/* <p className="text-primary font-semibold text-sm sm:text-base tracking-wide uppercase mb-2">
                    Member Login
                  </p> */}
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Log in to continue your search for a life partner with confidence.
                  </p>
                </motion.div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Email Field */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email ID / Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        placeholder="Enter your email or mobile"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      {/* <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                      >
                        Forgot Password?
                      </Link> */}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-3 sm:py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full cursor-pointer text-white font-semibold py-3 sm:py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-sm sm:text-base"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)')}
                      onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
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
                          Signing in...
                        </>
                      ) : (
                        <>
                          Login
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

                {/* Divider */}
                {/* <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-4 my-6"
                >
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">
                    Or continue with
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </motion.div> */}

                {/* Google Sign In */}
                {/* <motion.button
                  variants={itemVariants}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 sm:py-3.5 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm sm:text-base font-medium text-gray-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </motion.button> */}

                {/* Register Link */}
                <motion.p
                  variants={itemVariants}
                  className="text-center text-gray-600 text-sm sm:text-base mt-6"
                >
                  Don't have an account yet?{" "}
                  <Link
                    to="/register"
                    className="text-primary font-semibold hover:text-primary-dark transition-colors"
                  >
                    Register Free
                  </Link>
                </motion.p>

                {/* Trust Badges */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 pt-6 border-t border-gray-100"
                >
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Secure Login</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Privacy Protected</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
