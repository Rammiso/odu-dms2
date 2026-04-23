import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiService } from '@/lib/api';
import type { Room } from '@/types/api';
import { DoorOpen, Search, Filter, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type DormOption = { id: string; name: string; code: string };

type RoomRow = {
  id: string;
  dormId?: string;
  building: string;
  floor: number;
  roomNumber: string;
  type: 'Single' | 'Double' | 'Triple';
  capacity: number;
  currentOccupancy: number;
  status: 'Available' | 'Occupied' | 'Under Maintenance';
  genderRestriction: 'Male' | 'Female' | 'None';
};

const fromBackendStatus = (status?: string, occupancy = 0, capacity = 0): RoomRow['status'] => {
  if (status === 'Maintenance') return 'Under Maintenance';
  if (status === 'Full') return 'Occupied';
  if (occupancy >= capacity && capacity > 0) return 'Occupied';
  return 'Available';
};

type BackendRoom = Partial<Room> & {
  id?: string;
  _id?: string;
  dormId?: { id?: string; _id?: string; name?: string } | string;
};

type BackendDorm = {
  id?: string;
  _id?: string;
  name: string;
  code: string;
};

type CreateRoomPayload = Partial<Room> & {
  buildingId: string;
};

const toBackendStatus = (status: RoomRow['status']): Room['status'] => {
  if (status === 'Under Maintenance') return 'Maintenance';
  if (status === 'Occupied') return 'Full';
  return 'Available';
};

const getDormId = (dorm: BackendRoom['dormId']): string | undefined => {
  if (!dorm) return undefined;
  if (typeof dorm === 'string') return dorm;
  return dorm.id || dorm._id;
};

const getDormName = (dorm: BackendRoom['dormId']): string | undefined => {
  if (!dorm || typeof dorm === 'string') return undefined;
  return dorm.name;
};

const mapRoom = (room: BackendRoom): RoomRow => ({
  id: room.id || room._id,
  dormId: getDormId(room.dormId),
  building: getDormName(room.dormId) || room.building || 'Unknown',
  floor: Number(room.floor || 1),
  roomNumber: String(room.roomNumber || ''),
  type: room.type || 'Double',
  capacity: Number(room.capacity || 0),
  currentOccupancy: Number(room.currentOccupancy || 0),
  status: fromBackendStatus(room.status, Number(room.currentOccupancy || 0), Number(room.capacity || 0)),
  genderRestriction: room.genderRestriction || 'None',
});

const RoomsPage = () => {
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [dorms, setDorms] = useState<DormOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomRow | null>(null);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [buildingForm, setBuildingForm] = useState({ name: '', code: '' });
  const [savingBuilding, setSavingBuilding] = useState(false);

  const [formData, setFormData] = useState({
    dormId: '',
    floor: 1,
    roomNumber: '',
    type: 'Double' as 'Single' | 'Double' | 'Triple',
    capacity: 4,
    status: 'Available' as RoomRow['status'],
    genderRestriction: 'Male' as RoomRow['genderRestriction'],
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [roomsRes, dormsRes] = await Promise.all([apiService.getRooms(), apiService.getDorms()]);

    if (roomsRes.success && roomsRes.data?.rooms) {
      setRooms((roomsRes.data.rooms as BackendRoom[]).map(mapRoom));
    }

    if (dormsRes.success && dormsRes.data?.buildings) {
      const options = (dormsRes.data.buildings as BackendDorm[]).map((d) => ({
        id: d.id || d._id,
        name: d.name,
        code: d.code,
      }));
      setDorms(options);

      setFormData((prev) => {
        if (prev.dormId || options.length === 0) return prev;
        return { ...prev, dormId: options[0].id };
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      const roomCode = `${r.building}-${r.roomNumber}`.toLowerCase();
      if (search && !roomCode.includes(search.toLowerCase())) return false;
      if (buildingFilter !== 'all' && r.building !== buildingFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [rooms, search, buildingFilter, statusFilter]);

  const handleSaveBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBuilding(true);
    const code = buildingForm.code || buildingForm.name.toUpperCase().replace(/\s+/g, '_').slice(0, 20);
    const result = await apiService.createDorm({ name: buildingForm.name, code });
    setSavingBuilding(false);

    if (result.success && result.data) {
      const newDorm = result.data as BackendDorm;
      const newOption = { id: newDorm.id || newDorm._id || '', name: newDorm.name, code: newDorm.code };
      setDorms((prev) => [...prev, newOption]);
      setFormData((prev) => ({ ...prev, dormId: newOption.id }));
      setBuildingForm({ name: '', code: '' });
      setIsBuildingModalOpen(false);
      toast.success(`Building "${newDorm.name}" created`);
      return;
    }

    toast.error(result.error || 'Failed to create building');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dormId) {
      toast.error('Please select a building');
      return;
    }

    if (editingRoom) {
      const result = await apiService.updateRoom(editingRoom.id, {
        type: formData.type,
        capacity: formData.capacity,
        status: toBackendStatus(formData.status),
        genderRestriction: formData.genderRestriction,
      });

      if (result.success) {
        toast.success('Room updated successfully');
        await loadData();
        setIsModalOpen(false);
        setEditingRoom(null);
        return;
      }

      toast.error(result.error || 'Failed to update room');
      return;
    }

    const payload: CreateRoomPayload = {
      buildingId: formData.dormId,
      floor: formData.floor,
      roomNumber: formData.roomNumber,
      type: formData.type,
      capacity: formData.capacity,
      genderRestriction: formData.genderRestriction,
    };

    const result = await apiService.createRoom(payload);

    if (result.success) {
      toast.success('Room created successfully');
      await loadData();
      setIsModalOpen(false);
      setEditingRoom(null);
      setFormData({
        dormId: dorms[0]?.id || '',
        floor: 1,
        roomNumber: '',
        type: 'Double',
        capacity: 4,
        status: 'Available',
        genderRestriction: 'Male',
      });
      return;
    }

    toast.error(result.error || 'Failed to create room');
  };

  const handleDisableRoom = async (room: RoomRow) => {
    const result = await apiService.updateRoom(room.id, { status: 'Maintenance' });
    if (result.success) {
      toast.success('Room set to maintenance');
      await loadData();
      return;
    }
    toast.error(result.error || 'Failed to update room status');
  };

  const buildings = Array.from(new Set(rooms.map((r) => r.building))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-primary" /> Room Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{rooms.length} rooms across {dorms.length} dorm buildings</p>
        </div>
        <Button className="gradient-primary text-primary-foreground h-9 text-sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Room
        </Button>
      </div>

      <Card className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary/30 border-border/30 h-9 text-sm" />
          </div>
          <Select value={buildingFilter} onValueChange={setBuildingFilter}>
            <SelectTrigger className="w-48 bg-secondary/30 border-border/30 h-9 text-sm">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Building" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              {buildings.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-secondary/30 border-border/30 h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Occupied">Occupied</SelectItem>
              <SelectItem value="Under Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((room) => (
          <Card key={room.id} className="glass rounded-xl p-4 hover:shadow-glow transition-all duration-300 group animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">{room.building} {room.roomNumber}</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
                  onClick={() => {
                    setEditingRoom(room);
                    setFormData({
                      dormId: room.dormId || '',
                      floor: room.floor,
                      roomNumber: room.roomNumber,
                      type: room.type,
                      capacity: room.capacity,
                      status: room.status,
                      genderRestriction: room.genderRestriction,
                    });
                    setIsModalOpen(true);
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDisableRoom(room)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Floor</span>
                <span className="text-foreground">{room.floor}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground">{room.type}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Gender</span>
                <span className="text-foreground">{room.genderRestriction}</span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="text-foreground">{room.currentOccupancy}/{room.capacity}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      room.currentOccupancy >= room.capacity
                        ? 'bg-destructive'
                        : room.currentOccupancy === 0
                        ? 'bg-success'
                        : 'bg-primary'
                    )}
                    style={{ width: `${Math.min(100, (room.currentOccupancy / room.capacity) * 100)}%` }}
                  />
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'mt-2 text-[10px]',
                    room.status === 'Available'
                      ? 'border-success/30 text-success'
                      : room.status === 'Occupied'
                      ? 'border-warning/30 text-warning'
                      : 'border-destructive/30 text-destructive'
                  )}
                >
                  {room.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingRoom(null);
          }
        }}
      >        <DialogContent className="glass border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Building</Label>
              <div className="flex gap-2">
                <Select value={formData.dormId} onValueChange={(val) => setFormData({ ...formData, dormId: val })}>
                  <SelectTrigger className="bg-secondary/40 border-white/5 flex-1">
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {dorms.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary/10 px-3"
                  onClick={() => setIsBuildingModalOpen(true)}
                  title="Add new building"
                >
                  <Building2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Floor</Label>
                <Input type="number" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })} className="bg-secondary/40 border-white/5" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Room Number</Label>
                <Input value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} className="bg-secondary/40 border-white/5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Type</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as RoomRow['type'] })}>
                  <SelectTrigger className="bg-secondary/40 border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Double">Double</SelectItem>
                    <SelectItem value="Triple">Triple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Capacity</Label>
                <Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} className="bg-secondary/40 border-white/5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as RoomRow['status'] })}>
                  <SelectTrigger className="bg-secondary/40 border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Gender Restriction</Label>
                <Select value={formData.genderRestriction} onValueChange={(val) => setFormData({ ...formData, genderRestriction: val as RoomRow['genderRestriction'] })}>
                  <SelectTrigger className="bg-secondary/40 border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="gradient-primary text-primary-foreground">Save Room</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Building Dialog */}
      <Dialog open={isBuildingModalOpen} onOpenChange={setIsBuildingModalOpen}>
        <DialogContent className="glass border-primary/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Add New Building
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveBuilding} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Building Name</Label>
              <Input
                placeholder="e.g. Block A, North Wing"
                value={buildingForm.name}
                onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                required
                className="bg-secondary/40 border-white/5"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Code (optional)</Label>
              <Input
                placeholder="e.g. BLK-A (auto-generated if empty)"
                value={buildingForm.code}
                onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value.toUpperCase() })}
                className="bg-secondary/40 border-white/5"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsBuildingModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground" disabled={savingBuilding}>
                {savingBuilding ? 'Saving...' : 'Add Building'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomsPage;
