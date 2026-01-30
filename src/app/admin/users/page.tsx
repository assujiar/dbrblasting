'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import {
  Users,
  Loader2,
  ChevronRight,
  Search,
  Shield,
  Building2,
  X,
  Plus,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
} from 'lucide-react'
import { cn, formatDateShort } from '@/lib/utils'
import type { Organization, UserProfile, UserRole } from '@/types/database'

interface UserWithOrganization extends UserProfile {
  organization: Organization | null
}

interface NewUserForm {
  email: string
  password: string
  full_name: string
  phone: string
  position: string
  company: string
  role: UserRole
  organization_id: string
}

const initialFormState: NewUserForm = {
  email: '',
  password: '',
  full_name: '',
  phone: '',
  position: '',
  company: '',
  role: 'user',
  organization_id: '',
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserWithOrganization[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [orgFilter, setOrgFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Create user dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newUser, setNewUser] = useState<NewUserForm>(initialFormState)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (orgFilter && orgFilter !== 'all') params.set('organization_id', orgFilter)
      if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter)

      const [usersResponse, orgsResponse] = await Promise.all([
        fetch(`/api/admin/users?${params}`),
        fetch('/api/admin/organizations'),
      ])

      const usersData = await usersResponse.json()
      const orgsData = await orgsResponse.json()

      setUsers(usersData.data || [])
      setOrganizations(orgsData.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, orgFilter, roleFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const clearFilters = () => {
    setSearchQuery('')
    setOrgFilter('all')
    setRoleFilter('all')
  }

  const hasFilters = searchQuery || orgFilter !== 'all' || roleFilter !== 'all'

  // Calculate stats
  const stats = {
    total: users.length,
    superAdmins: users.filter((u) => u.role === 'super_admin').length,
    orgAdmins: users.filter((u) => u.role === 'org_admin').length,
    regularUsers: users.filter((u) => u.role === 'user').length,
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast({
        title: 'Validation Error',
        description: 'Email, password, and full name are required',
        variant: 'error',
      })
      return
    }

    if (newUser.password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters',
        variant: 'error',
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          organization_id: newUser.organization_id || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }

      toast({
        title: 'User Created',
        description: `Successfully created user ${newUser.email}`,
        variant: 'success',
      })

      setCreateDialogOpen(false)
      setNewUser(initialFormState)
      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'error',
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage user roles and organization assignments
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '25ms' }}>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-br from-primary-50/50 to-white',
            roleFilter === 'all' && 'ring-2 ring-primary-500 shadow-md'
          )}
          onClick={() => setRoleFilter('all')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-100">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                <p className="text-xs text-neutral-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-br from-error-50/50 to-white',
            roleFilter === 'super_admin' && 'ring-2 ring-error-500 shadow-md'
          )}
          onClick={() => setRoleFilter('super_admin')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-error-100">
                <Shield className="h-5 w-5 text-error-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-error-600">{stats.superAdmins}</p>
                <p className="text-xs text-neutral-500">Super Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-br from-accent-50/50 to-white',
            roleFilter === 'org_admin' && 'ring-2 ring-accent-500 shadow-md'
          )}
          onClick={() => setRoleFilter('org_admin')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent-100">
                <Building2 className="h-5 w-5 text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-600">{stats.orgAdmins}</p>
                <p className="text-xs text-neutral-500">Org Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-br from-success-50/50 to-white',
            roleFilter === 'user' && 'ring-2 ring-success-500 shadow-md'
          )}
          onClick={() => setRoleFilter('user')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success-100">
                <Users className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success-600">{stats.regularUsers}</p>
                <p className="text-xs text-neutral-500">Regular Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={orgFilter} onValueChange={setOrgFilter}>
                <SelectTrigger className="flex-1 sm:flex-initial sm:w-[180px] min-w-0">
                  <Building2 className="h-4 w-4 mr-2 text-neutral-400 shrink-0" />
                  <SelectValue placeholder="Organization" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter indicator */}
      {hasFilters && (
        <Card className="animate-slide-up border-primary-200 bg-primary-50/30" style={{ animationDelay: '75ms' }}>
          <CardContent className="py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-sm text-primary-700">
                Showing {users.length} users
                {roleFilter !== 'all' && ` (${roleFilter.replace('_', ' ')})`}
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start sm:self-auto">
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Clear Filters</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {isLoading ? (
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              <p className="text-sm text-neutral-500">Loading users...</p>
            </div>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="py-4">
            <EmptyState
              icon={Users}
              title={hasFilters ? 'No users found' : 'No users yet'}
              description={hasFilters ? 'Try adjusting your filters' : 'Click "Add User" to create your first user'}
              action={
                hasFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add User
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer transition-colors duration-150 hover:bg-primary-50/50"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                            {user.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-xs text-neutral-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'super_admin'
                              ? 'error'
                              : user.role === 'org_admin'
                              ? 'accent'
                              : 'neutral'
                          }
                        >
                          {user.role === 'super_admin'
                            ? 'Super Admin'
                            : user.role === 'org_admin'
                            ? 'Org Admin'
                            : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.organization ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-neutral-400" />
                            <span>{user.organization.name}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400">No organization</span>
                        )}
                      </TableCell>
                      <TableCell className="text-neutral-500">
                        {formatDateShort(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-neutral-400" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. They will be able to login immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="phone"
                    placeholder="+62 812 3456 7890"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="position"
                    placeholder="Marketing Manager"
                    value={newUser.position}
                    onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="company"
                  placeholder="PT Example Indonesia"
                  value={newUser.company}
                  onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="org_admin">Org Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Select
                  value={newUser.organization_id}
                  onValueChange={(value) => setNewUser({ ...newUser, organization_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Organization</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                setNewUser(initialFormState)
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} loading={isCreating}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
