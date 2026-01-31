'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { User, Building2, Briefcase, Phone, Mail, Loader2, Save, Shield, Key, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'

interface ProfileData {
  id?: string
  user_id: string
  full_name: string
  email: string
  phone: string
  position: string
  company: string
  role: UserRole
  organization: {
    id: string
    name: string
    slug: string
    is_active: boolean
  } | null
}

export default function ProfilePage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [profile, setProfile] = useState<ProfileData>({
    user_id: '',
    full_name: '',
    email: '',
    phone: '',
    position: '',
    company: '',
    role: 'user',
    organization: null,
  })

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/profile')
      const result = await response.json()

      if (response.ok) {
        setProfile(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          position: profile.position,
          company: profile.company,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile')
      }

      setProfile(result.data)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully saved.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save profile',
        variant: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Password terlalu pendek',
        description: 'Password baru minimal 6 karakter.',
        variant: 'error',
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Password tidak cocok',
        description: 'Pastikan password baru dan konfirmasi sama.',
        variant: 'error',
      })
      return
    }

    setIsChangingPassword(true)

    try {
      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: passwordData.currentPassword,
      })

      if (signInError) {
        toast({
          title: 'Password saat ini salah',
          description: 'Silakan masukkan password saat ini yang benar.',
          variant: 'error',
        })
        setIsChangingPassword(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) {
        throw updateError
      }

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      toast({
        title: 'Password berhasil diubah',
        description: 'Password Anda telah berhasil diperbarui.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Gagal mengubah password',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'error',
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Generate signature preview
  const signaturePreview = () => {
    if (!profile.full_name) return null

    return (
      <div className="text-sm text-neutral-600 border-t border-neutral-200 pt-4 mt-4">
        <p className="font-semibold text-neutral-900">{profile.full_name}</p>
        {profile.position && <p className="text-neutral-600">{profile.position}</p>}
        {profile.company && <p className="font-medium text-neutral-700">{profile.company}</p>}
        <div className="mt-3 space-y-1.5">
          {profile.email && (
            <p className="flex items-center gap-2 text-neutral-500">
              <Mail className="h-3.5 w-3.5 text-neutral-400" /> {profile.email}
            </p>
          )}
          {profile.phone && (
            <p className="flex items-center gap-2 text-neutral-500">
              <Phone className="h-3.5 w-3.5 text-neutral-400" /> {profile.phone}
            </p>
          )}
        </div>
      </div>
    )
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="error">Super Admin</Badge>
      case 'org_admin':
        return <Badge variant="warning">Org Admin</Badge>
      default:
        return <Badge variant="neutral">User</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your profile information. This will be used as your email signature.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              <p className="text-sm text-neutral-500">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <Card className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: '50ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-50">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  Personal Information
                </CardTitle>
                <CardDescription>
                  This information will appear in your email signature and sender details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      id="full_name"
                      placeholder="John Doe"
                      value={profile.full_name || ''}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, full_name: e.target.value }))
                      }
                      disabled={isSaving}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={profile.email || ''}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, email: e.target.value }))
                      }
                      disabled={isSaving}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      id="phone"
                      placeholder="+62 812 3456 7890"
                      value={profile.phone || ''}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      disabled={isSaving}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position / Job Title</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      id="position"
                      placeholder="Marketing Manager"
                      value={profile.position || ''}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, position: e.target.value }))
                      }
                      disabled={isSaving}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      id="company"
                      placeholder="PT Example Indonesia"
                      value={profile.company || ''}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, company: e.target.value }))
                      }
                      disabled={isSaving}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Signature Preview */}
              <Card className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: '100ms' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-100 to-accent-50">
                      <Mail className="h-4 w-4 text-accent-600" />
                    </div>
                    Email Signature Preview
                  </CardTitle>
                  <CardDescription>
                    This is how your signature will appear in emails. Use placeholders like{' '}
                    <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">{'{{sender_name}}'}</code>,{' '}
                    <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">{'{{sender_email}}'}</code>{' '}
                    in your templates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.full_name ? (
                    <div className={cn(
                      'rounded-xl p-4',
                      'bg-gradient-to-br from-neutral-50 to-neutral-100/50',
                      'border border-neutral-200'
                    )}>
                      <p className="text-sm text-neutral-500 mb-2 font-medium">Signature:</p>
                      {signaturePreview()}
                    </div>
                  ) : (
                    <div className={cn(
                      'text-center py-10 rounded-xl',
                      'bg-gradient-to-br from-neutral-50 to-neutral-100/50',
                      'border border-neutral-200'
                    )}>
                      <p className="text-neutral-400">
                        Fill in your profile to see the signature preview
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Role & Organization Info */}
              <Card className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: '150ms' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-success-100 to-success-50">
                      <Shield className="h-4 w-4 text-success-600" />
                    </div>
                    Role & Organization
                  </CardTitle>
                  <CardDescription>
                    Your role and organization assignment (managed by administrators)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-700">Role</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Your access level in the system</p>
                    </div>
                    <div className="self-start sm:self-auto shrink-0">
                      {getRoleBadge(profile.role)}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-700">Organization</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Your assigned organization</p>
                    </div>
                    {profile.organization ? (
                      <div className="text-left sm:text-right min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">{profile.organization.name}</p>
                        <p className="text-xs text-neutral-500">@{profile.organization.slug}</p>
                      </div>
                    ) : (
                      <Badge variant="neutral" className="self-start sm:self-auto">No Organization</Badge>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 text-center px-2">
                    Contact your Super Admin to change your role or organization assignment.
                    SMTP settings are managed at the organization level.
                  </p>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: '200ms' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-warning-100 to-warning-50">
                      <Key className="h-4 w-4 text-warning-600" />
                    </div>
                    Ubah Password
                  </CardTitle>
                  <CardDescription>
                    Perbarui password akun Anda untuk keamanan yang lebih baik
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Password Saat Ini</Label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Masukkan password saat ini"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                          }
                          disabled={isChangingPassword}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Password Baru</Label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Min. 6 karakter"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                          }
                          disabled={isChangingPassword}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Ulangi password baru"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                          }
                          disabled={isChangingPassword}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      loading={isChangingPassword}
                      variant="secondary"
                      className="w-full"
                    >
                      <Key className="h-4 w-4" />
                      Ubah Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center sm:justify-end pt-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Button type="submit" loading={isSaving} size="lg" className="w-full sm:w-auto">
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
