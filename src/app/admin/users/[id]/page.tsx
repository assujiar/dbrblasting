'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { toast } from '@/components/ui/use-toast'
import {
  ArrowLeft,
  User,
  Building2,
  Loader2,
  Save,
  Trash2,
  Shield,
  Users,
  FileText,
  Send,
  Mail,
  Phone,
  Briefcase,
} from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import type { Organization, UserProfile } from '@/types/database'

interface UserDetail extends UserProfile {
  organization: Organization | null
  stats: {
    leads: number
    templates: number
    campaigns: number
  }
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [user, setUser] = useState<UserDetail | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    company: '',
    role: 'user' as 'super_admin' | 'org_admin' | 'user',
    organization_id: '',
  })

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [userResponse, orgsResponse] = await Promise.all([
        fetch(`/api/admin/users/${id}`),
        fetch('/api/admin/organizations'),
      ])

      if (!userResponse.ok) throw new Error('User not found')

      const userData = await userResponse.json()
      const orgsData = await orgsResponse.json()

      setUser(userData.data)
      setOrganizations(orgsData.data || [])
      setFormData({
        full_name: userData.data.full_name || '',
        email: userData.data.email || '',
        phone: userData.data.phone || '',
        position: userData.data.position || '',
        company: userData.data.company || '',
        role: userData.data.role || 'user',
        organization_id: userData.data.organization_id || '',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load user',
        variant: 'error',
      })
      router.push('/admin/users')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          organization_id: formData.organization_id || null,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update')

      toast({
        title: 'User updated',
        description: 'Changes have been saved successfully',
        variant: 'success',
      })
      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save',
        variant: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete')
      }

      toast({
        title: 'User removed',
        description: 'User profile has been deleted',
        variant: 'success',
      })
      router.push('/admin/users')
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete',
        variant: 'error',
      })
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <p className="text-sm text-neutral-500">Loading user...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link href="/admin/users" className="shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-semibold shrink-0">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-neutral-900 break-words line-clamp-2">{user.full_name}</h1>
              <p className="text-sm text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleSave} loading={isSaving}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
          {user.role !== 'super_admin' && (
            <Button
              variant="outline"
              className="text-error-600 hover:bg-error-50"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <Card className="bg-gradient-to-br from-primary-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-100">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{user.stats.leads}</p>
                <p className="text-xs text-neutral-500">Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success-100">
                <FileText className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success-600">{user.stats.templates}</p>
                <p className="text-xs text-neutral-500">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent-100">
                <Send className="h-5 w-5 text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-600">{user.stats.campaigns}</p>
                <p className="text-xs text-neutral-500">Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning-100">
                <Shield className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-warning-600 capitalize">
                  {user.role === 'super_admin'
                    ? 'Super Admin'
                    : user.role === 'org_admin'
                    ? 'Org Admin'
                    : 'User'}
                </p>
                <p className="text-xs text-neutral-500">Role</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Info */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-primary-500" />
              User Information
            </CardTitle>
            <CardDescription>Basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                  disabled={isSaving}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={isSaving}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  disabled={isSaving}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                    disabled={isSaving}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                    disabled={isSaving}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Organization */}
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-error-500" />
              Role & Organization
            </CardTitle>
            <CardDescription>Access control and organization assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: value as 'super_admin' | 'org_admin' | 'user',
                  }))
                }
                disabled={isSaving || user.role === 'super_admin'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      User
                    </div>
                  </SelectItem>
                  <SelectItem value="org_admin">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Organization Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="super_admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Super Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                Super Admin: Full platform access. Org Admin: Organization management. User: Standard access.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Organization</Label>
              <Select
                value={formData.organization_id || 'none'}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    organization_id: value === 'none' ? '' : value,
                  }))
                }
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Organization</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                Assign user to an organization to use its SMTP settings
              </p>
            </div>

            {formData.organization_id && (
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <p className="text-sm font-medium text-neutral-700 mb-2">Current Organization</p>
                {user.organization ? (
                  <Link href={`/admin/organizations/${user.organization.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-neutral-100 transition-colors cursor-pointer">
                      <div className="p-2 rounded-lg bg-error-50">
                        <Building2 className="h-5 w-5 text-error-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.organization.name}</p>
                        <p className="text-xs text-neutral-500">{user.organization.slug}</p>
                      </div>
                      <Badge variant={user.organization.is_active ? 'success' : 'neutral'} className="ml-auto">
                        {user.organization.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </Link>
                ) : (
                  <p className="text-neutral-500">Organization not found</p>
                )}
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-xs text-neutral-400">
                Member since {formatDateShort(user.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{user.full_name}</strong>?
              This will remove their profile data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
