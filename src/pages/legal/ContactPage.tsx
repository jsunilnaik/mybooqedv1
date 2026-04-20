import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare, HelpCircle, Briefcase } from 'lucide-react';
import { PageTransition } from '../../components/layout/PageTransition';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'hello@MyBOOQED.in',
    sub: 'We reply within 24 hours',
    href: 'mailto:hello@MyBOOQED.in',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Phone,
    title: 'Call Us',
    detail: '+91 98765 43210',
    sub: 'Mon–Sat, 9 AM – 6 PM',
    href: 'tel:+919876543210',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    detail: 'Corporate Office, Bengaluru',
    sub: 'India – 583101',
    href: '#',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Clock,
    title: 'Business Hours',
    detail: 'Mon – Sat',
    sub: '9:00 AM – 6:00 PM IST',
    href: '#',
    color: 'bg-purple-50 text-purple-600',
  },
];

const topics = [
  { icon: MessageSquare, label: 'General Inquiry' },
  { icon: HelpCircle, label: 'Booking Support' },
  { icon: Briefcase, label: 'List My Salon' },
  { icon: Mail, label: 'Partnership' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
        <div className="bg-[#F7F9FA] border-b border-[#F3F4F6] py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-black text-black mb-4" style={{ letterSpacing: '-0.03em' }}>
              Get in touch
            </h1>
            <p className="text-[#71717A] text-lg">
              Have a question, feedback, or want to list your salon? We would love to hear from you.
            </p>
          </div>
        </div>

        {/* Contact methods */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
            {contactMethods.map(({ icon: Icon, title, detail, sub, href, color }) => (
              <a
                key={title}
                href={href}
                className="bg-white border border-[#F3F4F6] rounded-2xl p-5 hover:shadow-md hover:border-[#E5E7EB] transition-all group"
              >
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={18} />
                </div>
                <div className="text-xs font-black text-black uppercase tracking-widest mb-1">{title}</div>
                <div className="text-sm font-semibold text-black">{detail}</div>
                <div className="text-xs text-[#71717A] mt-0.5">{sub}</div>
              </a>
            ))}
          </div>

          {/* Form + Info */}
          <div className="grid md:grid-cols-5 gap-10">

            {/* Form */}
            <div className="md:col-span-3">
              <h2 className="text-2xl font-black text-black mb-6" style={{ letterSpacing: '-0.02em' }}>
                Send us a message
              </h2>

              {submitted ? (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-black text-black mb-2">Message sent!</h3>
                  <p className="text-[#71717A] text-sm">
                    Thanks for reaching out. We will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', topic: '', message: '' }); }}
                    className="mt-6 text-sm font-bold text-black underline underline-offset-4"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-black uppercase tracking-widest block mb-1.5">Full Name *</label>
                      <input
                        required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Ramesh Kumar"
                        className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-black uppercase tracking-widest block mb-1.5">Email *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@example.com"
                        className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-black uppercase tracking-widest block mb-1.5">Phone (optional)</label>
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-black uppercase tracking-widest block mb-1.5">Topic *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {topics.map(({ icon: Icon, label }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, topic: label }))}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            form.topic === label
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-[#E5E7EB] hover:border-black'
                          }`}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-black uppercase tracking-widest block mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us how we can help..."
                      className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white font-bold py-3.5 rounded-full hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <><Send size={16} /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-black text-black mb-6" style={{ letterSpacing: '-0.02em' }}>
                Quick answers
              </h2>
              <div className="space-y-4">
                {[
                  { q: 'How do I cancel a booking?', a: 'Go to My Bookings, find your booking, and tap Cancel. Cancellations are free if made 2 hours before the appointment.' },
                  { q: 'Is there a booking fee?', a: 'No! Booking through MyBOOQED is completely free. You pay the salon directly at the time of your visit.' },
                  { q: 'How do I list my salon?', a: 'Click "List Your Salon" in the header or footer. Fill in the 5-step registration wizard and your salon goes live instantly.' },
                  { q: 'Can I reschedule a booking?', a: 'Currently, cancel your existing booking and create a new one at your preferred time. Rescheduling is coming in a future update.' },
                ].map(({ q, a }) => (
                  <details key={q} className="group border border-[#F3F4F6] rounded-2xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none">
                      <span className="text-sm font-bold text-black">{q}</span>
                      <span className="w-5 h-5 rounded-full bg-[#F7F9FA] flex items-center justify-center text-black text-xs flex-shrink-0 group-open:bg-black group-open:text-white transition-colors">+</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-[#71717A] leading-relaxed border-t border-[#F3F4F6] pt-3">
                      {a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
