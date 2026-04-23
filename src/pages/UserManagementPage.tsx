import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiService } from '@/lib/api';
import { Plus, Search, Shield, Edit, Trash2, RefreshCw, Copy, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type UiRole = 'student' | 'dorm_admin' | 'maintenance' | 'management' | 'system_admin';
type UiStatus = 'active' | 'inactive';

type UserRow = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UiRole;
  status: UiStatus;
  lastLogin?: string;
  studentId?: string;
};

type UserForm = {
  fullName: string;
  email: string;
  role: UiRole;
  studentId: string;
  tempPassword: boolean;
};

const toUiRole = (role?: string): UiRole => {
  const value = String(role || '').trim().toLowerCase().replace(/\s+/g, '_');
  const map: Record<string, UiRole> = {
    student: 'student',
    dorm_admin: 'dorm_admin',
    maintenance_staff: 'maintenance',
    maintenance: 'maintenance',
    management: 'management',
    system_admin: 'system_admin',
  };
  return map[value] || 'student';
};

const toApiRole = (role: UiRole): string => {
  const map: Record<UiRole, string> = {
    student: 'Student',
    dorm_admin: 'Dorm Admin',
    maintenance: 'Maintenance Staff',
    management: 'Management',
    system_admin: 'System Admin',
  };
  return map[role];
};

const toUiStatus = (status?: string): UiStatus => (String(status || '').toLowerCase() === 'inactive' ? 'inactive' : 'active');

const roleColors: Record<UiRole, string> = {
  system_admin: 'border-destructive/30 text-destructive',
  dorm_admin: 'border-primary/30 text-primary',
  maintenance: 'border-warning/30 text-warning',
  management: 'border-info/30 text-info',
  student: 'border-success/30 text-success',
};

const roleLabels: Record<UiRole, string> = {
  student: 'Student',
  dorm_admin: 'Dorm Admin',
  maintenance: 'Maintenance',
  management: 'Management',
  system_admin: 'System Admin',
};

const defaultForm: UserForm = {
  fullName: '',
  email: '',
  role: 'dorm_admin',
  studentId: '',
  tempPassword: true,
};

const mapUser = (user: {
  id?: string;
  _id?: string;
  fullName?: string;
  username?: string;
  email?: string;
  role?: string;
  status?: string;
  lastLogin?: string;
  studentId?: string;
}): UserRow => ({
  id: user.id || user._id || '',
  fullName: user.fullName || '',
  username: user.username || '',
  email: user.email || '',
  role: toUiRole(user.role),
  status: toUiStatus(user.status),
  lastLogin: user.lastLogin,
  studentId: user.studentId,
});

const UserManagementPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [formData, setFormData] = useState<UserForm>(defaultForm);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [editPasswordUser, setEditPasswordUser] = useState<UserRow | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const params: { role?: string; status?: string; search?: string } = {};
    if (roleFilter !== 'all') params.role = toApiRole(roleFilter as UiRole);
    if (statusFilter !== 'all') params.status = statusFilter === 'active' ? 'Active' : 'Inactive';
    if (search.trim()) params.search = search.trim();

    const result = await apiService.getUsers(params);
    if (result.success && result.data?.users) {
      setUsers(result.data.users.map((u) => mapUser(u as unknown as Parameters<typeof mapUser>[0])));
      setLoading(false);
      return;
    }

    setUsers([]);
    setLoading(false);
  }, [roleFilter, search, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search && !u.fullName.toLowerCase().includes(search.toLowerCase()) && !u.username.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const resetModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData(defaultForm);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const result = await apiService.updateUser(editingUser.id, {
        fullName: formData.fullName,
        email: formData.email,
        role: toApiRole(formData.role),
        studentId: formData.studentId || undefined,
      });

      if (result.success) {
        toast.success('User updated successfully');
        await loadUsers();
        resetModal();
        return;
      }

      toast.error(result.error || 'Failed to update user');
      return;
    }

    const result = await apiService.createUser({
      fullName: formData.fullName,
      email: formData.email,
      role: toApiRole(formData.role),
      studentId: formData.studentId || undefined,
      tempPassword: formData.tempPassword,
    });

    if (result.success && result.data) {
      if (result.data.password) {
        setGeneratedPassword(result.data.password);
        setShowPasswordModal(true);
      } else {
        toast.success('User created successfully');
      }
      await loadUsers();
      resetModal();
      return;
    }

    toast.error(result.error || 'Failed to create user');
  };

  const handleDeactivate = async (id: string) => {
    const result = await apiService.deactivateUser(id);
    if (result.success) {
      toast.success('User deactivated successfully');
      await loadUsers();
      return;
    }

    toast.error(result.error || 'Failed to deactivate user');
  };

  const handleReactivate = async (id: string) => {
    const result = await apiService.reactivateUser(id);
    if (result.success) {
      toast.success('User reactivated successfully');
      await loadUsers();
      return;
    }

    toast.error(result.error || 'Failed to reactivate user');
  };

  const handleResetPassword = async (id: string) => {
    const result = await apiService.resetUserPassword(id);
    if (result.success) {
      if (result.data?.password) {
        setGeneratedPassword(result.data.password);
        setShowPasswordModal(true);
      } else {
        toast.success(result.data?.message || 'Password reset initiated');
      }
      return;
    }

    toast.error(result.error || 'Failed to reset password');
  };

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
            <Shield className="w-6 h-6 text-primary" /> User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 text-sm" onClick={loadUsers}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button className="gradient-primary text-primary-foreground h-9 text-sm" onClick={() => { setEditingUser(null); setFormData(defaultForm); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add User
          </Button>
        </div>
      </div>

      <Card className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary/30 border-border/30 h-9 text-sm" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 bg-secondary/30 border-border/30 h-9 text-sm">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="dorm_admin">Dorm Admin</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="system_admin">System Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-secondary/30 border-border/30 h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Username</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Last Login</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {u.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm font-mono text-muted-foreground">{u.username}</td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className={cn('text-[10px]', roleColors[u.role])}>
                      {roleLabels[u.role]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className={cn('text-[10px]', u.status === 'active' ? 'border-success/30 text-success' : 'border-destructive/30 text-destructive')}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                        onClick={() => {
                          setEditingUser(u);
                          setFormData({
                            fullName: u.fullName,
                            email: u.email,
                            role: u.role,
                            studentId: u.studentId || '',
                            tempPassword: false,
                          });
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {u.status === 'active' ? (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-warning hover:bg-warning/10" onClick={() => handleDeactivate(u.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-success hover:bg-success/10" onClick={() => handleReactivate(u.id)}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted/10"
                        onClick={() => {
                          setEditPasswordUser(u);
                          setIsEditPasswordOpen(true);
                        }}
                        title="Reset password"
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Full Name</Label>
              <Input value={formData.fullName} onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))} required className="bg-secondary/40 border-white/5" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required className="bg-secondary/40 border-white/5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData((prev) => ({ ...prev, role: val as UiRole }))}>
                  <SelectTrigger className="bg-secondary/40 border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="dorm_admin">Dorm Admin</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="system_admin">System Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Student ID (Optional)</Label>
                <Input value={formData.studentId} onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value }))} className="bg-secondary/40 border-white/5" />
              </div>
            </div>
            {!editingUser && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tempPassword"
                  checked={formData.tempPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tempPassword: e.target.checked }))}
                  className="rounded border-border/30 bg-secondary/30"
                />
                <Label htmlFor="tempPassword" className="text-sm text-muted-foreground">Generate temporary password</Label>
              </div>
            )}
            <DialogFooter className="pt-4">
              <Button type="submit" className="gradient-primary text-primary-foreground">Save User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Display Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="glass border-success/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" /> Temporary Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Share this password with the user. They should change it on first login.</p>
            <div className="bg-secondary/30 border border-success/20 rounded-lg p-4">
              <div className="flex items-center justify-between gap-3">
                <code className={cn(
                  'flex-1 font-mono text-lg font-bold tracking-wider',
                  showPasswordText ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {showPasswordText ? generatedPassword : '••••••••'}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                >
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                    toast.success('Password copied to clipboard');
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 text-xs text-warning">
              ⚠️ This password will not be shown again. Make sure to save it or share it with the user immediately.
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="gradient-primary text-primary-foreground"
              onClick={() => {
                setShowPasswordModal(false);
                setGeneratedPassword('');
                setShowPasswordText(false);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Password Modal */}
      <Dialog open={isEditPasswordOpen} onOpenChange={setIsEditPasswordOpen}>
        <DialogContent className="glass border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-secondary/30 border border-white/5">
              <p className="text-xs text-muted-foreground mb-1">User</p>
              <p className="font-semibold text-sm">{editPasswordUser?.fullName}</p>
              <p className="text-xs text-muted-foreground">{editPasswordUser?.email}</p>
            </div>
            <p className="text-sm text-muted-foreground">A new temporary password will be generated and displayed. The user should change it on first login.</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditPasswordOpen(false);
                setEditPasswordUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="gradient-primary text-primary-foreground"
              onClick={async () => {
                if (!editPasswordUser) return;
                await handleResetPassword(editPasswordUser.id);
                setIsEditPasswordOpen(false);
                setEditPasswordUser(null);
              }}
            >
              Generate New Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
