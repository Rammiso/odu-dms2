import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Building2, Shield, Users, Wrench,
  ArrowRight, Zap, Globe, ChevronRight, Star,
  Layers, Bell, MapPin, Server, Send,
  Cpu, Lock, DoorOpen, ArrowRightLeft, Package, BarChart3, Radio, CheckCircle2, Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ReactiveGrid } from '@/components/ReactiveGrid';

const systemFeatures = [
  {
    icon: DoorOpen,
    title: 'Intelligent Room Allocation',
    description: 'Real-time housing availability matrix and automated placement for seamless dormitory assignments.',
  },
  {
    icon: ArrowRightLeft,
    title: 'Frictionless Room Changes',
    description: 'Submit housing transfer requests with transparent tracking and digital approval workflows.',
  },
  {
    icon: Wrench,
    title: 'Rapid Maintenance',
    description: 'Report anomalies instantly. Automated task routing ensures campus facilities are repaired with zero delay.',
  },
  {
    icon: Package,
    title: 'Asset & Inventory Telemetry',
    description: 'Precision mapping and tracking of furniture, appliances, and critical facility assets.',
  },
  {
    icon: BarChart3,
    title: 'Occupancy Analytics',
    description: 'Generate real-time data visualizations of housing density, demographics, and operations.',
  },
  {
    icon: Radio,
    title: 'Notification Matrix',
    description: 'Receive critical campus announcements and system status alerts with zero latency.',
  },
];

const testimonials = [
  { name: 'Marcus J.', role: 'Computer Science Student', quote: 'The room change portal is incredibly fluid. My transfer request was processed digitally without any paperwork.', rating: 5 },
  { name: 'Sarah K.', role: 'Maintenance Supervisor', quote: 'Automated maintenance routing lets us prioritize critical issues. Resolution times have decreased by 40%.', rating: 5 },
  { name: 'Dr. Alemayehu', role: 'Dormitory Administrator', quote: 'Having live occupancy metrics and asset telemetry on a single dashboard revolutionized our workflow.', rating: 5 },
];

const AnimatedCounter = ({ target, suffix = '' }: { target: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(target.replace(/[^0-9]/g, ''));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [numericValue]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const QuickActionForm = () => {
  const [issue, setIssue] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !location) return;
    setIsSubmitting(true);

    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Maintenance ticket generated! Help is executing.');
      setIssue('');
      setLocation('');
    }, 1500);
  };

  return (
    <div className="glass p-6 rounded-2xl border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.15)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Send className="w-5 h-5 text-primary" /> Report Anomaly
      </h3>
      <p className="text-sm text-muted-foreground mb-4">Fast-track maintenance protocols instantly.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Location (e.g., Room 402, North Sector)"
          className="bg-secondary/40 border border-border/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <textarea
          placeholder="Describe the issue... (e.g., HVAC failure)"
          className="bg-secondary/40 border border-border/50 rounded-lg px-4 py-2 text-sm resize-none h-20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          required
        />
        <Button disabled={isSubmitting} type="submit" className="w-full gradient-primary shadow-[0_0_15px_rgba(var(--primary),0.4)] hover:shadow-[0_0_25px_rgba(var(--primary),0.6)] transition-all">
          {isSubmitting ? 'Transmitting...' : 'Submit Request'}
        </Button>
      </form>
    </div>
  );
};

const SmartStatusBoard = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Housing Card */}
      <div className="glass p-5 rounded-2xl border border-info/20 shadow-[0_0_20px_rgba(var(--info),0.1)] hover:border-info/40 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-info">
            <div className="p-2 rounded-lg bg-info/10">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-semibold">Housing Matrix</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Live</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">1,248</p>
            <p className="text-muted-foreground">Occupied</p>
          </div>
          <div className="w-px h-10 bg-border/50"></div>
          <div className="text-center">
            <p className="text-2xl font-bold text-info">42</p>
            <p className="text-muted-foreground">Available</p>
          </div>
        </div>
      </div>

      {/* Maintenance Card */}
      <div className="glass p-5 rounded-2xl border border-[hsl(var(--warning))]/20 shadow-[0_0_20px_rgba(var(--warning),0.1)] hover:border-[hsl(var(--warning))]/40 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-[hsl(var(--warning))]">
            <div className="p-2 rounded-lg bg-[hsl(var(--warning))]/10">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="font-semibold">Maintenance Queue</span>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">Routing</span>
        </div>
        <p className="text-sm font-medium mb-1">Current Load</p>
        <p className="text-xs text-muted-foreground truncate">14 High Priority Anomalies</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-secondary rounded-full h-1.5">
            <div className="bg-[hsl(var(--warning))] h-1.5 rounded-full" style={{ width: '40%' }}></div>
          </div>
          <span className="text-xs text-muted-foreground">40%</span>
        </div>
      </div>

      {/* Network Status */}
      <div className="glass p-5 rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)] sm:col-span-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md animate-pulse"></div>
              <Radio className="w-5 h-5 relative z-10" />
            </div>
            <div>
              <p className="font-semibold">System Broadcast</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-primary tracking-wide">LATEST:</span> Semester housing allocations are now active.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wider">ALL SECURE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 transition-colors duration-500 animate-scanline">
      <ReactiveGrid />
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-1/4 -left-[20%] w-[1000px] h-[1000px] rounded-full bg-primary/10 dark:bg-primary/10 blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] -right-[10%] w-[800px] h-[800px] rounded-full bg-info/10 dark:bg-info/10 blur-[150px]" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[60%] w-[600px] h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-500/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/70 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="OBU Core Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            <span className="text-lg font-bold tracking-wider">OBU<span className="text-primary">CORE</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Modules</a>
            <a href="#stats" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Telemetrics</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-white dark:hover:text-white hover:text-foreground transition-colors">Personnel</a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={() => navigate('/login')} className="gradient-primary text-primary-foreground font-semibold shadow-[0_0_15px_rgba(var(--primary),0.4)] hover:shadow-[0_0_25px_rgba(var(--primary),0.6)] transition-all">
              Initialize <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left Column: Copy */}
          <div className="text-left animate-fade-in relative">

            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="font-semibold tracking-wide uppercase text-xs">V2.4 Online - Interconnected</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              <span className="text-foreground">Oda Bultum University</span><br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-info to-purple-500">Dormitory Ecosystem.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
              A unified command portal for students and staff. Experience frictionless room assignments, rapid maintenance processing, and real-time campus telemetry.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="gradient-primary text-primary-foreground font-semibold text-base px-8 h-12 shadow-[0_0_20px_rgba(var(--primary),0.5)] hover:shadow-[0_0_30px_rgba(var(--primary),0.7)] hover:scale-105 transition-all duration-300"
              >
                Access Portal <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary/20 text-foreground h-12 px-8 hover:bg-primary/10 hover:border-primary/40 transition-all font-semibold"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Modules
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground font-mono uppercase">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Multi-Language UI Built-in</div>
              <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-info" /> Role-Based Access</div>
            </div>
          </div>

          {/* Right Column: Interactive Widgets */}
          <div className="relative animate-scale-in flex flex-col gap-6">
            {/* Decorative grid */}

            {/* Status Board Widget */}
            <div className="animate-float" style={{ animationDelay: '0s' }}>
              <SmartStatusBoard />
            </div>

            {/* Quick Action Widget */}
            <div className="animate-float" style={{ animationDelay: '1s' }}>
              <QuickActionForm />
            </div>
          </div>

        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6 relative border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Active Students', value: '14,204', icon: Users, color: 'text-info' },
              { label: 'Maintenance ROI', value: '99.8%', icon: Wrench, color: 'text-[hsl(var(--warning))]' },
              { label: 'Asset Logs', value: '8,500+', icon: Package, color: 'text-primary' },
              { label: 'System Uptime', value: '99.99%', icon: Activity, color: 'text-emerald-400' },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6 text-center border-white/5 hover:border-white/20 transition-all duration-300">
                <stat.icon className={`w-8 h-8 mx-auto mb-4 ${stat.color} drop-shadow-[0_0_10px_currentColor]`} />
                <p className="text-3xl md:text-4xl font-bold text-foreground">
                  {stat.value.includes('%') ? stat.value : <AnimatedCounter target={stat.value} suffix={stat.value.includes('+') ? '+' : ''} />}
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-muted-foreground text-sm mb-4">
              <Layers className="w-4 h-4 text-primary" /> Core Subsystems
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              A Unified System Matrix
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg pt-2">
              Precision control over every element of campus housing, from automated assignments to hardware telemetry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemFeatures.map((feature, i) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-6 border border-white/5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(var(--primary),0.1)] transition-all duration-500 overflow-hidden relative group animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Digital Scan Effect (Light Mode only) */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/30 animate-scanline"></div>
                  <div className="absolute inset-0 bg-primary/[0.02]"></div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] group-hover:bg-primary/20 transition-colors"></div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <feature.icon className="w-6 h-6 text-foreground relative z-10 group-hover:text-primary-foreground group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-gradient-to-b from-transparent to-primary/5 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-muted-foreground text-sm mb-4">
              <Users className="w-4 h-4 text-info" /> Personnel Logs
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">Validated by Network Users</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-8 border border-white/5 hover:border-primary/30 transition-all duration-300 relative">
                <Shield className="w-24 h-24 absolute -right-4 -bottom-4 text-primary/5 -rotate-12" />
                <div className="flex gap-1 mb-6 relative z-10">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary drop-shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
                  ))}
                </div>
                <p className="text-foreground/90 mb-8 leading-relaxed font-medium relative z-10 text-lg">"{t.quote}"</p>
                <div className="flex items-center gap-3 relative z-10 border-t border-white/10 pt-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-white shadow-glow">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Rich Footer */}
      <footer className="border-t border-white/10 pt-16 pb-8 px-6 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="OBU Core Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              <span className="text-xl font-bold tracking-wider">OBU<span className="text-primary">CORE</span></span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-6">
              Oda Bultum University smart dormitory management system. Streamlining the student housing experience with real-time telemetrics and interconnected campus modules.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono uppercase tracking-wider">
              <span className="flex items-center gap-2"><Lock className="w-3 h-3 text-emerald-400" /> AES-256 Encrypted</span>
              <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-primary" /> 99.99% Uptime</span>
            </div>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6 tracking-wide flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Matrices</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary/50"></div> Student Profile Area</a></li>
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary/50"></div> Room Operations</a></li>
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary/50"></div> Maintenance Tracking</a></li>
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary/50"></div> Asset Control Hub</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6 tracking-wide flex items-center gap-2"><Globe className="w-4 h-4 text-info" /> Systems</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-info/50"></div> Personnel Protocols</a></li>
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-info/50"></div> Occupancy Analytics</a></li>
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-info/50"></div> Global Alerts</a></li>
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-info/50"></div> Security Protocols</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-muted-foreground">
          <p>© 2026 OBU Core Network. All systems operational.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
