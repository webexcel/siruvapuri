import { useState, useRef } from 'react';
import { Heart } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/**
 * ============================================
 * SUCCESS STORIES PAGE
 * ============================================
 *
 * Scroll-based fade-up animations using Framer Motion
 * - Hero section with fade-in
 * - Filter buttons with stagger animation
 * - Story cards with scroll-triggered fade-up
 * - CTA section with fade-in
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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
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

const SuccessStories = () => {
  const [filter, setFilter] = useState('all');
  const prefersReducedMotion = useReducedMotion();

  const stories = [
    {
      id: 1,
      names: 'Karthik & Lakshmi',
      location: 'Chennai',
      date: 'November 2023',
      category: 'tamil',
      quote: 'We found each other through Siruvapuri Matrimony. The horoscope matching was precise and perfect. Our families connected instantly and we knew it was meant to be.',
      image: '/images/ss1.png',
      details: 'Both families were looking for a match within our community and Siruvapuri Matrimony helped us find exactly what we were looking for.'
    },
    {
      id: 2,
      names: 'Arun & Divya',
      location: 'Coimbatore',
      date: 'January 2024',
      category: 'tamil',
      quote: 'A seamless experience. Our families connected instantly and everything fell into place. The verification process gave us confidence.',
      image: '/images/ss2.jpg',
      details: 'We were impressed by the detailed profiles and the genuine nature of the platform. It made the entire process smooth and trustworthy.'
    },
    {
      id: 3,
      names: 'Suresh & Meera',
      location: 'Madurai',
      date: 'March 2024',
      category: 'tamil',
      quote: 'The verification process gave us trust and peace. Highly recommended for serious matches. We are grateful for this platform.',
      image: '/images/ss3.jpeg',
      details: 'Finding a compatible match was our priority and Siruvapuri Matrimony delivered exactly that with their thorough matching system.'
    },
    {
      id: 4,
      names: 'Karthik & Ishni',
      location: 'Bangalore',
      date: 'February 2024',
      category: 'south-indian',
      quote: 'We found each other through the platform and couldn\'t be happier. The profiles were genuine. Thank you for helping us start our journey together.',
      image: '/images/ss4.webp',
      details: 'As a South Indian family settled in Bangalore, we wanted to connect with our roots. This platform made it possible.'
    },
    {
      id: 5,
      names: 'Kumar & Aishwariya',
      location: 'Chennai',
      date: 'April 2024',
      category: 'inter-community',
      quote: 'It was love at first sight thanks to the detailed profiles. The compatibility matching is spot on. We are grateful.',
      image: '/images/ss5.jpeg',
      details: 'The platform respects all communities and helped us find each other despite different backgrounds.'
    },
    {
      id: 6,
      names: 'Micheal & Ivisha',
      location: 'Trichy',
      date: 'May 2024',
      category: 'tamil',
      quote: 'Finding love later in life seemed difficult, but this site made it easy. We connected over shared values.',
      image: '/images/ss6.webp',
      details: 'Age is just a number. We found each other at the right time thanks to this wonderful platform.'
    },
    {
      id: 7,
      names: 'Arjun & Priya',
      location: 'Salem',
      date: 'June 2024',
      category: 'tamil',
      quote: 'The traditional approach combined with modern technology made our match perfect. Our families are overjoyed.',
      image: '/images/ss7.jpeg',
      details: 'We appreciated how the platform balanced tradition with convenience. It felt like having a trusted family friend help with the match.'
    },
    {
      id: 8,
      names: 'Venkat & Swetha',
      location: 'Tirunelveli',
      date: 'July 2024',
      category: 'south-indian',
      quote: 'From the first meeting to our wedding, everything was blessed. Thank you Siruvapuri Murugan Matrimonial!',
      image: '/images/ss8.jpg',
      details: 'Our horoscopes matched perfectly and our families felt an instant connection. We believe it was divine intervention.'
    }
  ];

  const filteredStories = filter === 'all'
    ? stories
    : stories.filter(story => story.category === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="from-primary/10 to-primary/5 py-16 bg-no-repeat bg-center bg-cover relative"
        style={{ backgroundImage: "url(/images/ss.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={scaleIn}>
              <Heart className="w-16 h-16 text-white mx-auto mb-6" />
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Success Stories
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-white/90"
            >
              Real stories of love, trust, and beautiful beginnings. These couples found their perfect match through Siruvapuri Murugan Matrimonial.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b-2 border-b-gray-300">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              delay={0}
            >
              All Stories
            </FilterButton>
            <FilterButton
              active={filter === 'tamil'}
              onClick={() => setFilter('tamil')}
              delay={0.1}
            >
              Tamil
            </FilterButton>
            <FilterButton
              active={filter === 'south-indian'}
              onClick={() => setFilter('south-indian')}
              delay={0.2}
            >
              South Indian
            </FilterButton>
            <FilterButton
              active={filter === 'inter-community'}
              onClick={() => setFilter('inter-community')}
              delay={0.3}
            >
              Inter-Community
            </FilterButton>
          </motion.div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {filteredStories.map((story, index) => (
              <StoryCard key={story.id} story={story} index={index} />
            ))}
          </motion.div>

          {filteredStories.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-600 text-lg">No stories found for this category.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 bg-primary text-white relative overflow-hidden"
        style={{ backgroundImage: "url('/images/ss11.png')" }}
      >
        <div className="absolute inset-0 bg-primary/80" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-3xl font-bold mb-6">Ready to Write Your Own Love Story?</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of happy couples who found their perfect match with us.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <motion.a
              href="/register"
              className="inline-block px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Register Now - It's Free!
            </motion.a>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

// ============================================
// FILTER BUTTON COMPONENT
// ============================================

const FilterButton = ({ active, onClick, children, delay = 0 }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
        active
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

// ============================================
// STORY CARD COMPONENT
// ============================================

const StoryCard = ({ story, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={prefersReducedMotion ? {} : { y: -8 }}
    >
      <div className="relative h-64 overflow-hidden">
        <motion.img
          src={story.image}
          alt={story.names}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(story.names)}&size=400&background=00D26A&color=fff`;
          }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.span
          className="absolute bottom-4 left-4 bg-primary text-white text-xs font-semibold px-3 py-1 rounded"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
        >
          {story.location}
        </motion.span>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-gray-800 text-xl mb-1">{story.names}</h3>
        <p className="text-primary text-sm font-medium mb-4">Married - {story.date}</p>
        <div className="relative mb-4">
          <span className="text-primary text-3xl absolute -top-1 -left-1">"</span>
          <p className="text-gray-600 text-sm italic pl-5 pr-4">{story.quote}</p>
        </div>
        <p className="text-gray-500 text-sm">{story.details}</p>
      </div>
    </motion.div>
  );
};

export default SuccessStories;
