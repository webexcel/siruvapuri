import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              Last updated: January 1, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">
                At Siruvapuri Murugan Matrimonial, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>

              <Section title="1. Information We Collect">
                <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Personal Information</h3>
                <p>When you register and use our services, we may collect:</p>
                <ul>
                  <li>Name, age, gender, date of birth</li>
                  <li>Contact information (phone number, address)</li>
                  <li>Educational and professional details</li>
                  <li>Religious and community information</li>
                  <li>Physical attributes (height, weight, complexion)</li>
                  <li>Family details and background</li>
                  <li>Partner preferences</li>
                  <li>Photos and profile pictures</li>
                  <li>Horoscope details (if provided)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Technical Information</h3>
                <p>We automatically collect:</p>
                <ul>
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Usage data and browsing patterns</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </Section>

              <Section title="2. How We Use Your Information">
                <p>We use your information for:</p>
                <ul>
                  <li>Creating and managing your account</li>
                  <li>Providing matchmaking services</li>
                  <li>Communicating with you about our services</li>
                  <li>Processing payments and memberships</li>
                  <li>Verifying your identity and profile authenticity</li>
                  <li>Improving our platform and services</li>
                  <li>Sending promotional communications (with your consent)</li>
                  <li>Preventing fraud and ensuring security</li>
                  <li>Complying with legal obligations</li>
                </ul>
              </Section>

              <Section title="3. Information Sharing">
                <p>We may share your information with:</p>
                <ul>
                  <li><strong>Other Users:</strong> Your profile information is visible to other registered users based on your privacy settings</li>
                  <li><strong>Service Providers:</strong> Third parties who help us operate our platform (payment processors, hosting providers, etc.)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sale of assets</li>
                </ul>
                <p>
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </Section>

              <Section title="4. Data Security">
                <p>
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure servers and firewalls</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p>
                  However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your information.
                </p>
              </Section>

              <Section title="5. Your Rights">
                <p>You have the right to:</p>
                <ul>
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Restriction:</strong> Limit how we use your information</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Objection:</strong> Object to certain processing activities</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
                </ul>
                <p>
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </Section>

              <Section title="6. Cookies and Tracking">
                <p>
                  We use cookies and similar technologies to:
                </p>
                <ul>
                  <li>Remember your preferences and settings</li>
                  <li>Authenticate your sessions</li>
                  <li>Analyze usage patterns</li>
                  <li>Improve user experience</li>
                  <li>Deliver relevant content</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. Please see our Cookie Policy for more details.
                </p>
              </Section>

              <Section title="7. Data Retention">
                <p>
                  We retain your information for as long as:
                </p>
                <ul>
                  <li>Your account is active</li>
                  <li>Necessary to provide our services</li>
                  <li>Required by legal obligations</li>
                  <li>Needed to resolve disputes</li>
                </ul>
                <p>
                  After account deletion, we may retain certain information for legal compliance and fraud prevention purposes.
                </p>
              </Section>

              <Section title="8. Children's Privacy">
                <p>
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.
                </p>
              </Section>

              <Section title="9. Third-Party Links">
                <p>
                  Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies before providing any information.
                </p>
              </Section>

              <Section title="10. International Data Transfers">
                <p>
                  Your information may be transferred to and processed in countries other than India. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
                </p>
              </Section>

              <Section title="11. Changes to This Policy">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our platform and updating the "Last updated" date. Your continued use of our services after such changes constitutes your acceptance of the updated policy.
                </p>
              </Section>

              <Section title="12. Contact Us">
                <p>
                  If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul>
                  <li>Email: privacy@siruvapurimurugan.com</li>
                  <li>Phone: +91 99999 99999</li>
                  <li>Address: 123, Temple Street, Chennai, Tamil Nadu - 600001</li>
                </ul>
                <p>
                  <strong>Data Protection Officer:</strong> dpo@siruvapurimurugan.com
                </p>
              </Section>

              <Section title="13. Grievance Redressal">
                <p>
                  In accordance with the Information Technology Act, 2000 and rules made thereunder, the name and contact details of the Grievance Officer are:
                </p>
                <ul>
                  <li>Name: Grievance Officer</li>
                  <li>Email: grievance@siruvapurimurugan.com</li>
                  <li>Phone: +91 99999 99999</li>
                </ul>
              </Section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    <div className="text-gray-600 space-y-4">{children}</div>
  </div>
);

export default PrivacyPolicy;
