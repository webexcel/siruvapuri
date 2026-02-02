import { Link } from 'react-router-dom';
import { Home as HomeIcon, Shield, Heart, Users, MapPin, Award, ArrowRight } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative mx-4 md:mx-8 mt-4 rounded-3xl overflow-hidden">
        <div
          className="relative min-h-[400px] bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/about.png')`,
          }}
        >
          <div className="absolute inset-0 bg-black/30 rounded-3xl"></div>
          <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[400px] text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-2xl">
              Uniting Hearts Preserving Traditions
            </h1>
            <p className="text-white/90 text-lg max-w-xl mb-8">
              Welcome to Siruvapuri Murugan Matrimonial. Where ancient values meet modern compatibility, creating a sacred space for finding your life partner under the blessings of Murugan.
            </p>
            <Link
              to="/success-stories"
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
            >
              View Success Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Our Origin Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-0.5 bg-primary"></div>
                  <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Origin</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                  Bridging Heritage & Harmony
                </h2>
                <p className="text-gray-600 mb-4">
                  Born from the blessings of Siruvapuri, our platform bridges the gap between ancient family values and modern matchmaking. We started with a simple vision: to create a space where South Indian families can find life partners with confidence, guided by simplicity and predictability.
                </p>
                <p className="text-gray-600 mb-6">
                  We understand that a wedding is not just a union of two individuals, but a coming together of families, horoscopes, and traditions.
                </p>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-200"
                >
                  Read Our Full History
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* Right Image */}
              <div className="relative">
                <img
                  src="/images/about-card.png"
                  alt="Happy Family"
                  className="w-full h-80 object-cover rounded-2xl shadow-lg"
                  // onError={(e) => {
                  //   e.target.src = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=400&fit=crop';
                  // }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Mission & Values
            </h2>
            <p className="text-gray-600">
              We are committed to fostering genuine connections rooted in safety and cultural reverence, ensuring every match is a step towards a prosperous future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ValueCard
              icon={<HomeIcon className="text-primary" size={24} />}
              title="Cultural Reverence"
              description="Honoring the sanctity of South Indian wedding rituals, nakshatras, and family traditions in every match we suggest."
            />
            <ValueCard
              icon={<Shield className="text-primary" size={24} />}
              title="Safety First"
              description="100% mobile-verified profiles and strict moderation to ensure your emotional trust and peace of mind throughout the journey."
            />
            <ValueCard
              icon={<Heart className="text-primary" size={24} />}
              title="Genuine Connections"
              description="Algorithms designed not just for clicks, but for deep compatibility and long-lasting family bonds that stand the test of time."
            />
          </div>
        </div>
      </section>

      {/* Why Families Trust Us Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              {/* Left Content */}
              <div className="lg:col-span-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Why Families<br />Trust Us
                </h2>
                <p className="text-white/80">
                  Our dedication to authenticity and service has made us a household name for auspicious beginnings.
                </p>
              </div>

              {/* Stats */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={<Users className="text-primary" size={24} />}
                  number="10k+"
                  label="Happy Marriages"
                />
                <StatCard
                  icon={<MapPin className="text-primary" size={24} />}
                  number="100%"
                  label="Verified Profiles"
                />
                <StatCard
                  icon={<Award className="text-primary" size={24} />}
                  number="15+"
                  label="Years of Service"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Ready to find your soulmate?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Join thousands of happy couples who found their perfect match through Siruvapuri Murugan Matrimonial. Your journey begins here.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Register Free
          </Link>
        </div>
      </section>
    </div>
  );
};

// Value Card Component
const ValueCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, number, label }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
      {icon}
    </div>
    <div className="text-3xl font-bold text-white mb-1">{number}</div>
    <div className="text-white/80 text-sm">{label}</div>
  </div>
);

export default AboutUs;
