export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Role types
export type UserRole = 'super_admin' | 'org_admin' | 'user'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          smtp_host: string | null
          smtp_port: number | null
          smtp_user: string | null
          smtp_pass: string | null
          smtp_secure: boolean
          smtp_from_name: string | null
          smtp_from_email: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          smtp_pass?: string | null
          smtp_secure?: boolean
          smtp_from_name?: string | null
          smtp_from_email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          smtp_pass?: string | null
          smtp_secure?: boolean
          smtp_from_name?: string | null
          smtp_from_email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          phone: string
          position: string
          company: string
          role: UserRole
          organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          phone?: string
          position?: string
          company?: string
          role?: UserRole
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          phone?: string
          position?: string
          company?: string
          role?: UserRole
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          company: string
          email: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          company?: string
          email: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          company?: string
          email?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      contact_groups: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      contact_group_members: {
        Row: {
          id: string
          user_id: string
          group_id: string
          lead_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          lead_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string
          lead_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          subject: string
          html_body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          subject: string
          html_body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          subject?: string
          html_body?: string
          created_at?: string
          updated_at?: string
        }
      }
      email_campaigns: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          template_id: string | null  // Nullable due to ON DELETE SET NULL
          name: string
          status: 'draft' | 'running' | 'completed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          template_id: string  // Required on insert
          name: string
          status?: 'draft' | 'running' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          template_id?: string | null
          name?: string
          status?: 'draft' | 'running' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      email_campaign_recipients: {
        Row: {
          id: string
          campaign_id: string
          user_id: string
          lead_id: string | null
          to_email: string
          to_name: string
          status: 'pending' | 'sent' | 'failed'
          error: string | null
          sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id: string
          lead_id?: string | null
          to_email: string
          to_name?: string
          status?: 'pending' | 'sent' | 'failed'
          error?: string | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          user_id?: string
          lead_id?: string | null
          to_email?: string
          to_name?: string
          status?: 'pending' | 'sent' | 'failed'
          error?: string | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      campaigns_with_counts: {
        Args: Record<string, never>
        Returns: {
          id: string
          user_id: string
          organization_id: string | null
          template_id: string | null
          name: string
          status: string
          created_at: string
          updated_at: string
          total_count: number
          sent_count: number
          failed_count: number
          pending_count: number
        }[]
      }
      is_super_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_user_organization_id: {
        Args: Record<string, never>
        Returns: string | null
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: UserRole
      }
    }
    Enums: {
      user_role: UserRole
    }
  }
}

// Organization types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']

export type ContactGroup = Database['public']['Tables']['contact_groups']['Row']
export type ContactGroupInsert = Database['public']['Tables']['contact_groups']['Insert']
export type ContactGroupUpdate = Database['public']['Tables']['contact_groups']['Update']

export type ContactGroupMember = Database['public']['Tables']['contact_group_members']['Row']
export type ContactGroupMemberInsert = Database['public']['Tables']['contact_group_members']['Insert']
export type ContactGroupMemberUpdate = Database['public']['Tables']['contact_group_members']['Update']

export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert']
export type EmailTemplateUpdate = Database['public']['Tables']['email_templates']['Update']

export type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row']
export type EmailCampaignInsert = Database['public']['Tables']['email_campaigns']['Insert']
export type EmailCampaignUpdate = Database['public']['Tables']['email_campaigns']['Update']

export type EmailCampaignRecipient = Database['public']['Tables']['email_campaign_recipients']['Row']
export type EmailCampaignRecipientInsert = Database['public']['Tables']['email_campaign_recipients']['Insert']
export type EmailCampaignRecipientUpdate = Database['public']['Tables']['email_campaign_recipients']['Update']

export interface ContactGroupWithMembers extends ContactGroup {
  members: (ContactGroupMember & { lead: Lead })[]
}

export interface EmailCampaignWithDetails extends EmailCampaign {
  template: EmailTemplate | null
  recipients: EmailCampaignRecipient[]
}

export interface UserProfileWithOrganization extends UserProfile {
  organization: Organization | null
}

export interface OrganizationWithUsers extends Organization {
  users: UserProfile[]
}

// Function result types
export type CampaignWithCounts = Database['public']['Functions']['campaigns_with_counts']['Returns'][number]
