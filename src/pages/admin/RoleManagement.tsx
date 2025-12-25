import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Shield, 
  Users, 
  GraduationCap, 
  Search, 
  Plus, 
  Trash2, 
  UserCog,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface UserWithRoles {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  roles: string[];
  created_at: string;
}

interface RoleAssignment {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const RoleManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all role assignments
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      setRoleAssignments(roles || []);

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        email: profile.email || '',
        full_name: profile.full_name || 'Unknown',
        roles: roles?.filter(r => r.user_id === profile.user_id).map(r => r.role) || [],
        created_at: profile.created_at
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error('Please select a user and role');
      return;
    }

    setIsAssigning(true);
    try {
      // Check if role already exists
      const existingRole = roleAssignments.find(
        r => r.user_id === selectedUserId && r.role === selectedRole
      );

      if (existingRole) {
        toast.error('User already has this role');
        return;
      }

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUserId,
          role: selectedRole as "admin" | "instructor" | "user"
        });

      if (error) throw error;

      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'role_assigned',
        entity_type: 'user_roles',
        entity_id: selectedUserId,
        new_value: { role: selectedRole },
        metadata: { assigned_by: user?.email }
      });

      toast.success(`Role "${selectedRole}" assigned successfully`);
      setDialogOpen(false);
      setSelectedUserId('');
      setSelectedRole('');
      fetchData();

      // Play success sound
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast.error(`Failed to assign role: ${error.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const removeRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as "admin" | "instructor" | "user");

      if (error) throw error;

      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'role_removed',
        entity_type: 'user_roles',
        entity_id: userId,
        old_value: { role },
        metadata: { removed_by: user?.email }
      });

      toast.success(`Role "${role}" removed successfully`);
      fetchData();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast.error(`Failed to remove role: ${error.message}`);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500 hover:bg-red-600"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'instructor':
        return <Badge className="bg-purple-500 hover:bg-purple-600"><GraduationCap className="w-3 h-3 mr-1" />Instructor</Badge>;
      case 'user':
        return <Badge variant="secondary"><Users className="w-3 h-3 mr-1" />User</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.roles.includes('admin')).length,
    instructors: users.filter(u => u.roles.includes('instructor')).length,
    noRoles: users.filter(u => u.roles.length === 0).length
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Role Management</h1>
            <p className="text-muted-foreground">Assign and manage user roles</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Assign Role to User</DialogTitle>
                  <DialogDescription>
                    Select a user and the role you want to assign
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto scroll-smooth">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select User</label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {users.map(u => (
                          <SelectItem key={u.user_id} value={u.user_id}>
                            {u.full_name} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Role</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 mr-2 text-red-500" />
                            Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="instructor">
                          <div className="flex items-center">
                            <GraduationCap className="w-4 h-4 mr-2 text-purple-500" />
                            Instructor
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            User
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={assignRole} disabled={isAssigning}>
                    {isAssigning ? 'Assigning...' : 'Assign Role'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-10 h-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-3xl font-bold text-red-500">{stats.admins}</p>
                </div>
                <Shield className="w-10 h-10 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Instructors</p>
                  <p className="text-3xl font-bold text-purple-500">{stats.instructors}</p>
                </div>
                <GraduationCap className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">No Roles</p>
                  <p className="text-3xl font-bold text-yellow-500">{stats.noRoles}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="w-5 h-5" />
                  User Roles
                </CardTitle>
                <CardDescription>Manage roles for all users</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.length > 0 ? (
                            u.roles.map(role => (
                              <div key={role} className="flex items-center gap-1">
                                {getRoleBadge(role)}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-destructive hover:text-destructive"
                                  onClick={() => removeRole(u.user_id, role)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              No roles assigned
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUserId(u.user_id);
                            setDialogOpen(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default RoleManagement;
