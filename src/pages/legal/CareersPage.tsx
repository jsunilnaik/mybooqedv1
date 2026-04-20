import { useState } from 'react';
import { Briefcase, MapPin, Clock, ArrowRight, Zap, Heart, TrendingUp, Star } from 'lucide-react';
import { PageTransition } from '../../components/layout/PageTransition';

const perks = [
  { icon: Zap, title: 'Fast-Moving Team', desc: 'Ship features in days, not months. Your work impacts thousands of users immediately.' },
  { icon: Star, title: 'Quality First', desc: 'We take pride in our craft. We build robust, scalable systems that salons and clients can rely on.' },
  { icon: MapPin, title: 'Remote-First Hybrid', desc: 'Work from our offices in Bengaluru or with flexible hybrid options. Be close to the community you serve.' },
  { icon: Heart, title: 'Mission-Driven', desc: 'We are genuinely helping local salon owners grow their business and making lives easier for customers.' },
  { icon: TrendingUp, title: 'Equity & Growth', desc: 'Early team members get equity. Grow with the company as we expand across India.' },
  { icon: Clock, title: 'Flexible Hours', desc: 'We care about results, not hours. Work when you are most productive — we trust our team.' },
];

const openRoles = [
  {
    title: 'Full Stack Developer',
    department: 'Engineering',
    type: 'Full-time',
    location: 'Multiple Cities / Remote',
    description: 'Build and scale the MyBOOQED platform. You will work across the React frontend and Node.js backend, helping us move from Phase 1 (mock data) to Phase 2 (Supabase + real payments).',
    requirements: ['2+ years React/TypeScript experience', 'Node.js + Express.js knowledge', 'Familiarity with PostgreSQL or Supabase', 'Strong problem-solving skills'],
    color: 'bg-blue-50 border-blue-100',
  },
  {
    title: 'Business Development Manager',
    department: 'Growth',
    type: 'Full-time',
    location: 'On-site',
    description: 'Onboard new salons to the platform and help existing partners grow. You will be the face of MyBOOQED to salon owners in your region.',
    requirements: ['Experience in sales or business development', 'Local language and English fluency', 'Excellent communication skills', 'Existing network in your city a plus'],
    color: 'bg-green-50 border-green-100',
  },
  {
    title: 'UI/UX Designer',
    department: 'Design',
    type: 'Contract / Full-time',
    location: 'Remote / Hybrid',
    description: 'Design beautiful, intuitive interfaces for our customer and owner-facing products. Help us maintain our Fresha-inspired clean aesthetic as we add new features.',
    requirements: ['Strong portfolio with mobile and web projects', 'Figma proficiency', 'Understanding of user research methods', 'Experience with design systems'],
    color: 'bg-purple-50 border-purple-100',
  },
  {
    title: 'Customer Support Specialist',
    department: 'Operations',
    type: 'Full-time',
    location: 'On-site',
    description: 'Be the first point of contact for customers and salon owners. Resolve issues, gather feedback, and help us continuously improve the product.',
    requirements: ['Excellent written and verbal communication', 'Kannada, Hindi, and English fluency', 'Empathetic and patient approach', 'Basic tech literacy'],
    color: 'bg-amber-50 border-amber-100',
  },
  {
    title: 'Digital Marketing Executive',
    department: 'Marketing',
    type: 'Full-time',
    location: 'Hybrid / Remote',
    description: 'Run and grow our social media presence, create content, manage local SEO, and run performance marketing campaigns to drive user growth.',
    requirements: ['Experience with Instagram, Facebook advertising', 'Basic SEO knowledge', 'Content creation skills (Canva/video)', 'Analytics and data-driven mindset'],
    color: 'bg-pink-50 border-pink-100',
  },
];

export default function CareersPage() {
  const [_selectedRole, setSelectedRole] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApply = (roleTitle: string) => {
    setSelectedRole(roleTitle);
    setForm(f => ({ ...f, role: roleTitle }));
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <PageTransition>
      <div className="bg-white min-h-screen">

        {/* Hero */}
        <div className="bg-black py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Briefcase size={14} className="text-white" />
              <span className="text-sm text-white/80">{openRoles.length} open positions now live</span>
            </div>
            <h1 className="text-5xl font-black text-white mb-5" style={{ letterSpacing: '-0.03em' }}>
              Build the future of<br />salon booking in India
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Join a small, passionate team on a mission to make professional grooming accessible to everyone.
            </p>
          </div>
        </div>

        {/* Perks */}
        <div className="bg-[#F7F9FA] py-16 px-4 border-b border-[#F3F4F6]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-black" style={{ letterSpacing: '-0.02em' }}>Why join MyBOOQED?</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {perks.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mb-4">
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-black mb-2">{title}</h3>
                  <p className="text-sm text-[#71717A] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Open Roles */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="mb-10">
            <div className="text-xs font-black text-black uppercase tracking-widest mb-2">Open Positions</div>
            <h2 className="text-3xl font-black text-black" style={{ letterSpacing: '-0.02em' }}>
              {openRoles.length} roles available
            </h2>
          </div>

          <div className="space-y-4">
            {openRoles.map(({ title, department, type, location, description, requirements, color }) => (
              <div key={title} className={`border rounded-2xl overflow-hidden ${color}`}>
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-black text-black">{title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs font-bold bg-black text-white px-3 py-1 rounded-full">{department}</span>
                        <span className="text-xs font-medium text-[#71717A] border border-[#E5E7EB] bg-white px-3 py-1 rounded-full flex items-center gap-1">
                          <Clock size={10} /> {type}
                        </span>
                        <span className="text-xs font-medium text-[#71717A] border border-[#E5E7EB] bg-white px-3 py-1 rounded-full flex items-center gap-1">
                          <MapPin size={10} /> {location}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApply(title)}
                      className="flex items-center gap-2 bg-black text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-gray-900 transition-colors flex-shrink-0"
                    >
                      Apply Now <ArrowRight size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-[#4B5563] leading-relaxed mb-4">{description}</p>
                  <div>
                    <div className="text-xs font-black text-black uppercase tracking-widest mb-2">Requirements</div>
                    <ul className="space-y-1">
                      {requirements.map(req => (
                        <li key={req} className="text-sm text-[#4B5563] flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-[#F7F9FA] border-t border-[#F3F4F6] py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-black mb-2" style={{ letterSpacing: '-0.02em' }}>Apply Now</h2>
              <p className="text-[#71717A]">Do not see the right role? Send us a general application — we are always looking for great people.</p>
            </div>

            {submitted ? (
              <div className="bg-white border border-green-100 rounded-3xl p-10 text-center shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                <h3 className="text-xl font-black text-black mb-2">Application received!</h3>
                <p className="text-[#71717A] text-sm">We will review your application and get back to you within 5 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-black uppercase tracking-widest block mb-1.5">Full Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-black uppercase tracking-widest block mb-1.5">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-black uppercase tracking-widest block mb-1.5">Phone *</label>
                  <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" />
                </div>
                <div>
                  <label className="text-xs font-black text-black uppercase tracking-widest block mb-1.5">Role Applying For *</label>
                  <select required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black bg-white">
                    <option value="">Select a role...</option>
                    {openRoles.map(r => <option key={r.title} value={r.title}>{r.title}</option>)}
                    <option value="General Application">General Application</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-black uppercase tracking-widest block mb-1.5">Why MyBOOQED? *</label>
                  <textarea required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us why you want to join and what you would bring to the team..." className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black resize-none" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3.5 rounded-full hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : <>Submit Application <ArrowRight size={16} /></>}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="bg-white py-8 px-4 text-center border-t border-[#F3F4F6]">
          <p className="text-sm text-[#71717A]">Questions about careers? Email us at <a href="mailto:careers@MyBOOQED.in" className="text-black font-bold underline underline-offset-4">careers@MyBOOQED.in</a></p>
        </div>

      </div>
    </PageTransition>
  );
}
