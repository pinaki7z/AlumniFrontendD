/* ----------------------------------------------------------------
   Benefits.jsx
---------------------------------------------------------------- */
import { useState, useRef, useEffect } from 'react';
import {
  Handshake,
  DollarSign,
  GraduationCap,
  Building2,
  X,
  Calendar,
  ArrowRight,
  Star,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

/* ----------------------------------------------------------------
   Static data – easy to translate / re-order
---------------------------------------------------------------- */
const BENEFITS = [
  {
    icon: Handshake,
    title: 'Enhance Engagement',
    desc: 'Foster stronger alumni relationships with interactive features and meaningful connections.',
    gradient: 'from-blue-500 to-indigo-600',
    stat: '↑ 85 %',
  },
  {
    icon: DollarSign,
    title: 'Boost Contributions',
    desc: 'Tap into sponsorships and donations with streamlined processes and transparent tracking.',
    gradient: 'from-[#71be95] to-[#5fa080]',
    stat: '3× funding',
  },
  {
    icon: GraduationCap,
    title: 'Empower Students',
    desc: 'Connect them to alumni for guidance, mentoring, and career opportunities that matter.',
    gradient: 'from-purple-500 to-pink-600',
    stat: '90 % satisfaction',
  },
  {
    icon: Building2,
    title: 'Elevate Reputation',
    desc: 'Build a vibrant, connected alumni community that champions your brand.',
    gradient: 'from-[#0A3A4C] to-[#174873]',
    stat: 'Top ranked',
  },
];

/* ----------------------------------------------------------------
   Accessible modal (focus is trapped + escape closes)
---------------------------------------------------------------- */
function DemoModal({ open, onClose }) {
  const dialogRef = useRef(null);

  /* focus-trap */
  useEffect(() => {
    if (!open) return;
    const first = dialogRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    first?.focus();
    const handleKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="demo-modal-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <header className="flex items-center justify-between bg-gradient-to-r from-[#0A3A4C] to-[#174873] px-6 py-4 text-white">
          <h2 id="demo-modal-title" className="flex items-center gap-3 text-lg font-semibold">
            <Calendar className="h-5 w-5" />
            Schedule your free demo
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </header>

        {/* Zoho embed */}
        <iframe
          title="Alumnify contact form"
          className="w-full h-[500px]"
          src="https://forms.zohopublic.in/desiaddacraftworksllp/form/AlumnifyLPForm/formperma/JGDf1WBWXBejpFdyXrTA5BBkeTwIf_XGUvc1dYVkymM"
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Main section
---------------------------------------------------------------- */
export default function Benefits() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      {/* ----------  SECTION  ---------- */}
      <section id="whyChoose" className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ----------  Heading  ---------- */}
          <header className="mx-auto mb-16 max-w-4xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#71be95]/10 px-4 py-2 text-sm font-medium text-[#71be95]">
              <Star className="h-4 w-4" />
              Why choose Alumnify?
            </span>
            <h2 className="mb-6 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Transform Your Institution With{' '}
              <span className="block bg-gradient-to-r from-[#71be95] to-[#5fa080] bg-clip-text text-transparent">
                Powerful Alumni Engagement
              </span>
            </h2>
            <p className="mx-auto text-xl leading-relaxed text-gray-600">
              Build Your Legacy bridges the gap between Alumni and your Institution. Alumnify enables
              institutions to foster collaboration, mentorship, and student support.
            </p>

            <p className="mt-6 rounded-2xl border border-[#71be95]/20 bg-gradient-to-r from-[#0A3A4C]/5 to-[#174873]/5 p-6 text-lg text-gray-700">
              Your alumni are your greatest advocates. With{' '}
              <span className="font-semibold bg-gradient-to-r from-[#71be95] to-[#5fa080] bg-clip-text text-transparent">
                Alumnify
              </span>{' '}
              you can elevate your brand, boost contributions, and create lasting impact.
            </p>
          </header>

          {/* ----------  Benefit Cards  ---------- */}
          <ul className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ icon: Icon, title, desc, gradient, stat }) => (
              <li
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all hover:-translate-y-2 hover:border-[#71be95]/30 hover:shadow-2xl"
              >
                {/* subtle gradient overlay */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-gray-50 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="text-center">
                  <div
                    className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r ${gradient} text-white shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <Icon className="h-10 w-10" />
                  </div>

                  <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-[#71be95]/10 px-3 py-1 text-xs font-medium text-[#71be95]">
                    <TrendingUp className="h-3 w-3" />
                    {stat}
                  </span>

                  <h3 className="mb-4 text-xl font-semibold text-gray-900 transition-colors group-hover:text-[#71be95]">
                    {title}
                  </h3>
                  <p className="text-gray-600">{desc}</p>

                  <ArrowRight className="mx-auto mt-4 h-5 w-5 text-[#71be95] opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </li>
            ))}
          </ul>

          {/* ----------  CTA Banner  ---------- */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A3A4C] to-[#174873] p-8 text-center sm:p-12">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-4 top-4 h-32 w-32 rounded-full bg-white blur-2xl" />
              <div className="absolute bottom-4 left-4 h-24 w-24 rounded-full bg-[#71be95] blur-xl" />
            </div>
            <div className="relative mx-auto max-w-3xl text-white">
              <h3 className="mb-4 text-2xl font-bold sm:text-3xl">Ready to Transform Your Alumni Network?</h3>
              <p className="mb-8 text-xl/[1.4] text-white/90">
                Join hundreds of institutions already using Alumnify to build stronger alumni communities.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => setOpenModal(true)}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#71be95] to-[#5fa080] px-8 py-4 font-semibold text-white transition-all hover:scale-105 hover:from-[#5fa080] hover:to-[#71be95] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Calendar className="h-5 w-5" /> Schedule your free demo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <ul className="flex items-center gap-4 text-white/80">
                  {[['No setup fees'], ['30-day trial']].map(([label]) => (
                    <li key={label} className="flex items-center gap-1 text-sm">
                      <CheckCircle className="h-4 w-4 text-[#71be95]" /> {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ----------  Metrics  ---------- */}
         <div className="mt-16">
  <div className="text-center mb-12">
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#71be95]/10 to-[#5fa080]/10 px-4 py-2 rounded-full mb-4">
      <div className="w-2 h-2 bg-[#71be95] rounded-full animate-pulse"></div>
      <p className="text-lg font-medium text-gray-700">Trusted by institutions worldwide</p>
    </div>
    <div className="w-24 h-1 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-full mx-auto"></div>
  </div>
  
  {/* Stats Grid */}
  <div className="relative">
    {/* Background decoration */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#71be95]/5 via-[#5fa080]/5 to-[#71be95]/5 rounded-3xl"></div>
    
    <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto p-8">
      {[
        { number: '500+', label: 'Institutions', icon: '🏛️', description: 'Active partnerships' },
        { number: '10K+', label: 'Alumni', icon: '👥', description: 'Connected members' },
        { number: '95%', label: 'Satisfaction', icon: '⭐', description: 'Success rate' },
      ].map(({ number, label, icon, description }, index) => (
        <div 
          key={label} 
          className="group relative text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 hover:border-[#71be95]/30 transition-all duration-300 hover:-translate-y-2"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Hover gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#71be95]/5 to-[#5fa080]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            {/* Icon */}
            <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
            
            {/* Number with counter animation effect */}
            <div className="mb-2">
              <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#71be95] to-[#5fa080] bg-clip-text text-transparent group-hover:from-[#5fa080] group-hover:to-[#71be95] transition-all duration-300">
                {number}
              </span>
            </div>
            
            {/* Label */}
            <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-[#71be95] transition-colors duration-300">
              {label}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
              {description}
            </p>
            
            {/* Animated bottom border */}
            <div className="mt-4 w-0 h-0.5 bg-gradient-to-r from-[#71be95] to-[#5fa080] rounded-full mx-auto group-hover:w-12 transition-all duration-300"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
  
  {/* Additional trust elements */}
  <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      <span>SOC 2 Compliant</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
      <span>GDPR Ready</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
      <span>99.9% Uptime</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
      <span>24/7 Support</span>
    </div>
  </div>
</div>

        </div>
      </section>

      {/* ----------  Modal  ---------- */}
      <DemoModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
}
