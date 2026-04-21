import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatCard from '@/components/StatCard';
import {
  Users, DoorOpen, Wrench, BedDouble, BarChart3, ArrowRightLeft,
  AlertTriangle, Bell, Activity, TrendingUp, Clock,
  ChevronRight, CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { apiService } from '@/lib/api';
import type { DashboardSummary, MaintenanceRequest, Notification, RoomChangeRequest, Room } from '@/types/api';

const T = {
  tooltip: { background: 'hsl(220,18%,10%)', border: '1px solid hsl(220,15%,20%)', borderRadius: '12px', color: 'hsl(210,40%,95%)' },
  tick: { fill: 'hsl(215,15%,55%)', fontSize: 10 },
  grid: 'hsl(220,15%,16%)',
};

const monthlyData = [
  { month: 'Sep', occupancy: 75, requests: 12 },
  { month: 'Oct', occupancy: 82, requests: 18 },
  { month: 'Nov', occupancy: 88, requests: 15 },
  { month: 'Dec', occupancy: 65, requests: 8  },
  { month: 'Jan', occupancy: 90, requests: 22 },
  { month: 'Feb', occupancy: 87, requests: 19 },
  { month: 'Mar', occupancy: 91, requests: 25 },
  { month: 'Apr', occupancy: 87, requests: 23 },
];

const buildingData = [
  { name: 'Blk A', occupancy: 92 },
  { name: 'Blk B', occupancy: 78 },
  { name: 'Blk C', occupancy: 95 },
  { name: 'Blk D', occupancy: 72 },
];

const PIE_COLORS = ['hsl(152,60%,45%)', 'hsl(185,80%,50%)', 'hsl(38,92%,55%)'];

// ─── Student Dashboard (mobile-first) ───────────────────────────────────────
function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myMaint, setMyMaint] = useState<MaintenanceRequest[]>([]);
  const [myChanges, setMyChanges] = useState<RoomChangeRequest[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [maintenanceRes, changeRes, notifRes] = await Promise.all([
        apiService.getStudentMaintenanceRequests(10, 0),
        apiService.getMyRoomChangeRequests(),
        apiService.getNotifications({ limit: 10, offset: 0 }),
      ]);

      if (!active) return;
      if (maintenanceRes.success && maintenanceRes.data?.requests) setMyMaint(maintenanceRes.data.requests);
      if (changeRes.success && changeRes.data?.requests) setMyChanges(changeRes.data.requests);
      if (notifRes.success && notifRes.data?.notifications) setNotifs(notifRes.data.notifications);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const unread = notifs.filter((n: any) => !n.isRead).length;
  const activeMaint = myMaint.filter((r: any) => r.status !== 'Completed' && r.status !== 'Rejected');
  const pendingChange = myChanges.find((r: any) => r.status === 'pending');

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Hi, <span className="text-gradient">{user?.fullName?.split(' ')[0]}</span> 👋</h1>
        <p className="text-xs text-muted-foreground mt-0.5">OBU Dormitory Management</p>
      </div>

      {/* Room card */}
      <Card className="glass border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-5 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Your Room</p>
              <h2 className="text-3xl font-bold text-foreground">BLK-A 402</h2>
              <p className="text-sm text-muted-foreground">Triple • Floor 4 • North Campus</p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <DoorOpen className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            {['AB', 'DM', 'TK'].map((init, i) => (
              <div key={i} className={cn('w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary-foreground gradient-primary', i > 0 && '-ml-2')}>
                {init}
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-1">3 occupants</span>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-success/10 border border-success/20 text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Active
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => navigate('/maintenance')} className="gradient-primary text-primary-foreground h-14 flex-col gap-1 shadow-glow">
          <Wrench className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Report Issue</span>
        </Button>
        <Button onClick={() => navigate('/room-changes')} variant="outline" className="glass border-primary/20 text-primary hover:bg-primary/10 h-14 flex-col gap-1">
          <ArrowRightLeft className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Room Change</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Requests', value: myMaint.length, icon: Wrench, color: 'text-warning' },
          { label: 'Changes', value: myChanges.length, icon: ArrowRightLeft, color: 'text-primary' },
          { label: 'Unread', value: unread, icon: Bell, color: 'text-destructive' },
        ].map(item => (
          <Card key={item.label} className="glass border-white/5">
            <CardContent className="p-3 text-center">
              <item.icon className={cn('w-5 h-5 mx-auto mb-1', item.color)} />
              <p className="text-xl font-bold text-foreground">{item.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active maintenance */}
      {activeMaint.length > 0 && (
        <Card className="glass border-warning/10">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Wrench className="w-4 h-4 text-warning" /> Active Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {activeMaint.slice(0, 3).map((req: any) => (
              <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-white/5">
                <div className={cn('w-2 h-2 rounded-full flex-shrink-0',
                  req.priority === 'High' ? 'bg-destructive animate-pulse' :
                  req.priority === 'Medium' ? 'bg-warning' : 'bg-success'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-primary">{req.requestId}</p>
                  <p className="text-xs text-foreground truncate">{req.description}</p>
                </div>
                <Badge variant="outline" className={cn('text-[9px] shrink-0',
                  req.status === 'In Progress' ? 'border-warning/30 text-warning' : 'border-primary/30 text-primary'
                )}>{req.status}</Badge>
              </div>
            ))}
            <Button variant="link" className="text-xs text-primary p-0 h-auto w-full justify-end" onClick={() => navigate('/maintenance')}>
              View all <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pending room change */}
      {pendingChange && (
        <Card className="glass border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Room Change Pending</p>
              <p className="text-xs text-muted-foreground capitalize">{pendingChange.reason} — awaiting review</p>
            </div>
            <Badge variant="outline" className="border-warning/30 text-warning text-[10px] shrink-0">Pending</Badge>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      <Card className="glass border-white/5">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Notifications
            {unread > 0 && <Badge className="ml-auto bg-primary text-primary-foreground text-[9px] px-1.5">{unread}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {notifs.slice(0, 3).map((n: any) => (
            <div key={n.id} className={cn('flex items-start gap-3 p-2.5 rounded-xl', !n.isRead && 'bg-primary/5 border border-primary/10')}>
              {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
              <div className="min-w-0">
                <p className={cn('text-xs font-semibold', n.isRead ? 'text-muted-foreground' : 'text-foreground')}>{n.title}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{n.message}</p>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full h-9 text-xs border-primary/20 text-primary hover:bg-primary/10" onClick={() => navigate('/notifications')}>
            View All
          </Button>
        </CardContent>
      </Card>

      <div className="p-3 rounded-xl bg-warning/5 border border-warning/15 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">Block A water maintenance scheduled tomorrow 14:00–16:00.</p>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary>({ totalStudents: 0, totalRooms: 0, occupancyRate: 0, pendingMaintenance: 0, availableBeds: 0 });
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [roomChanges, setRoomChanges] = useState<RoomChangeRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [summaryRes, maintenanceRes, roomChangesRes, notificationsRes, roomsRes] = await Promise.all([
        apiService.getDashboardSummary(),
        apiService.getMaintenanceRequests(),
        apiService.getPendingRoomChangeRequests(),
        apiService.getNotifications({ limit: 10, offset: 0 }),
        apiService.getRooms(),
      ]);

      if (!active) return;
      if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
      if (maintenanceRes.success && maintenanceRes.data?.requests) setMaintenance(maintenanceRes.data.requests);
      if (roomChangesRes.success && roomChangesRes.data?.requests) setRoomChanges(roomChangesRes.data.requests);
      if (notificationsRes.success && notificationsRes.data?.notifications) setNotifications(notificationsRes.data.notifications);
      if (roomsRes.success && roomsRes.data?.rooms) setRooms(roomsRes.data.rooms);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const unread = notifications.filter((n: any) => !n.isRead).length;
  const pendingMaint = maintenance.filter((m: any) => m.status === 'Submitted').length;
  const pendingChanges = roomChanges.filter((r: any) => r.status === 'pending').length;

  const pieData = [
    { name: 'Available', value: rooms.filter((r: any) => r.status === 'Available').length },
    { name: 'Occupied',  value: rooms.filter((r: any) => r.status === 'Occupied').length },
    { name: 'Maint.',    value: rooms.filter((r: any) => r.status === 'Under Maintenance').length },
  ];

  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Welcome, <span className="text-gradient">{user?.fullName?.split(' ')[0]}</span>
            </h1>
            <span className={cn('flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all',
              pulse ? 'border-emerald-400/50 text-emerald-400 bg-emerald-400/10' : 'border-emerald-400/30 text-emerald-400/60'
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
            {user?.role?.replace('_', ' ')} • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={() => navigate('/notifications')} variant="outline" className="relative h-9 w-9 p-0 border-border/30">
            <Bell className="w-4 h-4" />
            {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">{unread}</span>}
          </Button>
          <Button onClick={() => navigate('/reports')} variant="outline" className="h-9 text-sm border-primary/30 text-primary hover:bg-primary/10 hidden sm:flex">
            <BarChart3 className="w-4 h-4 mr-1" /> Reports
          </Button>
        </div>
      </div>

      {/* KPIs — 2 cols mobile, 4 desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Students" value={summary.totalStudents.toLocaleString()} icon={Users} trend={{ value: 5.2, positive: true }} />
        <StatCard title="Occupancy" value={`${summary.occupancyRate}%`} icon={BarChart3} trend={{ value: 2.1, positive: true }} />
        <StatCard title="Pending" value={pendingMaint + pendingChanges} icon={AlertTriangle} subtitle={`${pendingMaint} maint · ${pendingChanges} changes`} />
        <StatCard title="Avail. Beds" value={summary.availableBeds} icon={BedDouble} subtitle={`${rooms.length} rooms`} />
      </div>

      {/* Charts — stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Building Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={buildingData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.grid} vertical={false} />
                <XAxis dataKey="name" tick={T.tick} axisLine={false} tickLine={false} />
                <YAxis tick={T.tick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={T.tooltip} />
                <Bar dataKey="occupancy" fill="hsl(185,80%,50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Room Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none" paddingAngle={4}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={T.tooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 mt-1 flex-wrap">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-[10px] text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend chart */}
      <Card className="glass border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Semester Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(185,80%,50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(185,80%,50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38,92%,55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38,92%,55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.grid} />
              <XAxis dataKey="month" tick={T.tick} axisLine={false} tickLine={false} />
              <YAxis tick={T.tick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={T.tooltip} />
              <Area type="monotone" dataKey="occupancy" stroke="hsl(185,80%,50%)" fill="url(#g1)" strokeWidth={2} name="Occupancy %" />
              <Area type="monotone" dataKey="requests" stroke="hsl(38,92%,55%)" fill="url(#g2)" strokeWidth={2} name="Maintenance" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom row — pending + recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pending approvals */}
        {pendingChanges > 0 && (
          <Card className="glass border-warning/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" /> Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {roomChanges.filter((r: any) => r.status === 'pending').slice(0, 3).map((req: any) => (
                <div key={req.id} className="p-3 rounded-xl bg-warning/5 border border-warning/10 cursor-pointer hover:bg-warning/10 transition-all" onClick={() => navigate('/room-changes')}>
                  <p className="text-xs font-semibold text-foreground">{req.student?.fullName}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{req.reason} • {req.currentRoom?.roomId}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full h-8 text-xs border-warning/20 text-warning hover:bg-warning/10" onClick={() => navigate('/room-changes')}>
                Review All
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent maintenance */}
        <Card className="glass border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" /> Recent Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {maintenance.slice(0, 4).map((req: any) => (
              <div key={req.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer border border-white/5" onClick={() => navigate('/maintenance')}>
                <div className={cn('w-2 h-2 rounded-full flex-shrink-0',
                  req.priority === 'High' ? 'bg-destructive animate-pulse' :
                  req.priority === 'Medium' ? 'bg-warning' : 'bg-success'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-primary">{req.requestId}</p>
                  <p className="text-xs text-foreground truncate">{req.description}</p>
                </div>
                <Badge variant="outline" className={cn('text-[8px] shrink-0',
                  req.status === 'Completed' ? 'border-success/30 text-success' :
                  req.status === 'In Progress' ? 'border-warning/30 text-warning' :
                  'border-primary/30 text-primary'
                )}>{req.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Telemetry */}
      <Card className="glass border-primary/10">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-foreground">System Status</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'API Latency', value: '4ms' },
              { label: 'DB Sync', value: 'LIVE' },
              { label: 'Auth', value: 'ACTIVE' },
            ].map(item => (
              <div key={item.label} className="text-center p-2 rounded-lg bg-secondary/30 border border-white/5">
                <p className="text-xs font-mono font-bold text-emerald-400">{item.value}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
// export default function DashboardPage() {
//   const { user } = useAuth();
//   return user?.role === 'student' ? <StudentDashboard /> : <AdminDashboard />;
// }
// Line 475-477
export default function DashboardPage() {
  const { hasRole } = useAuth();  // ← Use hasRole instead of user?.role
  return hasRole(['student']) ? <StudentDashboard /> : <AdminDashboard />;
}
