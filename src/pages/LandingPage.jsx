import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Logo from '../components/common/Logo';
import { 
  ChevronRight, Zap, FileText, BarChart3, 
  ShieldCheck, Globe, Star, CheckCircle,
  Upload, Brain, ListChecks, TrendingUp,
  BookOpen, Users, GraduationCap, Clock,
  Sparkles, ArrowRight, Target, Layers,
  Shield, RefreshCw, MessageSquare, Award,
  Trophy, School, UserPlus, Share2, Medal
} from 'lucide-react';

/* â•â•â•â•â•â•â•â•â•â•â• Scroll-reveal hook â•â•â•â•â•â•â•â•â•â•â• */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function LandingPage() {
  const { user } = useContext(AuthContext);
  const dashboardPath = user?.is_admin ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen font-sans selection:bg-teal-400 selection:text-slate-900">
      <Navbar />
      
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="hero" className="relative pt-20 pb-20 sm:pt-28 sm:pb-40 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-15%] left-[-10%] w-[42%] h-[42%] bg-teal-500/15 blur-[140px] rounded-full"></div>
          <div className="absolute bottom-[5%] right-[-5%] w-[34%] h-[34%] bg-sky-500/15 blur-[140px] rounded-full"></div>
          <div className="absolute top-[30%] left-[12%] w-3 h-3 bg-teal-400/40 rounded-full animate-float-slow"></div>
          <div className="absolute top-[55%] right-[15%] w-2 h-2 bg-sky-400/30 rounded-full animate-float-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[20%] right-[25%] w-1.5 h-1.5 bg-emerald-400/30 rounded-full animate-float-slow" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-[25%] left-[30%] w-2.5 h-2.5 bg-violet-400/25 rounded-full animate-float-slow" style={{ animationDelay: '3s' }}></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-slate-900/70 px-6 py-2.5 rounded-full shadow-sm border border-slate-700 mb-10 animate-fade-in-down">
            <span className="flex h-2.5 w-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-base font-bold text-slate-200">Powered by Advanced AI Models</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-8xl font-extrabold text-slate-100 leading-[1.05] mb-8 tracking-tight font-display animate-fade-in-up">
            Transform Any PDF Into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-sky-300 animate-gradient">Interactive Quizzes</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            Upload your textbooks, lecture notes, or study materials and watch our AI analyze, 
            extract key concepts, and generate high-quality quiz questions â€” all in minutes, not hours. 
            Perfect for <span className="text-teal-300 font-semibold">educators</span>, <span className="text-sky-300 font-semibold">mentors</span>, <span className="text-violet-300 font-semibold">students</span>, and <span className="text-emerald-300 font-semibold">training teams</span>.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {user ? (
              <Link to={dashboardPath} className="group bg-teal-500 text-slate-900 px-8 py-4 sm:px-12 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:bg-teal-400 shadow-2xl shadow-teal-900/40 flex items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-teal-800/50">
                Enter Dashboard <ChevronRight className="group-hover:translate-x-1 transition-transform"/>
              </Link>
            ) : (
              <>
                <Link to="/register" className="group bg-teal-500 text-slate-900 px-8 py-4 sm:px-12 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:bg-teal-400 shadow-xl shadow-teal-900/40 flex items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-teal-800/50">
                  Get Started Free <ChevronRight className="group-hover:translate-x-1 transition-transform"/>
                </Link>
                <Link to="/login" className="bg-slate-900/70 text-slate-200 border border-slate-700 px-8 py-4 sm:px-12 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:bg-slate-900 transition-all active:scale-95">
                  Sign In with Google
                </Link>
              </>
            )}
          </div>

          {/* Quick stats below hero */}
          <div className="mt-10 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
            {[
              { value: 'AI-Powered', label: 'Quiz Generation' },
              { value: 'Instant', label: 'PDF Processing' },
              { value: 'Smart', label: 'Analytics & Leaderboards' },
              { value: 'Free', label: 'To Get Started' },
            ].map((stat, i) => (
              <div key={i} className="text-center py-4">
                <div className="text-xl font-black text-teal-300">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• HOW IT WORKS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <RevealSection id="how-it-works" className="py-14 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 sm:mb-20">
            <div className="inline-flex items-center gap-2 text-teal-400 text-sm font-black uppercase tracking-[0.25em] mb-5">
              <Sparkles className="w-5 h-5" /> Simple Process
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 mb-5 font-display">How It Works</h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">From PDF to quiz-ready content in three simple steps. No complex setup, no learning curve.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative stagger-children">
            {/* Connector line */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-teal-500/50 via-sky-500/50 to-emerald-500/50"></div>
            
            <StepCard 
              step="01"
              icon={<Upload className="w-8 h-8" />}
              color="teal"
              title="Upload Your PDF"
              desc="Drag & drop any PDF document â€” textbooks, lecture notes, research papers, training manuals, or study guides. Our system accepts files up to 100MB."
            />
            <StepCard 
              step="02"
              icon={<Brain className="w-8 h-8" />}
              color="sky"
              title="AI Analyzes Content"
              desc="Our AI reads and comprehends the material, extracting key concepts, definitions, relationships, and learning objectives from every page."
            />
            <StepCard 
              step="03"
              icon={<ListChecks className="w-8 h-8" />}
              color="emerald"
              title="Generate & Publish"
              desc="Review the auto-generated questions, customize difficulty levels, select the best ones, and publish your quiz for students to take instantly."
            />
          </div>
        </div>
      </RevealSection>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <RevealSection id="features" className="py-14 sm:py-28 bg-slate-950/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 sm:mb-20">
            <div className="inline-flex items-center gap-2 text-sky-400 text-sm font-black uppercase tracking-[0.25em] mb-5">
              <Zap className="w-5 h-5" /> Platform Features
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 mb-5 font-display">Everything You Need to Create Smarter Quizzes</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">A complete AI-powered platform that handles the entire workflow â€” from document ingestion to student performance tracking.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 stagger-children">
            <FeatureCard 
              icon={<FileText className="w-7 h-7 text-white" />}
              iconBg="bg-teal-500"
              title="Deep PDF Understanding"
              desc="Goes beyond OCR â€” our AI comprehends context, identifies core concepts, and maps knowledge hierarchies within your documents."
            />
            <FeatureCard 
              icon={<Zap className="w-7 h-7 text-white" />}
              iconBg="bg-sky-500"
              title="Instant Question Generation"
              desc="Generate multiple-choice, true/false, and open-ended questions in seconds. Choose how many questions you need â€” from 5 to 50+."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-7 h-7 text-white" />}
              iconBg="bg-emerald-500"
              title="Performance Analytics"
              desc="Track student scores, identify weak topics, and understand learning patterns with detailed charts and performance breakdowns."
            />
            <FeatureCard 
              icon={<Target className="w-7 h-7 text-white" />}
              iconBg="bg-violet-500"
              title="Difficulty Calibration"
              desc="AI automatically balances easy, medium, and hard questions. Admins can adjust difficulty to match their curriculum requirements."
            />
            <FeatureCard 
              icon={<RefreshCw className="w-7 h-7 text-white" />}
              iconBg="bg-amber-500"
              title="Edit & Refine"
              desc="Full quiz editor lets you modify questions, change correct answers, rewrite options, and add explanations before publishing."
            />
            <FeatureCard 
              icon={<Shield className="w-7 h-7 text-white" />}
              iconBg="bg-rose-500"
              title="Secure & Private"
              desc="Google OAuth authentication keeps accounts secure. Admin panel is role-protected. Your documents and data stay private."
            />
          </div>
        </div>
      </RevealSection>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DETAILED BREAKDOWN â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <RevealSection id="who-its-for" className="py-14 sm:py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* For Educators */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-32">
            <div>
              <div className="inline-flex items-center gap-2 text-teal-400 text-sm font-black uppercase tracking-[0.25em] mb-5">
                <GraduationCap className="w-5 h-5" /> For Educators
              </div>
              <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 mb-5 font-display">Save Hours of Quiz Preparation</h3>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                Creating quizzes manually from textbooks is tedious and time-consuming. PDF2Quiz AI automates the entire process â€” 
                upload your course material and get a complete question bank in minutes. Focus on teaching, not paperwork.
              </p>
              <ul className="space-y-4">
                {[
                  'Upload any textbook or lecture notes as PDF',
                  'AI generates curriculum-aligned questions automatically',
                  'Review, edit, and hand-pick the best questions',
                  'Publish quizzes for your students with one click',
                  'Track class performance with detailed analytics',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-base">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl hover-lift">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-600 ml-2 font-mono">admin-panel.jsx</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                    <Upload className="w-5 h-5 text-teal-400" />
                    <span className="text-sm text-slate-300 font-medium">cyber-security-fundamentals.pdf</span>
                    <span className="ml-auto text-xs font-bold text-teal-400">Processed</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                    <Brain className="w-5 h-5 text-sky-400" />
                    <span className="text-sm text-slate-300 font-medium">25 questions generated</span>
                    <span className="ml-auto text-xs font-bold text-sky-400">Ready</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-slate-300 font-medium">Quiz published to 45 students</span>
                    <span className="ml-auto text-xs font-bold text-emerald-400">Live</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-teal-500/10 rounded-2xl blur-xl -z-10"></div>
            </div>
          </div>

          {/* For Students */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl hover-lift">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-600 ml-2 font-mono">student-dashboard</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-sm font-bold text-slate-300">Network Security Quiz</span>
                    <span className="text-sm font-black text-emerald-400">92%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full animate-progress" style={{ width: '92%' }}></div>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-sm font-bold text-slate-300">Cryptography Basics</span>
                    <span className="text-sm font-black text-sky-400">78%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-sky-500 to-blue-400 h-2.5 rounded-full animate-progress" style={{ width: '78%', animationDelay: '0.3s' }}></div>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-sm font-bold text-slate-300">Web App Security</span>
                    <span className="text-sm font-black text-amber-400">65%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-2.5 rounded-full animate-progress" style={{ width: '65%', animationDelay: '0.6s' }}></div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">3 quizzes completed</span>
                  <span className="text-xs font-bold text-teal-400">Average: 78%</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-sky-500/10 rounded-2xl blur-xl -z-10"></div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 text-sky-400 text-sm font-black uppercase tracking-[0.25em] mb-5">
                <BookOpen className="w-5 h-5" /> For Students
              </div>
              <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 mb-5 font-display">Learn Smarter, Not Harder</h3>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                Test your knowledge with AI-generated quizzes tailored to your course material. 
                Get instant feedback, track your progress over time, and identify exactly which topics need more attention.
              </p>
              <ul className="space-y-4">
                {[
                  'Take quizzes published by your instructor anytime',
                  'Instant scoring with correct answers & explanations',
                  'Personal dashboard tracks all your attempts',
                  'See detailed breakdowns of your performance',
                  'Identify weak areas and focus your studying',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-base">
                    <CheckCircle className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MENTORS & CLASSROOMS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <RevealSection className="py-14 sm:py-28 bg-slate-950/40 relative overflow-hidden">
        <div className="absolute top-[10%] right-[-5%] w-[30%] h-[40%] bg-violet-500/8 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 sm:mb-20">
            <div className="inline-flex items-center gap-2 text-violet-400 text-sm font-black uppercase tracking-[0.25em] mb-5">
              <School className="w-5 h-5" /> Mentor System
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 mb-5 font-display">Classrooms & Mentorship Built In</h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Go beyond simple quiz sharing. Create virtual classrooms, invite students with join codes, 
              share curated quizzes, and monitor progress â€” all from one powerful mentor dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-20">
            {/* Left â€” Feature list */}
            <div>
              <div className="space-y-6">
                <MentorFeatureRow
                  icon={<School className="w-6 h-6 text-violet-400" />}
                  color="violet"
                  title="Create Classrooms"
                  desc="Set up dedicated classrooms for each course or cohort. Students join with a simple invite code â€” no emails required."
                />
                <MentorFeatureRow
                  icon={<Share2 className="w-6 h-6 text-teal-400" />}
                  color="teal"
                  title="Share Quizzes Instantly"
                  desc="Publish admin quizzes or your own custom quizzes directly to any classroom. Students see them immediately on their dashboard."
                />
                <MentorFeatureRow
                  icon={<UserPlus className="w-6 h-6 text-sky-400" />}
                  color="sky"
                  title="Student Management"
                  desc="View all enrolled students, track their quiz attempts, and monitor participation rates across your classrooms."
                />
                <MentorFeatureRow
                  icon={<BarChart3 className="w-6 h-6 text-emerald-400" />}
                  color="emerald"
                  title="Mentor Analytics"
                  desc="Get aggregated performance insights â€” average scores, completion rates, and top performers at a glance."
                />
              </div>
            </div>

            {/* Right â€” Visual mockup */}
            <div className="relative">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl hover-lift">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-600 ml-2 font-mono">mentor-dashboard</span>
                </div>
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-bold text-slate-200">CS 301 â€” Data Structures</h4>
                    <span className="text-xs font-bold bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 32 students</span>
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> 8 quizzes</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> 76% avg</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: 'Alice M.', score: '94%', color: 'emerald' },
                    { name: 'Bob T.', score: '87%', color: 'sky' },
                    { name: 'Carol S.', score: '81%', color: 'teal' },
                    { name: 'Dan R.', score: '72%', color: 'amber' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
                      <div className={`w-8 h-8 rounded-full bg-${s.color}-500/20 flex items-center justify-center text-xs font-bold text-${s.color}-300`}>
                        {s.name[0]}
                      </div>
                      <span className="text-sm font-medium text-slate-300 flex-1">{s.name}</span>
                      <span className={`text-sm font-black text-${s.color}-400`}>{s.score}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                  <span className="text-xs text-slate-500 font-medium">Join Code: <span className="text-violet-400 font-bold tracking-wider">CS301-XK9</span></span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-violet-500/10 rounded-2xl blur-xl -z-10"></div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• LEADERBOARDS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <RevealSection className="py-14 sm:py-28 relative overflow-hidden">
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[40%] bg-amber-500/8 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left â€” visual */}
            <div className="relative">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl hover-lift">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-600 ml-2 font-mono">leaderboard</span>
                </div>
                {/* Podium */}
                <div className="flex items-end justify-center gap-3 mb-6">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-700/60 border-2 border-slate-600 flex items-center justify-center text-lg font-bold text-slate-300 mx-auto mb-2">B</div>
                    <div className="bg-gradient-to-t from-slate-700 to-slate-600 rounded-t-lg w-16 h-16 flex items-center justify-center">
                      <span className="text-sm font-black text-slate-300">2nd</span>
                    </div>
                  </div>
                  <div className="text-center -mt-4">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/60 flex items-center justify-center text-xl font-bold text-amber-300 mx-auto mb-2 animate-pulse-glow">A</div>
                    <div className="bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg w-20 h-24 flex items-center justify-center">
                      <div className="text-center">
                        <Trophy className="w-5 h-5 text-amber-100 mx-auto mb-0.5" />
                        <span className="text-sm font-black text-amber-100">1st</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-amber-800/30 border-2 border-amber-700/40 flex items-center justify-center text-lg font-bold text-amber-600 mx-auto mb-2">C</div>
                    <div className="bg-gradient-to-t from-amber-900/60 to-amber-800/50 rounded-t-lg w-16 h-12 flex items-center justify-center">
                      <span className="text-sm font-black text-amber-700">3rd</span>
                    </div>
                  </div>
                </div>
                {/* Rankings list */}
                <div className="space-y-2">
                  {[
                    { rank: 4, name: 'David K.', pts: '2,340 pts', pct: '85%' },
                    { rank: 5, name: 'Emma L.', pts: '2,180 pts', pct: '79%' },
                  ].map((r) => (
                    <div key={r.rank} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/40">
                      <span className="text-xs font-black text-slate-500 w-5">#{r.rank}</span>
                      <div className="w-7 h-7 rounded-full bg-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-400">{r.name[0]}</div>
                      <span className="text-sm font-medium text-slate-300 flex-1">{r.name}</span>
                      <span className="text-xs font-bold text-slate-500">{r.pts}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-amber-500/10 rounded-2xl blur-xl -z-10"></div>
            </div>

            {/* Right â€” description */}
            <div>
              <div className="inline-flex items-center gap-2 text-amber-400 text-sm font-black uppercase tracking-[0.25em] mb-5">
                <Trophy className="w-5 h-5" /> Leaderboards
              </div>
              <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 mb-5 font-display">Compete, Climb & Celebrate</h3>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                Fuel engagement with built-in leaderboards. Students see where they rank globally and within 
                each classroom â€” driving friendly competition and motivating consistent study habits.
              </p>
              <ul className="space-y-4">
                {[
                  'Global leaderboard ranks all students across the platform',
                  'Classroom-specific rankings for focused competition',
                  'Beautiful podium display for top 3 performers',
                  'Points system based on quiz scores and participation',
                  'Mentors can view leaderboard analytics per classroom',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-base">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• STATS BANNER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-emerald-500/10 border-y border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem icon={<FileText className="w-7 h-7" />} value="PDF" label="Upload & Process" />
            <StatItem icon={<Brain className="w-7 h-7" />} value="AI" label="Question Generation" />
            <StatItem icon={<Trophy className="w-7 h-7" />} value="Leaderboards" label="Competitive Learning" />
            <StatItem icon={<School className="w-7 h-7" />} value="Classrooms" label="Mentor System" />
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• USE CASES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <RevealSection id="use-cases" className="py-14 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 sm:mb-20">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-black uppercase tracking-[0.25em] mb-5">
              <Layers className="w-5 h-5" /> Use Cases
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 mb-5 font-display">Built For Everyone Who Learns or Teaches</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Whether you're a university professor, a corporate trainer, or a student studying for exams â€” PDF2Quiz AI adapts to your needs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            <UseCaseCard 
              icon={<GraduationCap className="w-7 h-7 text-teal-400" />}
              title="Universities"
              desc="Professors can generate exam prep quizzes from lecture slides and textbook chapters in minutes."
            />
            <UseCaseCard 
              icon={<Users className="w-7 h-7 text-sky-400" />}
              title="Corporate Training"
              desc="HR and L&D teams can create compliance and onboarding assessments from training manuals."
            />
            <UseCaseCard 
              icon={<BookOpen className="w-7 h-7 text-violet-400" />}
              title="Self-Study"
              desc="Students can upload their own notes and generate practice tests to solidify understanding."
            />
            <UseCaseCard 
              icon={<Award className="w-7 h-7 text-amber-400" />}
              title="Certification Prep"
              desc="Study guide PDFs become instant mock exams for IT certs, professional licenses, and more."
            />
          </div>
        </div>
      </RevealSection>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FAQ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <RevealSection id="faq" className="py-14 sm:py-28 bg-slate-950/40">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-amber-400 text-sm font-black uppercase tracking-[0.25em] mb-5">
              <MessageSquare className="w-5 h-5" /> FAQ
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 mb-5 font-display">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <FaqItem 
              q="What types of PDFs can I upload?" 
              a="Any text-based PDF works â€” textbooks, lecture notes, research papers, training manuals, study guides, and more. The AI works best with clearly structured educational content."
            />
            <FaqItem 
              q="How does the AI generate questions?" 
              a="Our pipeline chunks your PDF into manageable sections, extracts key concepts using NLP, then uses advanced language models to generate contextually relevant questions with multiple answer options and explanations."
            />
            <FaqItem 
              q="Can I edit or customize the generated questions?" 
              a="Absolutely! The admin quiz editor lets you modify question text, change answers, adjust options, add explanations, and hand-pick which questions to include before publishing."
            />
            <FaqItem 
              q="What is the Mentor/Classroom system?" 
              a="Mentors can create virtual classrooms, invite students via join codes, share quizzes to specific classrooms, and track student performance â€” all from a dedicated mentor dashboard."
            />
            <FaqItem 
              q="How do Leaderboards work?" 
              a="Students are ranked based on their quiz performance. There's a global leaderboard across the entire platform and classroom-specific leaderboards. Top 3 performers are featured on a podium display."
            />
            <FaqItem 
              q="Is it free to use?" 
              a="Yes â€” you can get started for free. Sign up with Google, and begin exploring the platform immediately."
            />
          </div>
        </div>
      </RevealSection>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="get-started" className="py-16 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[10%] left-[15%] w-[40%] h-[60%] bg-teal-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[50%] bg-sky-500/10 blur-[120px] rounded-full"></div>
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-5 py-2 rounded-full mb-8">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <span className="text-base font-bold text-teal-300">Ready to get started?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-slate-100 mb-8 font-display">
            Start Creating AI-Powered Quizzes Today
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed">
            Join educators, mentors, and students who are already saving time and learning smarter with PDF2Quiz AI. It only takes a minute to get started.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            {user ? (
              <Link to={dashboardPath} className="group bg-teal-500 text-slate-900 px-8 py-4 sm:px-12 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:bg-teal-400 shadow-2xl shadow-teal-900/40 flex items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-teal-800/50">
                Go to Dashboard <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
              </Link>
            ) : (
              <>
                <Link to="/register" className="group bg-teal-500 text-slate-900 px-8 py-4 sm:px-12 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:bg-teal-400 shadow-xl shadow-teal-900/40 flex items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-teal-800/50">
                  Create Free Account <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
                </Link>
                <Link to="/login" className="bg-slate-900/70 text-slate-200 border border-slate-700 px-8 py-4 sm:px-12 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:bg-slate-900 transition-all active:scale-95">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FOOTER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="bg-slate-950 text-slate-400 py-10 sm:py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
            <div className="sm:col-span-2">
              <div className="text-white font-bold text-2xl mb-4 flex items-center gap-2 font-display">
                <Logo size="md" />
              </div>
              <p className="max-w-sm leading-relaxed text-base">
                An AI-powered platform that transforms PDF documents into interactive, curriculum-aligned quizzes. 
                Designed for educators, mentors and students who want to learn effectively.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-5 text-base">Platform</h4>
              <ul className="space-y-3 text-base">
                <li><Link to="/quizzes" className="hover:text-white transition">Browse Quizzes</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Sign In with Google</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition">Student Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-5 text-base">Admin</h4>
              <ul className="space-y-3 text-base">
                <li>
                  <Link to="/admin-login" className="flex items-center gap-2 hover:text-teal-300 transition group">
                    <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition" /> Admin Portal
                  </Link>
                </li>
                <li><Link to="#" className="hover:text-white transition">Documentation</Link></li>
                <li><Link to="#" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <span>&copy; {new Date().getFullYear()} PDF2Quiz AI. All rights reserved.</span>
            <span className="text-slate-600">Built with AI for the future of education.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• SUB-COMPONENTS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function RevealSection({ children, className = '', id }) {
  const ref = useScrollReveal();
  return (
    <section
      ref={ref}
      id={id}
      className={`reveal-section ${className}`}
    >
      {children}
    </section>
  );
}

function MentorFeatureRow({ icon, color, title, desc }) {
  const colors = {
    violet: 'bg-violet-500/10 border-violet-500/20',
    teal:   'bg-teal-500/10 border-teal-500/20',
    sky:    'bg-sky-500/10 border-sky-500/20',
    emerald:'bg-emerald-500/10 border-emerald-500/20',
  };
  return (
    <div className={`flex items-start gap-4 p-5 rounded-2xl border ${colors[color]} backdrop-blur-sm hover:shadow-lg transition-all duration-300`}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <h4 className="text-lg font-bold text-slate-100 mb-1">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ step, icon, color, title, desc }) {
  const colors = {
    teal:    { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', badge: 'bg-teal-500 text-slate-900' },
    sky:     { bg: 'bg-sky-500/10',  border: 'border-sky-500/20',  text: 'text-sky-400',  badge: 'bg-sky-500 text-slate-900' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500 text-slate-900' },
  };
  const c = colors[color];

  return (
    <div className={`relative p-9 rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm hover:shadow-xl transition-all duration-300 group hover-lift`}>
      <div className={`${c.badge} w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black mb-5 shadow-lg`}>
        {step}
      </div>
      <div className={`${c.text} mb-4`}>{icon}</div>
      <h3 className="text-xl font-bold text-slate-100 mb-3">{title}</h3>
      <p className="text-slate-400 text-base leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, iconBg, title, desc }) {
  return (
    <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:shadow-xl hover:shadow-teal-900/20 transition-all duration-300 group hover-lift card-glow">
      <div className={`${iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg transform group-hover:-translate-y-1 group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-base">{desc}</p>
    </div>
  );
}

function UseCaseCard({ icon, title, desc }) {
  return (
    <div className="p-7 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300 hover:shadow-lg group hover-lift card-glow">
      <div className="mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-500 text-base leading-relaxed">{desc}</p>
    </div>
  );
}

function StatItem({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-teal-400 mb-1">{icon}</div>
      <div className="text-2xl font-black text-slate-100">{value}</div>
      <div className="text-sm text-slate-500 font-medium">{label}</div>
    </div>
  );
}

function FaqItem({ q, a }) {
  return (
    <details className="group rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <summary className="flex items-center justify-between p-6 cursor-pointer text-slate-100 font-bold text-lg hover:bg-slate-900/80 transition select-none">
        <span className="pr-4">{q}</span>
        <ChevronRight className="w-5 h-5 text-slate-500 group-open:rotate-90 transition-transform flex-shrink-0" />
      </summary>
      <div className="px-6 pb-6 text-base text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4">
        {a}
      </div>
    </details>
  );
}