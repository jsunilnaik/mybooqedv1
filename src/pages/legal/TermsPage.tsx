import { useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../../components/layout/PageTransition';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: [
      'By accessing or using the MyBOOQED platform (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.',
      'These Terms apply to all visitors, users, and others who access or use MyBOOQED, including both customers booking salon appointments and salon owners listing their businesses.',
      'We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the revised Terms.',
    ],
  },
  {
    id: 'accounts',
    title: '2. User Accounts',
    content: [
      'You must be at least 13 years of age to create an account on MyBOOQED.',
      'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
      'You agree to provide accurate, current, and complete information during registration and to update such information as necessary.',
      'MyBOOQED reserves the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.',
      'One person may not maintain more than one personal account. Salon owners may have one separate business account.',
    ],
  },
  {
    id: 'bookings',
    title: '3. Booking Policy',
    content: [
      'MyBOOQED is a platform that facilitates bookings between customers and independent salon businesses. We are not a party to the service agreement between you and the salon.',
      'Bookings are confirmed upon receiving confirmation from the salon. In rare cases, a salon may decline a booking after confirmation — in such cases, we will notify you immediately.',
      'Pricing displayed on MyBOOQED reflects the salon\'s stated prices at the time of listing. Salons are responsible for keeping prices accurate.',
      'Payment for services is made directly to the salon at the time of your visit. MyBOOQED does not currently process payments.',
      'In Phase 2, online payment via Razorpay will be supported. Additional payment terms will apply at that time.',
    ],
  },
  {
    id: 'cancellation',
    title: '4. Cancellation Policy',
    content: [
      'Customers may cancel a confirmed booking at any time through the My Bookings section of the app.',
      'We recommend cancelling at least 2 hours before your scheduled appointment time as a courtesy to the salon.',
      'Individual salons may have their own cancellation policies. Please check the salon\'s policy before booking.',
      'MyBOOQED is not liable for any cancellation fees charged directly by salons (applicable in Phase 2 when online payments are introduced).',
      'Repeated no-shows or last-minute cancellations may result in account restrictions.',
    ],
  },
  {
    id: 'conduct',
    title: '5. User Conduct',
    content: [
      'You agree not to use MyBOOQED for any unlawful purpose or in violation of these Terms.',
      'You agree not to post false, misleading, or defamatory reviews about salons or their staff.',
      'You agree not to attempt to circumvent the platform by contacting salons directly through our platform to avoid future bookings through MyBOOQED.',
      'You agree not to scrape, crawl, or otherwise extract data from our platform without written permission.',
      'You agree not to upload malicious code, engage in denial-of-service attacks, or attempt to gain unauthorized access to our systems.',
      'Violations of this section may result in immediate account termination and potential legal action.',
    ],
  },
  {
    id: 'salon-owners',
    title: '6. Terms for Salon Owners',
    content: [
      'Salon owners ("Partners") who list their business on MyBOOQED agree to these additional terms.',
      'Partners must provide accurate business information including services, pricing, hours, and location.',
      'Partners are responsible for keeping their availability and slot information up to date on the platform.',
      'Partners agree to honor all bookings made through MyBOOQED at the stated price.',
      'Partners may not discriminate against customers based on caste, religion, gender, age, or any other protected characteristic.',
      'MyBOOQED reserves the right to remove any salon listing that receives consistent negative reviews, violates our policies, or engages in fraudulent behavior.',
      'Partners grant MyBOOQED a license to display their salon name, photos, services, and pricing on our platform for the purpose of facilitating bookings.',
    ],
  },
  {
    id: 'reviews',
    title: '7. Reviews & Ratings',
    content: [
      'Customers may submit reviews and ratings for salons they have visited through MyBOOQED.',
      'Reviews must be honest, first-hand accounts of your experience. Fabricated, paid, or incentivized reviews are prohibited.',
      'MyBOOQED reserves the right to remove reviews that are abusive, discriminatory, spam, or otherwise violate our community guidelines.',
      'Salon owners may respond to reviews publicly through their dashboard. Responses must be professional and respectful.',
      'Attempting to manipulate your salon\'s rating through fake positive reviews or fake negative reviews of competitors will result in immediate removal from the platform.',
    ],
  },
  {
    id: 'liability',
    title: '8. Limitation of Liability',
    content: [
      'MyBOOQED is a technology platform and is not responsible for the quality of services provided by salons.',
      'We do not guarantee the accuracy of salon information including pricing, hours, or availability.',
      'To the maximum extent permitted by applicable law, MyBOOQED shall not be liable for any indirect, incidental, special, consequential, or punitive damages.',
      'Our total liability for any claim arising from use of the Service shall not exceed the amount paid by you (if any) for the booking in question.',
      'Some jurisdictions do not allow limitations on liability, so these limitations may not apply to you.',
    ],
  },
  {
    id: 'ip',
    title: '9. Intellectual Property',
    content: [
      'The MyBOOQED name, logo, platform design, and all original content are the exclusive property of MyBOOQED and are protected by applicable intellectual property laws.',
      'You may not use our name, logo, or branding without our prior written consent.',
      'By submitting content (reviews, photos, etc.) to MyBOOQED, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content on our platform.',
      'You retain ownership of content you submit. You represent that you have the right to submit such content and that it does not infringe any third-party rights.',
    ],
  },
  {
    id: 'governing',
    title: '10. Governing Law & Disputes',
    content: [
      'These Terms shall be governed by and construed in accordance with the laws of India.',
      'Any disputes arising from these Terms or your use of MyBOOQED shall be subject to the exclusive jurisdiction of the competent courts in India.',
      'We encourage you to contact us first at legal@MyBOOQED.in to resolve any disputes amicably before pursuing legal action.',
      'For consumer disputes, you may also contact the appropriate consumer forum under the Consumer Protection Act, 2019.',
    ],
  },
];

export default function TermsPage() {
  const [openSection, setOpenSection] = useState<string | null>('acceptance');

  return (
    <PageTransition>
      <div className="bg-white min-h-screen">

        {/* Header */}
        <div className="bg-[#F7F9FA] border-b border-[#F3F4F6] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <FileText size={18} className="text-white" />
              </div>
              <div className="text-xs font-black text-black uppercase tracking-widest">Legal</div>
            </div>
            <h1 className="text-4xl font-black text-black mb-3" style={{ letterSpacing: '-0.03em' }}>
              Terms of Service
            </h1>
            <p className="text-[#71717A]">Last updated: March 8, 2026 · Effective: January 1, 2025</p>
            <p className="text-sm text-[#71717A] mt-3 max-w-xl leading-relaxed">
              Please read these Terms carefully before using MyBOOQED. By using our platform, you agree to these Terms.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 py-12">

          {/* Navigation */}
          <div className="bg-[#F7F9FA] rounded-2xl p-5 mb-10">
            <h2 className="text-xs font-black text-black uppercase tracking-widest mb-3">Table of Contents</h2>
            <div className="grid sm:grid-cols-2 gap-1">
              {sections.map(({ id, title }) => (
                <button
                  key={id}
                  onClick={() => setOpenSection(id)}
                  className="text-left text-sm text-[#374151] hover:text-black py-1 transition-colors"
                >
                  {title}
                </button>
              ))}
            </div>
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
                  <div className="px-5 pb-5 border-t border-[#F3F4F6] pt-4 space-y-3">
                    {content.map((para, i) => (
                      <p key={i} className="text-sm text-[#4B5563] leading-relaxed flex gap-2">
                        <span className="w-5 h-5 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0 mt-0.5">{i + 1}</span>
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-[#F7F9FA] rounded-2xl">
            <p className="text-sm text-[#71717A] text-center">
              Questions about these Terms?{' '}
              <Link to="/contact" className="text-black font-bold underline underline-offset-4">Contact us</Link>
              {' '}or email{' '}
              <a href="mailto:legal@MyBOOQED.in" className="text-black font-bold underline underline-offset-4">
                legal@MyBOOQED.in
              </a>
            </p>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
