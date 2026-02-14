import { useState, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, User, Heart, Shield, CreditCard, Settings, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion';

/**
 * ============================================
 * HELP CENTER PAGE
 * ============================================
 *
 * Scroll-based fade-up animations using Framer Motion
 * - Hero section with fade-in
 * - Category sidebar with stagger animation
 * - FAQ items with scroll-triggered animations
 * - Smooth accordion animations
 */

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ============================================
// ANIMATED SECTION WRAPPER
// ============================================

const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const prefersReducedMotion = useReducedMotion();

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: <User size={20} /> },
    { id: 'profile', name: 'Profile Management', icon: <Settings size={20} /> },
    { id: 'matching', name: 'Finding Matches', icon: <Heart size={20} /> },
    { id: 'privacy', name: 'Privacy & Security', icon: <Shield size={20} /> },
    { id: 'membership', name: 'Membership Plans', icon: <CreditCard size={20} /> },
    { id: 'general', name: 'General Questions', icon: <HelpCircle size={20} /> }
  ];

  const faqs = {
    'getting-started': [
      {
        question: 'How do I create an account?',
        answer: 'Creating an account is easy! Click on the "Register" button on the homepage and fill in your basic details including name, phone number, and gender. After registration, you can complete your profile with additional information.'
      },
      {
        question: 'Is registration free?',
        answer: 'Yes, registration is completely free. You can create your profile, browse matches, and use basic features without any charge. Premium features are available with our membership plans.'
      },
      {
        question: 'How long does the registration process take?',
        answer: 'The basic registration takes just 2-3 minutes. Completing your full profile with photos and preferences may take an additional 10-15 minutes, but it greatly improves your chances of finding the right match.'
      },
      {
        question: 'What documents do I need for verification?',
        answer: 'For profile verification, we may ask for your Aadhaar card, PAN card, or any government-issued ID. This helps us maintain the authenticity of profiles on our platform.'
      }
    ],
    'profile': [
      {
        question: 'How do I edit my profile?',
        answer: 'Log into your account and click on "Edit Profile" from the navigation menu or your profile page. You can update your personal details, photos, preferences, and other information at any time.'
      },
      {
        question: 'How many photos can I upload?',
        answer: 'You can upload up to 10 photos on your profile. We recommend uploading clear, recent photos to increase your profile visibility and credibility.'
      },
      {
        question: 'Can I hide my profile temporarily?',
        answer: 'Yes, you can hide your profile from search results while keeping your account active. Go to Settings > Privacy and toggle the "Hide Profile" option.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'To delete your account, go to Settings > Account and click on "Delete Account". Please note that this action is permanent and all your data will be removed.'
      }
    ],
    'matching': [
      {
        question: 'How does the matching algorithm work?',
        answer: 'Our matching algorithm considers multiple factors including age preferences, education, religion, location, and partner preferences you\'ve specified. We also consider horoscope compatibility for those who opt for it.'
      },
      {
        question: 'How do I send interest to someone?',
        answer: 'When viewing a profile, click on the "Send Interest" or heart icon. The other person will receive a notification and can choose to accept or decline your interest.'
      },
      {
        question: 'What happens when someone accepts my interest?',
        answer: 'When your interest is accepted, you become a "match" and can communicate with each other. You\'ll be notified on the platform.'
      },
      {
        question: 'Can I search for specific criteria?',
        answer: 'Yes! Use our advanced search feature to filter profiles by age, height, education, occupation, location, religion, and many other criteria to find your ideal match.'
      }
    ],
    'privacy': [
      {
        question: 'Who can see my profile?',
        answer: 'By default, all registered members can view your profile. You can control your privacy settings to restrict who can see your photos and contact information.'
      },
      {
        question: 'How do I report a suspicious profile?',
        answer: 'If you encounter a suspicious profile, click on the "Report" button on their profile page. Select the reason for reporting and provide any additional details. Our team will review and take appropriate action.'
      },
      {
        question: 'Is my personal information safe?',
        answer: 'Yes, we take privacy very seriously. Your personal information is encrypted and stored securely. We never share your information with third parties without your consent.'
      },
      {
        question: 'How do I block someone?',
        answer: 'To block a member, visit their profile and click on the "Block" option. Once blocked, they won\'t be able to view your profile or contact you.'
      }
    ],
    'membership': [
      {
        question: 'What membership plans are available?',
        answer: 'We offer three membership tiers: Gold, Platinum, and Premium. Each tier offers different features and benefits to enhance your matchmaking experience.'
      },
      {
        question: 'What are the benefits of a paid membership?',
        answer: 'Paid members get access to features like viewing contact details, sending unlimited messages, seeing who viewed their profile, priority customer support, and highlighted profile visibility.'
      },
      {
        question: 'How do I upgrade my membership?',
        answer: 'Go to the Membership section in your account and select the plan that suits you best. You can pay via credit/debit card, net banking, or UPI.'
      },
      {
        question: 'Can I get a refund?',
        answer: 'Refunds are processed as per our refund policy. If you\'re not satisfied within the first 7 days, you may be eligible for a partial refund. Please contact our support team for assistance.'
      }
    ],
    'general': [
      {
        question: 'How do I contact customer support?',
        answer: 'You can reach our support team via email at support@siruvapurimurugan.com, call us at +91 99999 99999, or use the WhatsApp chat option. Our team is available Monday to Saturday, 9 AM to 6 PM.'
      },
      {
        question: 'Is horoscope matching available?',
        answer: 'Yes, we offer horoscope matching services for those who believe in astrological compatibility. You can upload your horoscope details in the profile section.'
      },
      {
        question: 'Can family members help manage my profile?',
        answer: 'Yes, we understand the importance of family involvement in Indian matrimony. You can share your account access with trusted family members to help manage your profile.'
      },
      {
        question: 'How do I share a success story?',
        answer: 'Congratulations on finding your match! You can share your success story by contacting our support team. We love featuring real stories on our platform to inspire others.'
      }
    ]
  };

  const filteredFaqs = searchQuery
    ? Object.values(faqs).flat().filter(
        faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs[activeCategory];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={scaleIn}>
              <HelpCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
            >
              Help Center
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 mb-8"
            >
              Find answers to your questions and learn how to make the most of our platform.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              variants={fadeInUp}
              className="max-w-2xl mx-auto relative"
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-all duration-200"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Categories Sidebar */}
              {!searchQuery && (
                <motion.div
                  className="lg:col-span-1"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={slideInLeft}
                >
                  <div className="bg-white rounded-xl shadow-md p-4 sticky top-24">
                    <h2 className="font-bold text-gray-800 mb-4">Categories</h2>
                    <motion.nav
                      className="space-y-2"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {categories.map((category, index) => (
                        <CategoryButton
                          key={category.id}
                          category={category}
                          active={activeCategory === category.id}
                          onClick={() => setActiveCategory(category.id)}
                          index={index}
                        />
                      ))}
                    </motion.nav>
                  </div>
                </motion.div>
              )}

              {/* FAQs */}
              <div className={searchQuery ? 'lg:col-span-4' : 'lg:col-span-3'}>
                {searchQuery && (
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-gray-600">
                      Showing {filteredFaqs.length} results for "{searchQuery}"
                    </p>
                  </motion.div>
                )}

                <motion.div
                  className="space-y-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={staggerContainer}
                >
                  {filteredFaqs.map((faq, index) => (
                    <FAQItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                      index={index}
                    />
                  ))}
                </motion.div>

                {filteredFaqs.length === 0 && (
                  <motion.div
                    className="text-center py-12 bg-white rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-gray-600 mb-4">No results found for your search.</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-primary hover:underline"
                    >
                      Clear search
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Still Need Help?</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our support team is here to assist you. Don't hesitate to reach out with any questions or concerns.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/contact"
                  className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="https://wa.me/919840575388"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Chat on WhatsApp
                </a>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

// ============================================
// CATEGORY BUTTON COMPONENT
// ============================================

const CategoryButton = ({ category, active, onClick, index }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
        active
          ? 'bg-primary text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.4,
            delay: index * 0.05,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      whileHover={prefersReducedMotion ? {} : { x: 4 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
    >
      {category.icon}
      <span className="font-medium">{category.name}</span>
    </motion.button>
  );
};

// ============================================
// FAQ ITEM COMPONENT
// ============================================

const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className="bg-white rounded-xl shadow-md overflow-hidden"
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
        whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
      >
        <span className="font-semibold text-gray-800 pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <ChevronUp className="text-primary flex-shrink-0" size={20} />
          ) : (
            <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <motion.p
                className="text-gray-600"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HelpCenter;
