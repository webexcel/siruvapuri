import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../utils/api';
import { User, Search, Heart, Phone, Shield, Users, Flag, Settings } from 'lucide-react';
import { AnimateOnScroll } from '../hooks/useScrollAnimation.jsx';
import Swal from 'sweetalert2';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const avatarBgColor = theme?.primary?.replace('#', '') || '8B1538';
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.register(formData);

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Please wait for admin approval. Admin will set your password after approval.',
          confirmButtonColor: '#8B1538',
        });
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          gender: '',
          phone: ''
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error ||
                       err.response?.data?.message ||
                       'Registration failed. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMsg,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const successStories = [
    {
      id: 1,
      names: 'Karthik & Lakshmi',
      location: 'Chennai',
      date: 'NOV 2023',
      quote: 'We found each other through Siruvapuri Matrimony. The horoscope matching was precise and perfect.',
      image: '/images/img/home/couple1.png'
    },
    {
      id: 2,
      names: 'Arun & Divya',
      location: 'Coimbatore',
      date: 'JAN 2024',
      quote: 'A seamless experience. Our families connected instantly and everything fell into place.',
      image: '/images/img/home/couple2.png'
    },
    {
      id: 3,
      names: 'Suresh & Meera',
      location: 'Madurai',
      date: 'MAR 2024',
      quote: 'The verification process gave us trust and peace. Highly recommended for serious matches.',
      image: '/images/img/home/couple3.png'
    }
  ];

  const extendedStories = [
    {
      id: 4,
      names: 'Karthik & Ishni',
      info: 'South Indian - 32',
      quote: 'We found each other through the platform and couldn\'t be happier. The profiles were genuine. Thank you for helping us start our journey together.',
      image: '/images/img/cards/story1.png',
      align: 'left'
    },
    {
      id: 5,
      names: 'Sammer & Aisha',
      info: 'Chennai - 27',
      quote: 'It was love at first sight thanks to the detailed profiles. The compatibility matching is spot on. We are grateful.',
      image: '/images/img/cards/story2.png',
      align: 'right'
    },
    {
      id: 6,
      names: 'Micheal & Ivisha',
      info: 'Tamil - 32',
      quote: 'Finding love later in life seemed difficult, but this site made it easy. We connected over shared values.',
      image: '/images/img/cards/story3.png',
      align: 'left'
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section with Wedding Image Background */}
      <section
        className="relative min-h-[400px] sm:min-h-[500px] md:min-h-[600px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: ` url('./images/home.png')`,
          backgroundSize: 'cover',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 sm:from-black/60 sm:to-black/30"></div>

        <div className="relative container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
          <AnimateOnScroll animation="fade-up" duration={800}>
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif italic text-white mb-3 sm:mb-4 mt-12 sm:mt-20 md:mt-28 leading-tight">
                Begin your auspicious journey toward divine union
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8">
                Find a soulmate who shares your heritage, values and beliefs. We bring together families with warmth.
              </p>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Quick Registration Form */}
        {!isAuthenticated && (
          <div className="absolute left-0 right-0 mx-auto -bottom-52 sm:-bottom-36 md:-bottom-24 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-4xl px-0">
            <AnimateOnScroll animation="fade-up" delay={200} duration={800}>
              <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 border border-gray-100">
                <h2 className="text-center text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center justify-center gap-1">
                  <span className="text-base">🤝</span>
                  Quick Registration
                  <span className="text-base">🤝</span>
                </h2>

                <form onSubmit={handleQuickRegister}>
                  {/* All fields in responsive grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    <input
                      type="text"
                      name="first_name"
                      placeholder="First Name *"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      name="last_name"
                      placeholder="Last Name *"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                      required
                    >
                      <option value="">Gender *</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <div className="flex">
                      <span className="px-2 py-2 text-sm bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Mobile *"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-2 text-sm bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Registering...
                        </>
                      ) : (
                        'REGISTER NOW'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </AnimateOnScroll>
          </div>
        )}
      </section>

      {/* Spacer for registration form */}
      {!isAuthenticated && <div className="h-56 sm:h-40 md:h-28"></div>}

      {/* Three Steps Section */}
      <section className="py-10 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="flex items-center justify-center mb-6 sm:mb-8 md:mb-12">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-12 sm:w-24"></div>
              <Settings className="mx-2 sm:mx-4 text-primary" size={20} />
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-12 sm:w-24"></div>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-2 sm:mb-4">
              Three Steps For Your Muhurtham
            </h2>
            <p className="text-center text-gray-500 text-sm sm:text-base mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
              Simple and easy process to find your perfect life partner
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            <AnimateOnScroll animation="fade-up" delay={0}>
              <StepCard
                icon={<User className="text-primary" size={28} />}
                iconBg="bg-primary/10"
                title="Create Profile"
                description="Share your basic details and preferences"
                step="01"
              />
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={150}>
              <StepCard
                icon={<Search className="text-primary" size={28} />}
                iconBg="bg-primary/10"
                title="Find Your Matches"
                description="See compatible profiles that match your muhurtham and expectations."
                step="02"
              />
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={300}>
              <StepCard
                icon={<Heart className="text-primary" size={28} />}
                iconBg="bg-primary/10"
                title="Connect"
                description="Families talk, share horoscopes, and plan the next step."
                step="03"
              />
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Blessed Matches Section */}
      <section className="py-10 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-12 sm:w-24"></div>
              <div className="mx-2 sm:mx-4 text-primary">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z"/>
                </svg>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-12 sm:w-24"></div>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-2">
              Blessed Matches from Our Community
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-primary to-primary-light mx-auto mb-3 sm:mb-4 rounded-full"></div>
            <p className="text-center text-gray-500 text-sm sm:text-base mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
              Real stories from couples who found their perfect match through Siruvapuri Matrimony
            </p>
          </AnimateOnScroll>

          {/* Success Stories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto mb-10 sm:mb-16">
            {successStories.map((story, index) => (
              <AnimateOnScroll key={story.id} animation="fade-up" delay={index * 150}>
                <SuccessStoryCard story={story} />
              </AnimateOnScroll>
            ))}
          </div>

          {/* Extended Stories - Alternating Layout */}
          <div className="max-w-5xl mx-auto space-y-10 sm:space-y-16 md:space-y-20">
            {extendedStories.map((story, index) => (
              <AnimateOnScroll
                key={story.id}
                animation={story.align === 'left' ? 'fade-right' : 'fade-left'}
                delay={100}
              >
                <ExtendedStoryCard story={story} />
              </AnimateOnScroll>
            ))}
          </div>

          {/* View More Stories Button */}
          <AnimateOnScroll animation="fade-up" delay={200}>
            <div className="text-center mt-10 sm:mt-16">
              <Link
                to="/success-stories"
                className="inline-flex items-center px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-800 text-gray-800 font-semibold rounded-full hover:bg-gray-800 hover:text-white transition-all duration-300 hover:shadow-lg"
              >
                View More Stories →
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section className="py-10 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12">
            {/* Left Content */}
            <AnimateOnScroll animation="fade-right" className="lg:w-1/3 text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
                Safety & Trust<br />for Your Family
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Every profile is checked to ensure a trustworthy and secure matchmaking experience.
              </p>
            </AnimateOnScroll>

            {/* Trust Features */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-4 sm:gap-8 lg:gap-12">
              <AnimateOnScroll animation="fade-up" delay={0}>
                <TrustFeature
                  icon={<Phone size={20} />}
                  title="Mobile-verified"
                  subtitle="Profiles"
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={100}>
                <TrustFeature
                  icon={<Shield size={20} />}
                  title="Manual Review"
                  subtitle="by Team"
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={200}>
                <TrustFeature
                  icon={<Users size={20} />}
                  title="Family-oriented"
                  subtitle="Matches"
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={300}>
                <TrustFeature
                  icon={<Flag size={20} />}
                  title="Report & Block"
                  subtitle="Safety"
                />
              </AnimateOnScroll>
            </div>
          </div>

          {/* Help Section */}
          <AnimateOnScroll animation="fade-up" delay={200}>
            <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-center justify-between mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
              <div className="mb-4 md:mb-0">
                <h3 className="font-bold text-gray-800 text-base sm:text-lg">Need Help?</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Our support team is here to assist you</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <a
                  href="tel:+919999999999"
                  className="px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-800 text-gray-800 font-semibold rounded-full hover:bg-gray-800 hover:text-white transition-all duration-300 text-center"
                >
                  Call Us
                </a>
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 text-center"
                >
                  Connect on WhatsApp
                </a>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
};

// Step Card Component
const StepCard = ({ icon, iconBg, title, description, step }) => (
  <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden">
    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-4xl sm:text-5xl md:text-6xl font-bold text-gray-100 group-hover:text-primary/10 transition-colors duration-300">
      {step}
    </div>
    <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3">{title}</h3>
    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{description}</p>
  </div>
);

// Success Story Card Component
const SuccessStoryCard = ({ story }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
      <img
        src={story.image}
        alt={story.names}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(story.names)}&size=400&background=${avatarBgColor}&color=fff`;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <span className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-primary text-white text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
        {story.location}
      </span>
    </div>
    <div className="p-4 sm:p-5 md:p-6">
      <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1">{story.names}</h3>
      <p className="text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">MARRIED - {story.date}</p>
      <div className="relative">
        <span className="text-primary/30 text-3xl sm:text-4xl md:text-5xl absolute -top-1 sm:-top-2 -left-1 sm:-left-2">"</span>
        <p className="text-gray-600 text-xs sm:text-sm italic pl-4 sm:pl-6 pr-2 sm:pr-4 leading-relaxed">{story.quote}</p>
      </div>
    </div>
  </div>
);

// Extended Story Card Component
const ExtendedStoryCard = ({ story }) => (
  <div className={`flex flex-col ${story.align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} gap-4 sm:gap-6 md:gap-8 items-center`}>
    <div className="w-full md:w-1/2">
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl group">
        <img
          src={story.image}
          alt={story.names}
          className="w-full h-56 sm:h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(story.names)}&size=600&background=${avatarBgColor}&color=fff`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
    </div>
    <div className="w-full md:w-1/2 text-center md:text-left">
      <h3 className="font-bold text-gray-800 text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">{story.names}</h3>
      <p className="text-primary font-medium text-sm sm:text-base mb-3 sm:mb-4">{story.info}</p>
      <div className="flex items-start gap-2 justify-center md:justify-start">
        <span className="text-primary/30 text-2xl sm:text-3xl md:text-4xl leading-none">"</span>
        <p className="text-gray-600 text-sm sm:text-base italic leading-relaxed">{story.quote}</p>
      </div>
    </div>
  </div>
);

// Trust Feature Component
const TrustFeature = ({ icon, title, subtitle }) => (
  <div className="text-center group">
    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-gray-700 group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110">
      {icon}
    </div>
    <p className="font-semibold text-gray-800 text-xs sm:text-sm">{title}</p>
    <p className="text-gray-500 text-[10px] sm:text-xs">{subtitle}</p>
  </div>
);

export default Home;
