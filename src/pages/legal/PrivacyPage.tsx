import { useState } from 'react';
import { Shield, ChevronDown } from 'lucide-react';
import { PageTransition } from '../../components/layout/PageTransition';

const sections = [
  {
    id: 'collection',
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us when you create an account, make a booking, or contact us. This includes:

**Personal Information:**
- Full name, email address, and phone number
- Profile photo (optional)
- City and area (Your Location)
- Booking history and service preferences

**Automatically Collected Information:**
- Device information (type, operating system, browser)
- Log data (IP address, pages visited, time spent)
- Cookies and similar tracking technologies
- Location data (only with your explicit permission)

**Information from Third Parties:**
- If you sign in via social accounts (future feature), we may receive basic profile information
- Salon partners may share booking confirmation details with us`,
  },
  {
    id: 'use',
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:

**Provide Our Services:**
- Process and confirm salon bookings
- Send booking confirmations and reminders
- Connect you with local salon partners

**Improve Our Platform:**
- Analyze usage patterns to enhance features
- Personalize your experience and recommendations
- Conduct research and analytics

**Communication:**
- Send transactional emails (booking confirmations, receipts)
- Send promotional communications (with your consent)
- Respond to your questions and support requests

**Legal Compliance:**
- Comply with applicable laws and regulations
- Enforce our Terms of Service
- Protect the rights and safety of our users`,
  },
  {
    id: 'sharing',
    title: '3. Information Sharing',
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in these circumstances:

**With Salon Partners:**
When you make a booking, we share your name and phone number with the relevant salon so they can prepare for your appointment.

**Service Providers:**
We work with trusted third-party companies that help us operate our platform (e.g., payment processors, email services). They are contractually bound to keep your information confidential.

**Legal Requirements:**
We may disclose information if required by law, court order, or governmental authority in India.

**Business Transfers:**
If MyBOOQED is acquired or merges with another company, your information may be transferred as part of that transaction.

**With Your Consent:**
We may share information for any other purpose with your explicit consent.`,
  },
  {
    id: 'security',
    title: '4. Data Security',
    content: `We take the security of your personal information seriously and implement appropriate technical and organizational measures:

- All data transmitted between your browser and our servers is encrypted using SSL/TLS
- Passwords are hashed using industry-standard algorithms (bcrypt)
- We regularly audit our security practices and systems
- Access to personal data is restricted to authorized personnel only
- We maintain regular backups to prevent data loss

**Data Retention:**
We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time.

**Phase 1 Notice:**
MyBOOQED is currently in Phase 1 (beta). Some data is stored in browser localStorage for demonstration purposes. Full server-side encryption will be implemented in Phase 2.`,
  },
  {
    id: 'rights',
    title: '5. Your Rights',
    content: `Under applicable Indian data protection laws and global best practices, you have the right to:

**Access:** Request a copy of the personal information we hold about you.

**Correction:** Update or correct inaccurate personal information.

**Deletion:** Request that we delete your personal information (subject to legal requirements).

**Portability:** Request your data in a machine-readable format.

**Objection:** Object to certain types of data processing, including direct marketing.

**Withdraw Consent:** Where processing is based on consent, you may withdraw it at any time.

To exercise any of these rights, contact us at privacy@MyBOOQED.in. We will respond within 30 days.`,
  },
  {
    id: 'cookies',
    title: '6. Cookies & Tracking',
    content: `We use cookies and similar technologies to enhance your experience on our platform.

**Essential Cookies:** Required for the platform to function. These cannot be disabled.

**Analytics Cookies:** Help us understand how visitors use MyBOOQED (e.g., which pages are most visited). We use anonymized data only.

**Preference Cookies:** Remember your settings and preferences (e.g., selected area, sort order).

**Marketing Cookies:** Used to show relevant promotions. These are only set with your consent.

You can control cookies through your browser settings. Note that disabling cookies may affect some platform functionality. See our full Cookie Policy for more details.`,
  },
  {
    id: 'children',
    title: '7. Children\'s Privacy',
    content: `MyBOOQED is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13.

If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at privacy@MyBOOQED.in and we will delete such information promptly.

Users between 13-18 years old should use the platform only with parental consent.`,
  },
  {
    id: 'changes',
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.

When we make significant changes:
- We will notify you by email (if you have an account)
- We will display a prominent notice on our platform
- The "Last Updated" date at the top of this page will be revised

Your continued use of MyBOOQED after any changes constitutes your acceptance of the revised Privacy Policy. If you disagree with any changes, please discontinue use and contact us to delete your account.`,
  },
  {
    id: 'contact',
    title: '9. Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out to us:

**Data Controller:**
Book                Corporate Office
India – 583101, India

**Email:** privacy@MyBOOQED.in
**Phone:** +91 98765 43210
**Business Hours:** Monday – Saturday, 9:00 AM – 6:00 PM IST

We are committed to resolving privacy-related complaints promptly and fairly.`,
  },
];

export default function PrivacyPage() {
  const [openSection, setOpenSection] = useState<string | null>('collection');

  return (
    <PageTransition>
      <div className="bg-white min-h-screen">

        {/* Header */}
        <div className="bg-[#F7F9FA] border-b border-[#F3F4F6] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <div className="text-xs font-black text-black uppercase tracking-widest">Legal</div>
            </div>
            <h1 className="text-4xl font-black text-black mb-3" style={{ letterSpacing: '-0.03em' }}>
              Privacy Policy
            </h1>
            <p className="text-[#71717A]">Last updated: March 8, 2026 · Effective: January 1, 2025</p>
            <p className="text-sm text-[#71717A] mt-3 leading-relaxed max-w-xl">
              At MyBOOQED, we take your privacy seriously. This policy explains what data we collect, how we use it, and your rights as a user of our platform.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 py-12">

          {/* Quick summary */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
            <h2 className="font-black text-black mb-3">Privacy at a Glance</h2>
            <ul className="space-y-2">
              {[
                'We collect only what is needed to run our salon booking service',
                'We never sell your personal information to advertisers',
                'You can request deletion of your account and data anytime',
                'We share your name and phone with salons only when you book',
                'All data is stored securely with encryption',
              ].map(point => (
                <li key={point} className="flex items-start gap-2 text-sm text-[#374151]">
                  <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Accordion sections */}
          <div className="space-y-3">
            {sections.map(({ id, title, content }) => (
              <div key={id} className="border border-[#F3F4F6] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenSection(openSection === id ? null : id)}
                  className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-[#F7F9FA] transition-colors"
                >
                  <span className="font-bold text-black">{title}</span>
                  <ChevronDown
                    size={16}
                    className={`text-[#71717A] flex-shrink-0 transition-transform duration-200 ${openSection === id ? 'rotate-180' : ''}`}
                  />
                </button>
                {openSection === id && (
                  <div className="px-5 pb-5 border-t border-[#F3F4F6] pt-4">
                    <div className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">
                      {content.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-bold text-black mt-4 mb-1 first:mt-0">{line.replace(/\*\*/g, '')}</p>;
                        }
                        if (line.startsWith('- ')) {
                          return <li key={i} className="ml-4 list-disc text-[#4B5563]">{line.slice(2)}</li>;
                        }
                        if (line.trim() === '') return <br key={i} />;
                        return <p key={i}>{line}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-[#F7F9FA] rounded-2xl text-center">
            <p className="text-sm text-[#71717A]">
              Questions about this policy?{' '}
              <a href="mailto:privacy@MyBOOQED.in" className="text-black font-bold underline underline-offset-4">
                privacy@MyBOOQED.in
              </a>
            </p>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
