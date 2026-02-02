import { Shield, AlertTriangle, Eye, Lock, Phone, Users, Flag, CheckCircle } from 'lucide-react';

const SafetyTips = () => {
  const safetyCategories = [
    {
      icon: <Eye className="text-blue-500" size={28} />,
      title: 'Protect Your Personal Information',
      tips: [
        'Never share your password with anyone, including people claiming to be from our support team.',
        'Avoid sharing financial information like bank details, credit card numbers, or PAN card details.',
        'Don\'t share your home address until you\'re sure about the person and have met in person.',
        'Use our platform\'s messaging system instead of sharing personal phone numbers immediately.',
        'Be cautious about sharing personal photos outside the platform.'
      ]
    },
    {
      icon: <AlertTriangle className="text-yellow-500" size={28} />,
      title: 'Recognize Warning Signs',
      tips: [
        'Be wary if someone quickly professes strong feelings or asks for money.',
        'Watch out for inconsistencies in their profile information or stories.',
        'Be cautious if they refuse to video call or meet in person.',
        'Avoid people who pressure you to make quick decisions about marriage.',
        'Be skeptical of profiles that seem too good to be true.'
      ]
    },
    {
      icon: <Users className="text-primary" size={28} />,
      title: 'Meeting in Person',
      tips: [
        'Always meet in a public place for the first few meetings.',
        'Inform your family or friends about your meeting plans and location.',
        'Consider having a family member or friend present during initial meetings.',
        'Trust your instincts - if something feels wrong, leave the situation.',
        'Don\'t accept drinks or food from strangers; order directly from staff.'
      ]
    },
    {
      icon: <Phone className="text-purple-500" size={28} />,
      title: 'Phone & Online Safety',
      tips: [
        'Use our platform\'s communication features before sharing personal contact details.',
        'Video call before meeting in person to verify the person\'s identity.',
        'Don\'t click on suspicious links sent by other users.',
        'Be cautious about downloading attachments from unknown profiles.',
        'Report any suspicious messages or behavior immediately.'
      ]
    }
  ];

  const dosList = [
    'Verify profiles thoroughly before showing serious interest',
    'Involve your family in the matchmaking process',
    'Use our verification features to confirm authenticity',
    'Report suspicious profiles or behavior immediately',
    'Take your time to know the person before making decisions',
    'Meet in public places with family present initially',
    'Verify all claims about education, job, and family independently',
    'Trust your instincts and don\'t ignore red flags'
  ];

  const dontsList = [
    'Don\'t share financial information or send money to anyone',
    'Don\'t meet alone without informing family members',
    'Don\'t share personal documents like Aadhaar or passport',
    'Don\'t ignore inconsistencies in profiles or conversations',
    'Don\'t rush into decisions under pressure',
    'Don\'t share intimate photos or videos',
    'Don\'t accept gifts or favors from strangers',
    'Don\'t ignore warnings from family and friends'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Safety Tips
            </h1>
            <p className="text-xl text-gray-600">
              Your safety is our priority. Follow these guidelines to have a secure and positive matchmaking experience.
            </p>
          </div>
        </div>
      </section>

      {/* Our Commitment Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Our Commitment to Your Safety</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SafetyFeature
                icon={<Shield className="text-primary" size={24} />}
                title="Profile Verification"
                description="Every profile is manually verified by our team"
              />
              <SafetyFeature
                icon={<Phone className="text-primary" size={24} />}
                title="Mobile Verification"
                description="Phone numbers are verified for authenticity"
              />
              <SafetyFeature
                icon={<Eye className="text-primary" size={24} />}
                title="Manual Review"
                description="Our team reviews profiles and photos"
              />
              <SafetyFeature
                icon={<Flag className="text-primary" size={24} />}
                title="Report & Block"
                description="Easy tools to report suspicious behavior"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Safety Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {safetyCategories.map((category, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{category.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-3">
                        <CheckCircle className="text-primary flex-shrink-0 mt-0.5" size={18} />
                        <span className="text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Do's and Don'ts Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Do's and Don'ts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Do's */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-700 mb-6 flex items-center gap-2">
                  <CheckCircle size={24} />
                  Do's
                </h3>
                <ul className="space-y-3">
                  {dosList.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2">
                  <AlertTriangle size={24} />
                  Don'ts
                </h3>
                <ul className="space-y-3">
                  {dontsList.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Section */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Report Suspicious Activity</h2>
            <p className="text-gray-600 mb-8">
              If you encounter any suspicious behavior, harassment, or fraudulent activity, please report it immediately. Your safety is our top priority.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:safety@siruvapurimurugan.com"
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Report via Email
              </a>
              <a
                href="tel:+919999999999"
                className="px-8 py-3 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Call Safety Helpline
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Emergency Contacts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <EmergencyContact
                title="Women Helpline"
                number="181"
                description="24/7 National Women Helpline"
              />
              <EmergencyContact
                title="Cyber Crime"
                number="1930"
                description="National Cyber Crime Helpline"
              />
              <EmergencyContact
                title="Police"
                number="100"
                description="Emergency Police Number"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SafetyFeature = ({ icon, title, description }) => (
  <div className="text-center p-4">
    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
      {icon}
    </div>
    <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const EmergencyContact = ({ title, number, description }) => (
  <div className="bg-white rounded-xl shadow-md p-6 text-center">
    <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-primary mb-2">{number}</p>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default SafetyTips;
