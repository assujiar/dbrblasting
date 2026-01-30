'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Users,
  Mail,
  Send,
  FileText,
  Loader2,
  ChevronRight,
  Plus,
  TrendingUp,
} from 'lucide-react'
import { cn, formatDateShort } from '@/lib/utils'
import type { Organization, UserProfile } from '@/types/database'

interface DashboardStats {
  totalOrganizations: number
  activeOrganizations: number
  totalUsers: number
  totalLeads: number
  totalTemplates: number
  totalCampaigns: number
  emailsSent: number
  emailsFailed: number
}

interface RecentOrganization extends Organization {
  user_count: number
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrgs, setRecentOrgs] = useState<RecentOrganization[]>([])
  const [recentUsers, setRecentUsers] = useState<(UserProfile & { organization?: { name: string } | null })[]>([])

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch organizations
      const orgsResponse = await fetch('/api/admin/organizations')
      const orgsData = await orgsResponse.json()
      const orgs = orgsData.data || []

      // Fetch users
      const usersResponse = await fetch('/api/admin/users')
      const usersData = await usersResponse.json()
      const users = usersData.data || []

      // Calculate stats
      setStats({
        totalOrganizations: orgs.length,
        activeOrganizations: orgs.filter((o: Organization) => o.is_active).length,
        totalUsers: users.length,
        totalLeads: 0, // Would need separate API
        totalTemplates: 0,
        totalCampaigns: 0,
        emailsSent: 0,
        emailsFailed: 0,
      })

      setRecentOrgs(orgs.slice(0, 5))
      setRecentUsers(users.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <p className="text-sm text-neutral-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Overview of all organizations, users, and platform activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <Card className="bg-gradient-to-br from-error-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-error-100">
                <Building2 className="h-5 w-5 text-error-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats?.totalOrganizations || 0}</p>
                <p className="text-xs text-neutral-500">Organizations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-100">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-neutral-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success-100">
                <Building2 className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success-600">{stats?.activeOrganizations || 0}</p>
                <p className="text-xs text-neutral-500">Active Orgs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent-50/50 to-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent-100">
                <TrendingUp className="h-5 w-5 text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-600">
                  {stats?.totalOrganizations ? Math.round((stats.activeOrganizations / stats.totalOrganizations) * 100) : 0}%
                </p>
                <p className="text-xs text-neutral-500">Active Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Link href="/admin/organizations">
          <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-error-100 to-error-50">
                    <Building2 className="h-6 w-6 text-error-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Manage Organizations</p>
                    <p className="text-sm text-neutral-500">Create and configure organizations</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-300" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Manage Users</p>
                    <p className="text-sm text-neutral-500">Assign roles and organizations</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-300" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Data */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Organizations */}
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-5 w-5 text-error-500" />
                  Recent Organizations
                </CardTitle>
                <CardDescription>
                  Latest organizations added to the platform
                </CardDescription>
              </div>
              <Link href="/admin/organizations">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrgs.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No organizations yet</p>
                <Link href="/admin/organizations">
                  <Button variant="outline" size="sm" className="mt-3">
                    <Plus className="h-4 w-4" />
                    Add Organization
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrgs.map((org) => (
                  <Link key={org.id} href={`/admin/organizations/${org.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-error-100 to-error-50 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-error-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{org.name}</p>
                          <p className="text-xs text-neutral-500">
                            {org.user_count || 0} users
                          </p>
                        </div>
                      </div>
                      <Badge variant={org.is_active ? 'success' : 'neutral'}>
                        {org.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5 text-primary-500" />
                  Recent Users
                </CardTitle>
                <CardDescription>
                  Latest users registered on the platform
                </CardDescription>
              </div>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No users yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <Link key={user.id} href={`/admin/users/${user.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{user.full_name}</p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
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
                        {user.organization && (
                          <p className="text-xs text-neutral-400 mt-1">
                            {user.organization.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
