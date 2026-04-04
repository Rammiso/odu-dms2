import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border glass sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search anything..."
          className="pl-10 bg-secondary/30 border-border/30 h-9 text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
