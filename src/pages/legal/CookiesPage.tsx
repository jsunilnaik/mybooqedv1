
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../../components/layout/PageTransition';

const cookieTypes = [
  {
    name: 'Essential Cookies',
    required: true,
    color: 'bg-green-50 border-green-200',
    badgeColor: 'bg-green-100 text-green-700',
    description: 'These cookies are strictly necessary for the platform to function and cannot be switched off.',
    examples: [
      { name: 'session_id', purpose: 'Maintains your login session', duration: 'Session' },
      { name: 'auth_token', purpose: 'Authenticates your account', duration: '30 days' },
      { name: 'csrf_token', purpose: 'Prevents cross-site request forgery attacks', duration: 'Session' },
    ],
  },
  {
    name: 'Functional Cookies',
    required: false,
    color: 'bg-blue-50 border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700',
    description: 'These cookies enable enhanced functionality and personalization features.',
    examples: [
      { name: 'user_prefs', purpose: 'Remembers your area, sort preferences, and filters', duration: '1 year' },
      { name: 'recent_searches', purpose: 'Stores your recent search history for quick access', duration: '30 days' },
      { name: 'saved_salons', purpose: 'Remembers your favourite/saved salons', duration: '1 year' },
    ],
  },
  {
    name: 'Analytics Cookies',
    required: false,
    color: 'bg-amber-50 border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-700',
    description: 'These cookies help us understand how visitors interact with MyBOOQED so we can improve the experience.',
    examples: [
      { name: '_bms_analytics', purpose: 'Tracks page views and session duration', duration: '2 years' },
      { name: '_bms_events', purpose: 'Records button clicks and feature usage', duration: '1 year' },
      { name: '_bms_ab', purpose: 'Used for A/B testing of new features', duration: '30 days' },
    ],
  },
  {
    name: 'Marketing Cookies',
    required: false,
    color: 'bg-purple-50 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
    description: 'These cookies are used to deliver relevant promotions and measure the effectiveness of our marketing campaigns.',
    examples: [
      { name: '_fbp', purpose: 'Facebook pixel for campaign measurement', duration: '90 days' },
      { name: '_ga', purpose: 'Google Analytics audience measurement', duration: '2 years' },
      { name: '_utm', purpose: 'Tracks marketing campaign source', duration: '30 days' },
    ],
  },
];

export default function CookiesPage() {
  return (
    <PageTransition>
      <div className="bg-white min-h-screen">

        {/* Header */}
        <div className="bg-[#F7F9FA] border-b border-[#F3F4F6] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Cookie size={18} className="text-white" />
              </div>
              <div className="text-xs font-black text-black uppercase tracking-widest">Legal</div>
            </div>
            <h1 className="text-4xl font-black text-black mb-3" style={{ letterSpacing: '-0.03em' }}>
              Cookie Policy
            </h1>
            <p className="text-[#71717A]">Last updated: March 8, 2026</p>
            <p className="text-sm text-[#71717A] mt-3 max-w-xl leading-relaxed">
              This policy explains what cookies are, how MyBOOQED uses them, and how you can control them.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">

          {/* What are cookies */}
          <div className="bg-[#F7F9FA] rounded-2xl p-6">
            <h2 className="text-xl font-black text-black mb-3" style={{ letterSpacing: '-0.02em' }}>What are cookies?</h2>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, remember your preferences, and provide information to website owners about how their site is being used. Cookies are not harmful — they cannot access other data on your device or carry viruses.
            </p>
          </div>

          {/* Cookie types */}
          {cookieTypes.map(({ name, required, color, badgeColor, description, examples }) => (
            <div key={name} className={`border rounded-2xl overflow-hidden ${color}`}>
              <div className="p-5 border-b border-inherit">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-black">{name}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeColor}`}>
                    {required ? 'Always Active' : 'Optional'}
                  </span>
                </div>
                <p className="text-sm text-[#4B5563]">{description}</p>
              </div>
              <div className="bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F3F4F6]">
                      <th className="text-left px-5 py-3 text-xs font-black text-black uppercase tracking-widest">Cookie Name</th>
                      <th className="text-left px-5 py-3 text-xs font-black text-black uppercase tracking-widest">Purpose</th>
                      <th className="text-left px-5 py-3 text-xs font-black text-black uppercase tracking-widest">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examples.map(({ name: cookieName, purpose, duration }) => (
                      <tr key={cookieName} className="border-b border-[#F3F4F6] last:border-0">
                        <td className="px-5 py-3 font-mono text-xs text-black">{cookieName}</td>
                        <td className="px-5 py-3 text-[#4B5563]">{purpose}</td>
                        <td className="px-5 py-3 text-[#71717A]">{duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Managing cookies */}
          <div className="border border-[#F3F4F6] rounded-2xl p-6">
            <h2 className="text-xl font-black text-black mb-4" style={{ letterSpacing: '-0.02em' }}>How to manage cookies</h2>
            <div className="space-y-4">
              {[
                { browser: 'Google Chrome', instruction: 'Settings → Privacy and Security → Cookies and other site data' },
                { browser: 'Mozilla Firefox', instruction: 'Settings → Privacy & Security → Cookies and Site Data' },
                { browser: 'Safari (iOS/macOS)', instruction: 'Settings → Safari → Privacy & Security → Block Cookies' },
                { browser: 'Microsoft Edge', instruction: 'Settings → Privacy, search, and services → Cookies' },
              ].map(({ browser, instruction }) => (
                <div key={browser} className="flex gap-3">
                  <div className="w-28 flex-shrink-0 text-xs font-bold text-black">{browser}</div>
                  <div className="text-sm text-[#71717A] border-l border-[#E5E7EB] pl-3">{instruction}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#9CA3AF] mt-5">
              Note: Disabling essential cookies may prevent parts of MyBOOQED from working correctly.
            </p>
          </div>

          <div className="p-6 bg-[#F7F9FA] rounded-2xl text-center">
            <p className="text-sm text-[#71717A]">
              Questions about cookies?{' '}
              <Link to="/contact" className="text-black font-bold underline underline-offset-4">Contact us</Link>
              {' '}or read our{' '}
              <Link to="/privacy" className="text-black font-bold underline underline-offset-4">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
