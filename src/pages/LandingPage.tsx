import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Building2, Shield, BarChart3, Users, Wrench, DoorOpen,
  ArrowRight, Zap, Globe, Lock, ChevronRight, Star,
  Sparkles, Layers, Bell, Package,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const stats = [
  { label: 'Rooms Managed', value: '2,500+', icon: DoorOpen },
  { label: 'Active Students', value: '10,000+', icon: Users },
  { label: 'Issues Resolved', value: '99.5%', icon: Wrench },
  { label: 'Uptime', value: '99.99%', icon: Zap },
];

const features = [
  {
    icon: DoorOpen,
    title: 'Smart Room Management',
    description: 'Real-time room allocation, occupancy tracking, and automated assignments powered by intelligent algorithms.',
  },
  {
    icon: Users,
    title: 'Student Portal',
    description: 'Self-service portal for room requests, maintenance tickets, and communication with dormitory staff.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Tracking',
    description: 'End-to-end maintenance workflow from request to resolution with priority-based routing.',
  },
  {
    icon: Package,
    title: 'Inventory Control',
    description: 'Track furniture, appliances, and supplies across all dormitory buildings with automated alerts.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Comprehensive dashboards with real-time metrics, occupancy trends, and financial reports.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Granular permissions for admins, staff, maintenance crew, and students with full audit logging.',
  },
];

const testimonials = [
  { name: 'Dr. Sarah Chen', role: 'Director of Housing', quote: 'Transformed how we manage 15 dormitory buildings. Efficiency improved by 60%.', rating: 5 },
  { name: 'Mark Thompson', role: 'Maintenance Lead', quote: 'Maintenance requests that took days now get resolved in hours. Game changer.', rating: 5 },
  { name: 'Emily Rodriguez', role: 'Student Representative', quote: 'Finally a system that actually works. Room changes and requests are seamless.', rating: 5 },
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

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-card' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">OBU DMS</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stats</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <Button onClick={() => navigate('/login')} className="gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity">
            Sign In <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-info/5 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/3 blur-[200px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="max-w-7xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-accent-foreground mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Next-Gen Dormitory Management</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in">
            <span className="text-foreground">Manage Your</span>
            <br />
            <span className="text-gradient">Dormitories</span>
            <br />
            <span className="text-foreground">Intelligently</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in">
            A comprehensive, real-time platform for managing rooms, students,
            maintenance, and operations — all from one powerful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              className="gradient-primary text-primary-foreground font-semibold text-base px-8 h-12 shadow-glow hover:opacity-90 transition-opacity"
            >
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border/50 text-foreground h-12 px-8 hover:bg-secondary/50"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </Button>
          </div>

          {/* Floating cards decoration */}
          <div className="relative mt-20 max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-1 shadow-elevated animate-scale-in">
              <div className="rounded-xl bg-card p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: DoorOpen, label: 'Rooms', value: '342', color: 'text-primary' },
                    { icon: Users, label: 'Students', value: '1,284', color: 'text-accent-foreground' },
                    { icon: Wrench, label: 'Open Tasks', value: '18', color: 'text-[hsl(var(--warning))]' },
                    { icon: Bell, label: 'Alerts', value: '5', color: 'text-[hsl(var(--destructive))]' },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-4 rounded-xl bg-secondary/30 border border-border/30">
                      <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                      <p className="text-2xl font-bold text-foreground">{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6 text-center group hover:shadow-glow transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foreground">
                  {stat.value.includes('%') ? stat.value : <AnimatedCounter target={stat.value} suffix={stat.value.includes('+') ? '+' : ''} />}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-primary/3 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-info/3 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4">
              <Layers className="w-4 h-4" /> Platform Features
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete suite of tools designed to streamline every aspect of dormitory operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-6 group hover:shadow-glow hover:border-primary/20 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:shadow-glow transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4">
              <Star className="w-4 h-4" /> Testimonials
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Trusted by Leaders</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Hear from the people who use OBU DMS every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                  ))}
                </div>
                <p className="text-foreground/90 mb-6 leading-relaxed">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <div className="glass rounded-3xl p-12 shadow-elevated">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow animate-pulse-glow">
              <Globe className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join universities worldwide using OBU DMS to deliver exceptional dormitory experiences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="gradient-primary text-primary-foreground font-semibold text-base px-10 h-12 shadow-glow hover:opacity-90 transition-opacity"
              >
                Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Secure</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Fast</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Reliable</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">OBU DMS</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 OBU Dormitory Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
