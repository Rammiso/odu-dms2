import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Wrench, Search, Plus, Camera, Send, AlertCircle, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiService } from '@/lib/api';
import type { MaintenanceRequest } from '@/types/api';

const MaintenancePage = () => {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(['dorm_admin', 'system_admin']);
  const isMaint = hasRole(['maintenance']);
const isStudent = hasRole(['student']);  // ← ADD THIS LINE
  const [requests, setRequests] = useState<any[]>(() => {
    return [];
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);

  const [newForm, setNewForm] = useState({ roomId: '', category: '', priority: '', description: '', imagePreview: '' });
  const [statusForm, setStatusForm] = useState({ status: '', resolutionNotes: '' });

  const refresh = async () => {
  let result;
  
  if (isMaint) {
    // Maintenance staff - see assigned tasks
    result = await apiService.getMyMaintenanceTasks();
  } else if (isStudent) {
    // Students - see only their own requests
    result = await apiService.getStudentMaintenanceRequests(10, 0);
  } else {
    // Admins/Management - see all requests
    result = await apiService.getMaintenanceRequests({});
  }

  if (result.success && result.data) {
    setRequests((result.data as any).requests || (result.data as any).tasks || []);
  }
};

  useEffect(() => {
    refresh();
  }, [user?.role]);

  const filtered = requests.filter(r => {
    if (search && !r.description?.toLowerCase().includes(search.toLowerCase()) && !r.requestId?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.category || !newForm.priority || !newForm.description || !newForm.roomId) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const result = await apiService.submitMaintenanceRequest({
      roomId: newForm.roomId,
      category: newForm.category,
      description: newForm.description,
      priority: newForm.priority,
    });

    if (result.success) {
      toast.success('Request submitted successfully.');
      setIsNewOpen(false);
      setNewForm({ roomId: '', category: '', priority: '', description: '', imagePreview: '' });
      await refresh();
      return;
    }

    toast.error(result.error || 'Failed to submit request.');
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusForm.status) { toast.error('Select a status.'); return; }
    const result = await apiService.updateMaintenanceStatus(selectedReq.id, statusForm.status, statusForm.resolutionNotes);
    if (result.success) {
      toast.success('Status updated.');
      setIsStatusOpen(false);
      setStatusForm({ status: '', resolutionNotes: '' });
      await refresh();
      return;
    }

    toast.error(result.error || 'Failed to update status.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewForm(f => ({ ...f, imagePreview: reader.result as string }));
      reader.readAsDataURL(file);
      toast.info('Image attached.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" /> Maintenance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} request{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setIsNewOpen(true)} className="gradient-primary text-primary-foreground h-10 shadow-glow">
          <Plus className="w-4 h-4 mr-2" /> New Request
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary/30 border-border/30 h-9 text-sm" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-secondary/30 border-border/30 h-9 text-sm">
              <Filter className="w-3 h-3 mr-1" /><SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36 bg-secondary/30 border-border/30 h-9 text-sm">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="glass rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wrench className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">No maintenance requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <Card key={req.id} className="glass rounded-xl hover:border-primary/30 hover:shadow-glow transition-all animate-slide-up relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-start gap-4">
                  <div className={cn('w-3 h-3 rounded-full mt-1.5 flex-shrink-0',
                    req.priority === 'High' ? 'bg-destructive animate-pulse' :
                    req.priority === 'Medium' ? 'bg-warning' : 'bg-success'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">{req.requestId}</span>
                      <Badge variant="outline" className={cn('text-[8px] font-bold uppercase',
                        req.status === 'Completed' ? 'border-success/30 text-success bg-success/5' :
                        req.status === 'In Progress' ? 'border-warning/30 text-warning bg-warning/5' :
                        req.status === 'Rejected' ? 'border-destructive/30 text-destructive bg-destructive/5' :
                        'border-primary/30 text-primary bg-primary/5'
                      )}>{req.status}</Badge>
                      <Badge variant="outline" className="text-[8px] font-bold uppercase border-border/30 text-muted-foreground">{req.category}</Badge>
                      <Badge variant="outline" className={cn('text-[8px] font-bold uppercase',
                        req.priority === 'High' ? 'border-destructive/30 text-destructive' :
                        req.priority === 'Medium' ? 'border-warning/30 text-warning' :
                        'border-success/30 text-success'
                      )}>{req.priority}</Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-2">{req.description}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground font-mono uppercase">
                      <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {req.room?.roomId}</span>
                      <span>👤 {req.submittedBy?.fullName?.split(' ')[0]}</span>
                      <span>🕐 {new Date(req.submittedAt).toLocaleDateString()}</span>
                      <span className="text-primary">#{req.trackingNumber}</span>
                    </div>
                    {req.resolutionNotes && (
                      <div className="mt-2 p-2 rounded-lg bg-success/5 border border-success/10">
                        <p className="text-[11px] text-success">✓ {req.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                  {(isAdmin || isMaint) && req.status !== 'Completed' && req.status !== 'Rejected' && (
                    <Button size="sm" variant="outline" className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10 flex-shrink-0"
                      onClick={() => { setSelectedReq(req); setStatusForm({ status: req.status, resolutionNotes: req.resolutionNotes || '' }); setIsStatusOpen(true); }}>
                      Update
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="glass border-primary/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" /> New Maintenance Request
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Room ID *</Label>
                <Input value={newForm.roomId} onChange={e => setNewForm(f => ({ ...f, roomId: e.target.value }))} placeholder="e.g. BLK-A-402" className="bg-secondary/40 border-white/5" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Category *</Label>
                <Select value={newForm.category} onValueChange={v => setNewForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="bg-secondary/40 border-white/5"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {['Plumbing', 'Electrical', 'Furniture', 'Sanitation', 'Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Priority *</Label>
              <div className="grid grid-cols-3 gap-2">
                {['Low', 'Medium', 'High'].map(p => (
                  <button key={p} type="button" onClick={() => setNewForm(f => ({ ...f, priority: p }))}
                    className={cn('py-2 rounded-xl text-xs font-bold border transition-all',
                      newForm.priority === p ? 'bg-primary/20 border-primary text-primary shadow-glow' : 'bg-secondary/40 border-white/5 text-muted-foreground hover:bg-secondary/60'
                    )}>{p}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Description *</Label>
              <Textarea value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the issue in detail..." className="bg-secondary/40 border-white/5 min-h-[90px] resize-none" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Photo (optional)</Label>
              <div className={cn('w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all',
                newForm.imagePreview ? 'border-primary/40 bg-primary/5' : 'border-white/10 bg-secondary/20 hover:border-primary/20'
              )} onClick={() => document.getElementById('maint-img')?.click()}>
                {newForm.imagePreview
                  ? <img src={newForm.imagePreview} alt="preview" className="h-full object-contain rounded-lg" />
                  : <><Camera className="w-6 h-6 text-primary/40 mb-1" /><span className="text-[10px] text-muted-foreground uppercase tracking-widest">Attach Image</span></>
                }
              </div>
              <input id="maint-img" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">
                <Send className="w-4 h-4 mr-1" /> Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="glass border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Update Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStatusUpdate} className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 text-sm">
              <p className="font-mono text-primary text-xs">{selectedReq?.requestId}</p>
              <p className="text-foreground mt-1">{selectedReq?.description}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">New Status</Label>
              <Select value={statusForm.status} onValueChange={v => setStatusForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="bg-secondary/40 border-white/5"><SelectValue placeholder="Select status..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Resolution Notes</Label>
              <Textarea value={statusForm.resolutionNotes} onChange={e => setStatusForm(f => ({ ...f, resolutionNotes: e.target.value }))} className="bg-secondary/40 border-white/5 min-h-[70px] resize-none" placeholder="Optional notes..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStatusOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">Save Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenancePage;
