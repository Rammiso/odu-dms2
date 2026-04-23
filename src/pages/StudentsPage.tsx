import { useEffect, useMemo, useState } from 'react';
import { apiService } from '@/lib/api';
import { Users, Search, GraduationCap, Plus, Filter, Download, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type StudentRow = {
  id?: string;
  studentId: string;
  fullName: string;
  gender: 'M' | 'F';
  department: string;
  year: number;
  phone: string;
  email: string;
};

const StudentsPage = () => {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [unassigned, setUnassigned] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRunningAllocation, setIsRunningAllocation] = useState(false);
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [allocFilters, setAllocFilters] = useState<{ gender: string; year: string; department: string }>({
    gender: 'all',
    year: 'all',
    department: 'all',
  });

  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    department: 'Computer Science',
    year: 1,
    gender: 'M',
    phone: '0910000000',
  });

  const loadStudents = async () => {
    setLoading(true);
    const [directoryRes, unassignedRes] = await Promise.all([
      apiService.getStudentDirectoryReport(),
      apiService.getUnassignedStudents(),
    ]);

    if (directoryRes.success && directoryRes.data?.students) {
      setStudents(directoryRes.data.students as StudentRow[]);
    }

    if (unassignedRes.success && unassignedRes.data?.students) {
      setUnassigned(unassignedRes.data.students as StudentRow[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (
        search &&
        !s.fullName?.toLowerCase().includes(search.toLowerCase()) &&
        !s.studentId?.toLowerCase().includes(search.toLowerCase()) &&
        !s.department?.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      if (departmentFilter !== 'all' && s.department !== departmentFilter) {
        return false;
      }

      if (yearFilter !== 'all' && s.year !== Number(yearFilter)) {
        return false;
      }

      return true;
    });
  }, [students, search, departmentFilter, yearFilter]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = formData.email.split('@')[0] || formData.studentId.toLowerCase();
    const result = await apiService.createUser({
      fullName: formData.fullName,
      email: formData.email,
      role: 'student',
      studentId: formData.studentId,
      tempPassword: true,
    });

    if (result.success) {
      toast.success('Student account created successfully');
      setIsModalOpen(false);
      setFormData({
        studentId: '',
        fullName: '',
        email: '',
        department: 'Computer Science',
        year: 1,
        gender: 'M',
        phone: '0910000000',
      });
      await loadStudents();
      return;
    }

    toast.error(result.error || 'Failed to create student');
  };

  const handleExport = async () => {
    const result = await apiService.exportReport('student_directory', 'xlsx', {
      department: departmentFilter !== 'all' ? departmentFilter : undefined,
      year: yearFilter !== 'all' ? Number(yearFilter) : undefined,
    });

    if (result.success && result.data?.fileUrl) {
      toast.success('Report exported successfully');
      window.open(result.data.fileUrl, '_blank');
      return;
    }

    toast.error(result.error || 'Failed to export report');
  };

  const handleAutoAllocate = async () => {
    setIsRunningAllocation(true);
    const params: { gender?: string; year?: number; department?: string; previewOnly: boolean } = { previewOnly: false };
    if (allocFilters.gender !== 'all') params.gender = allocFilters.gender;
    if (allocFilters.year !== 'all') params.year = Number(allocFilters.year);
    if (allocFilters.department !== 'all') params.department = allocFilters.department;

    const result = await apiService.runAutomaticAllocation(params);
    setIsRunningAllocation(false);

    if (result.success && result.data?.summary) {
      toast.success(`Allocated ${result.data.summary.totalAssigned} students${result.data.summary.totalUnassigned ? `, ${result.data.summary.totalUnassigned} unassigned` : ''}`);
      setIsAllocModalOpen(false);
      await loadStudents();
      return;
    }

    toast.error(result.error || 'Automatic allocation failed');
  };

  const departments = Array.from(new Set(students.map((s) => s.department))).sort();

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
            <Users className="w-6 h-6 text-primary" /> Student Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {students.length} registered students • {unassigned.length} currently unassigned
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 text-sm border-primary/30 text-primary hover:bg-primary/10" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button
            variant="outline"
            className="h-9 text-sm border-warning/30 text-warning hover:bg-warning/10"
            onClick={() => setIsAllocModalOpen(true)}
            disabled={isRunningAllocation}
          >
            <Wand2 className="w-4 h-4 mr-1" />
            Auto Allocate
          </Button>
          <Button className="gradient-primary text-primary-foreground h-9 text-sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Student
          </Button>
        </div>
      </div>

      <Card className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/30 border-border/30 h-9 text-sm"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48 bg-secondary/30 border-border/30 h-9 text-sm">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-36 bg-secondary/30 border-border/30 h-9 text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {[1, 2, 3, 4, 5].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Student</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Department</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Year</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Gender</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Contact</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id || s.studentId} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {s.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{s.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm font-mono text-muted-foreground">{s.studentId}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      {s.department}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                      Year {s.year}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{s.gender === 'M' ? 'Male' : 'Female'}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{s.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Student</DialogTitle>
          </DialogHeader>          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Student ID</Label>
                <Input value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} required className="bg-secondary/40 border-white/5" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Full Name</Label>
                <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required className="bg-secondary/40 border-white/5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Gender</Label>
                <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val as 'M' | 'F' })}>
                  <SelectTrigger className="bg-secondary/40 border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Year</Label>
                <Select value={formData.year.toString()} onValueChange={(val) => setFormData({ ...formData, year: Number(val) })}>
                  <SelectTrigger className="bg-secondary/40 border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Department</Label>
              <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="bg-secondary/40 border-white/5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-secondary/40 border-white/5" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="bg-secondary/40 border-white/5" />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="gradient-primary text-primary-foreground">Create Student</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Auto Allocation Dialog */}
      <Dialog open={isAllocModalOpen} onOpenChange={setIsAllocModalOpen}>
        <DialogContent className="glass border-primary/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-warning" /> Auto Allocate Rooms
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">Filter which students to allocate. Leave filters as "All" to allocate all unassigned students.</p>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Gender</Label>
              <Select value={allocFilters.gender} onValueChange={(val) => setAllocFilters({ ...allocFilters, gender: val })}>
                <SelectTrigger className="bg-secondary/40 border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Year</Label>
              <Select value={allocFilters.year} onValueChange={(val) => setAllocFilters({ ...allocFilters, year: val })}>
                <SelectTrigger className="bg-secondary/40 border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {[1, 2, 3, 4, 5].map((y) => (
                    <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Department</Label>
              <Select value={allocFilters.department} onValueChange={(val) => setAllocFilters({ ...allocFilters, department: val })}>
                <SelectTrigger className="bg-secondary/40 border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setIsAllocModalOpen(false)}>Cancel</Button>
            <Button
              className="bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30"
              onClick={handleAutoAllocate}
              disabled={isRunningAllocation}
            >
              <Wand2 className="w-4 h-4 mr-1" />
              {isRunningAllocation ? 'Allocating...' : 'Run Allocation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsPage;
