'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import {
  Plus,
  Building2,
  Users,
  Loader2,
  ChevronRight,
  Search,
  Server,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Organization } from '@/types/database'

interface OrganizationWithCount extends Organization {
  user_count: number
}

export default function OrganizationsPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<OrganizationWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [smtpTestResult, setSmtpTestResult] = useState<'success' | 'error' | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: false,
    smtp_from_name: '',
    smtp_from_email: '',
  })

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/admin/organizations?${params}`)
      const result = await response.json()

      if (response.ok) {
        setOrganizations(result.data || [])
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch organizations',
          variant: 'error',
        })
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create organization')
      }

      toast({
        title: 'Organization created',
        description: `${formData.name} has been created successfully`,
        variant: 'success',
      })

      setFormOpen(false)
      setFormData({
        name: '',
        slug: '',
        description: '',
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_pass: '',
        smtp_secure: false,
        smtp_from_name: '',
        smtp_from_email: '',
      })
      fetchOrganizations()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create organization',
        variant: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate stats
  const stats = {
    total: organizations.length,
    active: organizations.filter((o) => o.is_active).length,
    withSmtp: organizations.filter((o) => o.smtp_host).length,
    totalUsers: organizations.reduce((acc, o) => acc + (o.user_count || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Organizations</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage organizations and their SMTP configurations
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          New Organization
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '25ms' }}>
        <Card className="bg-gradient-to-br from-error-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-error-100">
                <Building2 className="h-5 w-5 text-error-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                <p className="text-xs text-neutral-500">Total Orgs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success-100">
                <CheckCircle2 className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success-600">{stats.active}</p>
                <p className="text-xs text-neutral-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-100">
                <Server className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">{stats.withSmtp}</p>
                <p className="text-xs text-neutral-500">With SMTP</p>
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
                <p className="text-2xl font-bold text-accent-600">{stats.totalUsers}</p>
                <p className="text-xs text-neutral-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Card className="animate-slide-up" style={{ animationDelay: '75ms' }}>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-error-500 animate-spin" />
              <p className="text-sm text-neutral-500">Loading organizations...</p>
            </div>
          </CardContent>
        </Card>
      ) : organizations.length === 0 ? (
        <Card className="animate-slide-up" style={{ animationDelay: '75ms' }}>
          <CardContent className="py-4">
            <EmptyState
              icon={Building2}
              title={searchQuery ? 'No organizations found' : 'No organizations yet'}
              description={
                searchQuery
                  ? 'Try a different search term'
                  : 'Create your first organization to get started'
              }
              action={
                !searchQuery && (
                  <Button onClick={() => setFormOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Create Organization
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {organizations.map((org) => (
            <Card
              key={org.id}
              className={cn(
                'cursor-pointer transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-1',
                'bg-gradient-to-br from-white to-neutral-50/50'
              )}
              onClick={() => router.push(`/admin/organizations/${org.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {org.logo_url ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-neutral-200 bg-white flex items-center justify-center">
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-gradient-to-br from-error-100 to-error-50">
                        <Building2 className="h-5 w-5 text-error-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{org.name}</CardTitle>
                      <p className="text-xs text-neutral-400">{org.slug}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={org.is_active ? 'success' : 'neutral'}>
                      {org.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {org.smtp_host && (
                      <Badge variant="outline">
                        <Server className="h-3 w-3 mr-1" />
                        SMTP
                      </Badge>
                    )}
                  </div>
                  <Badge variant="accent">
                    <Users className="h-3 w-3 mr-1" />
                    {org.user_count || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Organization Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Add a new organization with its SMTP configuration
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    placeholder="Pos Indonesia"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    disabled={isSaving}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="pos-indonesia"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the organization"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={isSaving}
                  rows={2}
                />
              </div>
            </div>

            {/* SMTP Configuration */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-neutral-500" />
                <h3 className="font-semibold text-neutral-900">SMTP Configuration</h3>
                <span className="text-xs text-neutral-400">(Optional)</span>
              </div>

              <div className="space-y-4">
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
                    <Label htmlFor="smtp_port">SMTP Port</Label>
                    <Input
                      id="smtp_port"
                      type="number"
                      placeholder="587"
                      value={formData.smtp_port || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, smtp_port: parseInt(e.target.value) || 587 }))}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_user">SMTP Username</Label>
                    <Input
                      id="smtp_user"
                      placeholder="your-email@gmail.com"
                      value={formData.smtp_user}
                      onChange={(e) => setFormData((prev) => ({ ...prev, smtp_user: e.target.value }))}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_pass">SMTP Password</Label>
                    <div className="relative">
                      <Input
                        id="smtp_pass"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
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
                      placeholder="Pos Indonesia Marketing"
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
                      placeholder="marketing@posindonesia.co.id"
                      value={formData.smtp_from_email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, smtp_from_email: e.target.value }))}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSaving}>
                Create Organization
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
