'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { User, Building2, Briefcase, Phone, Mail, Loader2, Save } from 'lucide-react'
import type { UserProfile } from '@/types/database'

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    company: '',
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
        body: JSON.stringify(profile),
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

  // Generate signature preview
  const signaturePreview = () => {
    if (!profile.full_name) return null

    return (
      <div className="text-sm text-gray-600 border-t pt-4 mt-4">
        <p className="font-semibold text-gray-900">{profile.full_name}</p>
        {profile.position && <p>{profile.position}</p>}
        {profile.company && <p className="font-medium">{profile.company}</p>}
        <div className="mt-2 space-y-1">
          {profile.email && (
            <p className="flex items-center gap-2">
              <Mail className="h-3 w-3" /> {profile.email}
            </p>
          )}
          {profile.phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-3 w-3" /> {profile.phone}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile information. This will be used as your email signature.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>
                  This information will appear in your email signature and CTA buttons.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    Full Name *
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={profile.full_name || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={profile.email || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, email: e.target.value }))
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+62 812 3456 7890"
                    value={profile.phone || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    Position / Job Title
                  </Label>
                  <Input
                    id="position"
                    placeholder="Marketing Manager"
                    value={profile.position || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, position: e.target.value }))
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    placeholder="PT Example Indonesia"
                    value={profile.company || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, company: e.target.value }))
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" loading={isSaving} className="w-full sm:w-auto">
                    <Save className="h-4 w-4" />
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Signature Preview */}
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Email Signature Preview</CardTitle>
                <CardDescription>
                  This is how your signature will appear in emails. Use placeholders like{' '}
                  {'{{sender_name}}'}, {'{{sender_position}}'}, {'{{sender_company}}'},{' '}
                  {'{{sender_email}}'}, {'{{sender_phone}}'} in your templates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile.full_name ? (
                  <div className="glass-light rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-2">Signature:</p>
                    {signaturePreview()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Fill in your profile to see the signature preview
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      )}
    </div>
  )
}
