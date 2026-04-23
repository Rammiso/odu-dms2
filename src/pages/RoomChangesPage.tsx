import { useEffect, useState } from 'react';
import { ArrowRightLeft, CheckCircle2, XCircle, Clock, Plus, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

const REASON_LABELS: Record<string, string> = {
  conflict: 'Roommate Conflict',
  maintenance: 'Maintenance Issues',
  health: 'Health Concerns',
  other: 'Other',
};

const RoomChangesPage = () => {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(['dorm_admin', 'system_admin', 'management']);

  const [requests, setRequests] = useState<any[]>([]);
  const [hasAssignment, setHasAssignment] = useState<boolean | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);

  const [newForm, setNewForm] = useState({ reason: 'conflict', description: '' });
  const [approveForm, setApproveForm] = useState({ newRoomId: '' });
  const [rejectForm, setRejectForm] = useState({ rejectionReason: '' });

  const [availableRooms, setAvailableRooms] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [requestsResult, roomsResult] = await Promise.all([
        isAdmin ? apiService.getPendingRoomChangeRequests() : apiService.getMyRoomChangeRequests(),
        apiService.getAvailableRooms(),
      ]);

      if (requestsResult.success && requestsResult.data?.requests) {
        setRequests(requestsResult.data.requests as any[]);
      }
      if (roomsResult.success && roomsResult.data?.rooms) {
        setAvailableRooms(roomsResult.data.rooms as any[]);
      }

      if (!isAdmin) {
        const assignmentRes = await apiService.getStudentAssignment();
        setHasAssignment(!!(assignmentRes.success && assignmentRes.data));
      }
    };

    load();
  }, [isAdmin]);

  const filtered = statusFilter === 'all' ? requests : requests.filter(r => r.status === statusFilter);

  const refresh = async () => {
    const result = isAdmin ? await apiService.getPendingRoomChangeRequests() : await apiService.getMyRoomChangeRequests();
    if (result.success && result.data?.requests) {
      setRequests(result.data.requests as any[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.description.trim()) {
      toast.error('Please provide a description.');
      return;
    }
    const result = await apiService.submitRoomChangeRequest(newForm);
    if (result.success) {
      toast.success('Room change request submitted successfully.');
      setIsNewOpen(false);
      setNewForm({ reason: 'conflict', description: '' });
      await refresh();
      return;
    }

    toast.error(result.error || 'Failed to submit request.');
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveForm.newRoomId) { toast.error('Please select a new room.'); return; }
    const result = await apiService.approveRoomChange(selectedReq.id, approveForm.newRoomId);
    if (result.success) {
      toast.success('Room change approved.');
      setIsApproveOpen(false);
      setApproveForm({ newRoomId: '' });
      await refresh();
      return;
    }

    toast.error(result.error || 'Failed to approve request.');
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectForm.rejectionReason.trim()) { toast.error('Please provide a rejection reason.'); return; }
    const result = await apiService.rejectRoomChange(selectedReq.id, rejectForm.rejectionReason);
    if (result.success) {
      toast.success('Room change rejected.');
      setIsRejectOpen(false);
      setRejectForm({ rejectionReason: '' });
      await refresh();
      return;
    }

    toast.error(result.error || 'Failed to reject request.');
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-primary" /> Room Changes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin
              ? `${pendingCount} pending request${pendingCount !== 1 ? 's' : ''} awaiting review`
              : 'Track your room change requests'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-secondary/30 border-border/30 h-9 text-sm">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          {!isAdmin && (
            <Button
              className="gradient-primary text-primary-foreground h-9 text-sm shadow-glow"
              onClick={() => {
                if (!hasAssignment) {
                  toast.error('You need an active room assignment before requesting a change.');
                  return;
                }
                setIsNewOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> Request Change
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="glass rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowRightLeft className="w-12 h-12 text-muted-foreground/30 mb-4" />
            {!isAdmin && hasAssignment === false ? (
              <>
                <p className="text-muted-foreground text-sm font-medium">No room assigned yet</p>
                <p className="text-muted-foreground/60 text-xs mt-1">You can request a room change once an admin assigns you a room.</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-sm">No room change requests found.</p>
                {!isAdmin && (
                  <Button className="mt-4 gradient-primary text-primary-foreground" onClick={() => setIsNewOpen(true)}>
                    Submit your first request
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <Card key={req.id} className="glass rounded-xl hover:shadow-glow transition-all animate-slide-up">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      req.status === 'approved' ? 'bg-success/10' :
                      req.status === 'rejected' ? 'bg-destructive/10' : 'bg-warning/10'
                    )}>
                      {req.status === 'approved' ? <CheckCircle2 className="w-5 h-5 text-success" /> :
                       req.status === 'rejected' ? <XCircle className="w-5 h-5 text-destructive" /> :
                       <Clock className="w-5 h-5 text-warning animate-pulse" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-foreground">{req.student?.fullName}</p>
                        <Badge variant="outline" className={cn('text-[10px]',
                          req.status === 'approved' ? 'border-success/30 text-success' :
                          req.status === 'rejected' ? 'border-destructive/30 text-destructive' :
                          'border-warning/30 text-warning'
                        )}>{req.status}</Badge>
                        <Badge variant="outline" className="text-[10px] border-border/30 text-muted-foreground capitalize">
                          {REASON_LABELS[req.reason] || req.reason}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs mb-2">
                        <span className="bg-secondary/50 px-2 py-0.5 rounded font-mono text-foreground">{req.currentRoom?.roomId}</span>
                        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                        {req.status === 'approved' && req.requestedRoom ? (
                          <span className="bg-success/10 px-2 py-0.5 rounded font-mono text-success">{req.requestedRoom.roomId}</span>
                        ) : req.status === 'pending' ? (
                          <span className="text-muted-foreground italic">Awaiting assignment</span>
                        ) : (
                          <span className="text-destructive text-xs">Rejected</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{req.description}</p>
                      {req.rejectionReason && (
                        <p className="text-xs text-destructive mt-1 bg-destructive/5 px-2 py-1 rounded border border-destructive/10">
                          Reason: {req.rejectionReason}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                        {new Date(req.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {isAdmin && req.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="h-8 text-xs border-success/30 text-success hover:bg-success/10"
                        onClick={() => { setSelectedReq(req); setIsApproveOpen(true); }}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => { setSelectedReq(req); setIsRejectOpen(true); }}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="glass border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" /> Request Room Change
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Reason</Label>
              <Select value={newForm.reason} onValueChange={v => setNewForm({ ...newForm, reason: v })}>
                <SelectTrigger className="bg-secondary/40 border-white/5 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conflict">Roommate Conflict</SelectItem>
                  <SelectItem value="maintenance">Maintenance Issues</SelectItem>
                  <SelectItem value="health">Health Concerns</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Description</Label>
              <Textarea
                placeholder="Describe your situation in detail..."
                value={newForm.description}
                onChange={e => setNewForm({ ...newForm, description: e.target.value })}
                className="bg-secondary/40 border-white/5 min-h-[100px] resize-none"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="glass border-success/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" /> Approve Room Change
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApprove} className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 text-sm">
              <p className="text-muted-foreground text-xs mb-1">Student</p>
              <p className="font-semibold">{selectedReq?.student?.fullName}</p>
              <p className="text-xs text-muted-foreground mt-1">{selectedReq?.description}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Assign New Room</Label>
              <Select value={approveForm.newRoomId} onValueChange={v => setApproveForm({ newRoomId: v })}>
                <SelectTrigger className="bg-secondary/40 border-white/5 h-11">
                  <SelectValue placeholder="Select available room..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((r: any) => (
                    <SelectItem key={r.roomId} value={r.roomId}>
                      {r.roomId} — {r.building} Fl.{r.floor} ({r.genderRestriction})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsApproveOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-success text-white hover:bg-success/90">Confirm Approval</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="glass border-destructive/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" /> Reject Room Change
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 text-sm">
              <p className="font-semibold">{selectedReq?.student?.fullName}</p>
              <p className="text-xs text-muted-foreground mt-1">{selectedReq?.description}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Rejection Reason</Label>
              <Textarea
                placeholder="Explain why this request is being rejected..."
                value={rejectForm.rejectionReason}
                onChange={e => setRejectForm({ rejectionReason: e.target.value })}
                className="bg-secondary/40 border-white/5 min-h-[80px] resize-none"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive">Confirm Rejection</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomChangesPage;
