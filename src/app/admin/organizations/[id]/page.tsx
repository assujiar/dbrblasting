'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  ArrowLeft,
  Building2,
  Users,
  Loader2,
  Save,
  Trash2,
  Server,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  ChevronRight,
} from 'lucide-react'
import { cn, formatDateShort } from '@/lib/utils'
import type { Organization, UserProfile } from '@/types/database'

interface OrganizationDetail extends Organization {
  users: UserProfile[]
  stats: {
    users: number
    leads: number
    templates: number
    campaigns: number
  }
}

export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [smtpTestResult, setSmtpTestResult] = useState<'success' | 'error' | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [organization, setOrganization] = useState<OrganizationDetail | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: false,
    smtp_from_name: '',
    smtp_from_email: '',
  })

  const fetchOrganization = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/organizations/${id}`)
      if (!response.ok) throw new Error('Organization not found')
      const result = await response.json()

      setOrganization(result.data)
      setFormData({
        name: result.data.name || '',
        slug: result.data.slug || '',
        description: result.data.description || '',
        is_active: result.data.is_active ?? true,
        smtp_host: result.data.smtp_host || '',
        smtp_port: result.data.smtp_port || 587,
        smtp_user: result.data.smtp_user || '',
        smtp_pass: result.data.smtp_pass || '',
        smtp_secure: result.data.smtp_secure || false,
        smtp_from_name: result.data.smtp_from_name || '',
        smtp_from_email: result.data.smtp_from_email || '',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load organization',
        variant: 'error',
      })
      router.push('/admin/organizations')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchOrganization()
  }, [fetchOrganization])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update')

      toast({
        title: 'Organization updated',
        description: 'Changes have been saved successfully',
        variant: 'success',
      })
      fetchOrganization()
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

  const handleTestSmtp = async () => {
    setIsTesting(true)
    setSmtpTestResult(null)
    try {
      const response = await fetch(`/api/admin/organizations/${id}/test-smtp`, {
        method: 'POST',
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'SMTP test failed')

      setSmtpTestResult('success')
      toast({
        title: 'SMTP Connected',
        description: 'Successfully connected to SMTP server',
        variant: 'success',
      })
    } catch (error) {
      setSmtpTestResult('error')
      toast({
        title: 'SMTP Test Failed',
        description: error instanceof Error ? error.message : 'Failed to connect',
        variant: 'error',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete')
      }

      toast({
        title: 'Organization deleted',
        description: 'Organization has been removed',
        variant: 'success',
      })
      router.push('/admin/organizations')
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
          <Loader2 className="h-8 w-8 text-error-500 animate-spin" />
          <p className="text-sm text-neutral-500">Loading organization...</p>
        </div>
      </div>
    )
  }

  if (!organization) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-4">
          <Link href="/admin/organizations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-error-100 to-error-50">
              <Building2 className="h-6 w-6 text-error-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{organization.name}</h1>
              <p className="text-sm text-neutral-500">{organization.slug}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleSave} loading={isSaving}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
          <Button
            variant="outline"
            className="text-error-600 hover:bg-error-50"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
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
                <p className="text-2xl font-bold text-neutral-900">{organization.stats.users}</p>
                <p className="text-xs text-neutral-500">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent-100">
                <Users className="h-5 w-5 text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-600">{organization.stats.leads}</p>
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
                <p className="text-2xl font-bold text-success-600">{organization.stats.templates}</p>
                <p className="text-xs text-neutral-500">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning-100">
                <Send className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning-600">{organization.stats.campaigns}</p>
                <p className="text-xs text-neutral-500">Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-error-500" />
              Organization Details
            </CardTitle>
            <CardDescription>Basic information about this organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                disabled={isSaving}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                disabled={isSaving}
              />
              <div>
                <Label htmlFor="is_active" className="cursor-pointer">Active Status</Label>
                <p className="text-xs text-neutral-500">
                  Inactive organizations cannot send emails
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMTP Configuration */}
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Server className="h-5 w-5 text-success-500" />
                  SMTP Configuration
                </CardTitle>
                <CardDescription>Email server settings for this organization</CardDescription>
              </div>
              {formData.smtp_host && (
                <Badge variant={smtpTestResult === 'success' ? 'success' : smtpTestResult === 'error' ? 'error' : 'neutral'}>
                  {smtpTestResult === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {smtpTestResult === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {smtpTestResult === 'success' ? 'Connected' : smtpTestResult === 'error' ? 'Failed' : 'Not tested'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  placeholder="smtp.gmail.com"
                  value={formData.smtp_host}
                  onChange={(e) => setFormData((prev) => ({ ...prev, smtp_host: e.target.value }))}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp_port">Port</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={formData.smtp_port || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, smtp_port: parseInt(e.target.value) || 587 }))}
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp_user">Username</Label>
                <Input
                  id="smtp_user"
                  value={formData.smtp_user}
                  onChange={(e) => setFormData((prev) => ({ ...prev, smtp_user: e.target.value }))}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp_pass">Password</Label>
                <div className="relative">
                  <Input
                    id="smtp_pass"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.smtp_pass}
                    onChange={(e) => setFormData((prev) => ({ ...prev, smtp_pass: e.target.value }))}
                    disabled={isSaving}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp_from_name">From Name</Label>
                <Input
                  id="smtp_from_name"
                  value={formData.smtp_from_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, smtp_from_name: e.target.value }))}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp_from_email">From Email</Label>
                <Input
                  id="smtp_from_email"
                  type="email"
                  value={formData.smtp_from_email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, smtp_from_email: e.target.value }))}
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <Switch
                id="smtp_secure"
                checked={formData.smtp_secure}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, smtp_secure: checked }))}
                disabled={isSaving}
              />
              <div>
                <Label htmlFor="smtp_secure" className="cursor-pointer">Use SSL/TLS</Label>
                <p className="text-xs text-neutral-500">
                  Enable for port 465, disable for port 587
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleTestSmtp}
              loading={isTesting}
              disabled={!formData.smtp_host || !formData.smtp_user || !formData.smtp_pass}
            >
              <Server className="h-4 w-4" />
              Test Connection
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-primary-500" />
            Organization Users
          </CardTitle>
          <CardDescription>Users assigned to this organization</CardDescription>
        </CardHeader>
        <CardContent>
          {organization.users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No users in this organization</p>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="mt-3">
                  Assign Users
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organization.users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer hover:bg-primary-50/50"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
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
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{organization.name}</strong>?
              This action cannot be undone.
              {organization.stats.users > 0 && (
                <span className="block mt-2 text-error-600">
                  Warning: This organization has {organization.stats.users} users.
                  Remove them first.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={organization.stats.users > 0}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
