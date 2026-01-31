'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sparkles,
  Palette,
  Target,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Lock,
  History,
  Zap,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIEmailDesignSpec, AIEmailPurpose } from '@/types/database'

// Design specification options
const DESIGN_OPTIONS = {
  layout: [
    { value: 'single-column', label: 'Single Column' },
    { value: 'two-column', label: 'Two Column' },
    { value: 'hero-header', label: 'Hero Header' },
    { value: 'card-based', label: 'Card Based' },
    { value: 'newsletter', label: 'Newsletter Style' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'magazine', label: 'Magazine Style' },
    { value: 'promotional', label: 'Promotional Banner' },
  ],
  colorScheme: [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'colorful', label: 'Colorful' },
    { value: 'monochrome', label: 'Monochrome' },
    { value: 'pastel', label: 'Pastel' },
    { value: 'vibrant', label: 'Vibrant' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'warm', label: 'Warm Tones' },
    { value: 'cool', label: 'Cool Tones' },
  ],
  fontFamily: [
    { value: 'arial', label: 'Arial (Sans-serif)' },
    { value: 'helvetica', label: 'Helvetica (Sans-serif)' },
    { value: 'georgia', label: 'Georgia (Serif)' },
    { value: 'times', label: 'Times New Roman (Serif)' },
    { value: 'verdana', label: 'Verdana (Sans-serif)' },
    { value: 'tahoma', label: 'Tahoma (Sans-serif)' },
    { value: 'trebuchet', label: 'Trebuchet MS (Sans-serif)' },
    { value: 'courier', label: 'Courier New (Monospace)' },
  ],
  fontSize: [
    { value: 'small', label: 'Small (14px base)' },
    { value: 'medium', label: 'Medium (16px base)' },
    { value: 'large', label: 'Large (18px base)' },
    { value: 'extra-large', label: 'Extra Large (20px base)' },
  ],
  headerStyle: [
    { value: 'centered', label: 'Centered Logo' },
    { value: 'left-aligned', label: 'Left Aligned Logo' },
    { value: 'full-width-banner', label: 'Full Width Banner' },
    { value: 'minimal', label: 'Minimal Header' },
    { value: 'hero-image', label: 'Hero Image Header' },
    { value: 'gradient', label: 'Gradient Background' },
    { value: 'none', label: 'No Header' },
  ],
  footerStyle: [
    { value: 'simple', label: 'Simple (Links only)' },
    { value: 'detailed', label: 'Detailed (Contact info)' },
    { value: 'social', label: 'Social Media Focus' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'branded', label: 'Branded Footer' },
    { value: 'legal', label: 'Legal Focus' },
  ],
  buttonStyle: [
    { value: 'rounded', label: 'Rounded' },
    { value: 'square', label: 'Square' },
    { value: 'pill', label: 'Pill Shape' },
    { value: 'outline', label: 'Outline' },
    { value: 'gradient', label: 'Gradient' },
    { value: '3d', label: '3D Effect' },
    { value: 'ghost', label: 'Ghost/Transparent' },
  ],
  imagePosition: [
    { value: 'top', label: 'Top' },
    { value: 'left', label: 'Left Side' },
    { value: 'right', label: 'Right Side' },
    { value: 'background', label: 'Background' },
    { value: 'inline', label: 'Inline with Text' },
    { value: 'none', label: 'No Images' },
  ],
  spacing: [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal' },
    { value: 'relaxed', label: 'Relaxed' },
    { value: 'spacious', label: 'Spacious' },
  ],
  borderStyle: [
    { value: 'none', label: 'No Borders' },
    { value: 'subtle', label: 'Subtle Lines' },
    { value: 'solid', label: 'Solid Borders' },
    { value: 'rounded', label: 'Rounded Borders' },
    { value: 'dashed', label: 'Dashed' },
  ],
  shadowStyle: [
    { value: 'none', label: 'No Shadows' },
    { value: 'subtle', label: 'Subtle Shadow' },
    { value: 'medium', label: 'Medium Shadow' },
    { value: 'strong', label: 'Strong Shadow' },
  ],
}

// Email purpose options
const PURPOSE_OPTIONS = {
  emailType: [
    { value: 'promotional', label: 'Promotional/Sales' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'transactional', label: 'Transactional' },
    { value: 'event-invitation', label: 'Event Invitation' },
    { value: 'product-launch', label: 'Product Launch' },
    { value: 'survey', label: 'Survey/Feedback Request' },
    { value: 're-engagement', label: 'Re-engagement' },
    { value: 'thank-you', label: 'Thank You' },
    { value: 'seasonal', label: 'Seasonal/Holiday' },
    { value: 'educational', label: 'Educational/Tips' },
    { value: 'case-study', label: 'Case Study' },
    { value: 'webinar', label: 'Webinar Invitation' },
  ],
  industry: [
    { value: 'technology', label: 'Technology/SaaS' },
    { value: 'ecommerce', label: 'E-commerce/Retail' },
    { value: 'finance', label: 'Finance/Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'hospitality', label: 'Hospitality/Travel' },
    { value: 'food-beverage', label: 'Food & Beverage' },
    { value: 'fashion', label: 'Fashion/Beauty' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting/Services' },
    { value: 'nonprofit', label: 'Non-profit' },
    { value: 'media', label: 'Media/Entertainment' },
    { value: 'fitness', label: 'Fitness/Wellness' },
    { value: 'general', label: 'General/Other' },
  ],
  targetAudience: [
    { value: 'b2b-executives', label: 'B2B Executives/Decision Makers' },
    { value: 'b2b-managers', label: 'B2B Managers' },
    { value: 'b2b-technical', label: 'B2B Technical Professionals' },
    { value: 'b2c-general', label: 'B2C General Consumers' },
    { value: 'b2c-millennials', label: 'B2C Millennials (25-40)' },
    { value: 'b2c-genz', label: 'B2C Gen Z (18-24)' },
    { value: 'b2c-seniors', label: 'B2C Seniors (55+)' },
    { value: 'b2c-parents', label: 'B2C Parents/Families' },
    { value: 'b2c-professionals', label: 'B2C Working Professionals' },
    { value: 'students', label: 'Students' },
    { value: 'entrepreneurs', label: 'Entrepreneurs/Startups' },
    { value: 'existing-customers', label: 'Existing Customers' },
    { value: 'new-leads', label: 'New Leads/Prospects' },
  ],
  primaryGoal: [
    { value: 'drive-sales', label: 'Drive Sales/Conversions' },
    { value: 'generate-leads', label: 'Generate Leads' },
    { value: 'build-awareness', label: 'Build Brand Awareness' },
    { value: 'educate', label: 'Educate/Inform' },
    { value: 'engagement', label: 'Increase Engagement' },
    { value: 'retention', label: 'Customer Retention' },
    { value: 'feedback', label: 'Collect Feedback' },
    { value: 'event-registration', label: 'Event Registration' },
    { value: 'app-download', label: 'App Download' },
    { value: 'content-promotion', label: 'Content Promotion' },
    { value: 'relationship', label: 'Build Relationship' },
  ],
  callToAction: [
    { value: 'shop-now', label: 'Shop Now' },
    { value: 'learn-more', label: 'Learn More' },
    { value: 'sign-up', label: 'Sign Up' },
    { value: 'get-started', label: 'Get Started' },
    { value: 'download', label: 'Download' },
    { value: 'register', label: 'Register' },
    { value: 'book-demo', label: 'Book a Demo' },
    { value: 'contact-us', label: 'Contact Us' },
    { value: 'claim-offer', label: 'Claim Offer' },
    { value: 'read-more', label: 'Read More' },
    { value: 'watch-video', label: 'Watch Video' },
    { value: 'subscribe', label: 'Subscribe' },
    { value: 'try-free', label: 'Try for Free' },
    { value: 'custom', label: 'Custom CTA' },
  ],
  urgencyLevel: [
    { value: 'none', label: 'No Urgency' },
    { value: 'low', label: 'Low (Gentle reminder)' },
    { value: 'medium', label: 'Medium (Time-sensitive)' },
    { value: 'high', label: 'High (Limited time offer)' },
    { value: 'extreme', label: 'Extreme (Last chance)' },
  ],
  language: [
    { value: 'indonesian', label: 'Bahasa Indonesia' },
    { value: 'english', label: 'English' },
    { value: 'english-us', label: 'English (US)' },
    { value: 'english-uk', label: 'English (UK)' },
  ],
  writingStyle: [
    { value: 'conversational', label: 'Conversational' },
    { value: 'professional', label: 'Professional' },
    { value: 'storytelling', label: 'Storytelling' },
    { value: 'persuasive', label: 'Persuasive' },
    { value: 'informative', label: 'Informative' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'direct', label: 'Direct/To the point' },
  ],
  tone: [
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'empathetic', label: 'Empathetic' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'playful', label: 'Playful' },
    { value: 'serious', label: 'Serious' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'calm', label: 'Calm/Reassuring' },
  ],
  formality: [
    { value: 'very-casual', label: 'Very Casual' },
    { value: 'casual', label: 'Casual' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'formal', label: 'Formal' },
    { value: 'very-formal', label: 'Very Formal' },
  ],
  contentLength: [
    { value: 'short', label: 'Short (Under 150 words)' },
    { value: 'medium', label: 'Medium (150-300 words)' },
    { value: 'long', label: 'Long (300-500 words)' },
    { value: 'detailed', label: 'Detailed (500+ words)' },
  ],
  personalization: [
    { value: 'name', label: 'Recipient Name' },
    { value: 'company', label: 'Company Name' },
    { value: 'email', label: 'Email Address' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'sender_name', label: 'Sender Name' },
    { value: 'sender_company', label: 'Sender Company' },
    { value: 'sender_position', label: 'Sender Position' },
  ],
  includeElements: [
    { value: 'social-links', label: 'Social Media Links' },
    { value: 'testimonial', label: 'Testimonial/Quote' },
    { value: 'statistics', label: 'Statistics/Numbers' },
    { value: 'product-image', label: 'Product Image Placeholder' },
    { value: 'video-thumbnail', label: 'Video Thumbnail' },
    { value: 'countdown', label: 'Countdown Timer Placeholder' },
    { value: 'bullet-points', label: 'Bullet Points/List' },
    { value: 'price-table', label: 'Price/Comparison Table' },
    { value: 'faq', label: 'FAQ Section' },
    { value: 'contact-info', label: 'Contact Information' },
  ],
}

// Default values
const DEFAULT_DESIGN_SPEC: AIEmailDesignSpec = {
  layout: 'single-column',
  colorScheme: 'light',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  fontFamily: 'arial',
  fontSize: 'medium',
  headerStyle: 'centered',
  footerStyle: 'simple',
  buttonStyle: 'rounded',
  imagePosition: 'top',
  spacing: 'normal',
  borderStyle: 'none',
  shadowStyle: 'subtle',
  responsiveDesign: true,
  darkModeSupport: false,
}

const DEFAULT_EMAIL_PURPOSE: AIEmailPurpose = {
  emailType: 'promotional',
  industry: 'technology',
  targetAudience: 'b2b-managers',
  primaryGoal: 'drive-sales',
  callToAction: 'learn-more',
  urgencyLevel: 'none',
  personalization: ['name', 'company'],
  language: 'indonesian',
  writingStyle: 'professional',
  tone: 'friendly',
  formality: 'neutral',
  contentLength: 'medium',
  includeElements: ['social-links'],
}

type Section = 'design' | 'purpose' | 'notes' | 'result'

export default function AIEmailPage() {
  const [currentSection, setCurrentSection] = useState<Section>('design')
  const [designSpec, setDesignSpec] = useState<AIEmailDesignSpec>(DEFAULT_DESIGN_SPEC)
  const [emailPurpose, setEmailPurpose] = useState<AIEmailPurpose>(DEFAULT_EMAIL_PURPOSE)
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationId, setGenerationId] = useState<string | null>(null)
  const [generatedSubject, setGeneratedSubject] = useState<string | null>(null)
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Usage/quota state
  const [tier, setTier] = useState<string>('free')
  const [remainingGenerations, setRemainingGenerations] = useState(0)
  const [maxGenerations, setMaxGenerations] = useState(0)
  const [isLoadingUsage, setIsLoadingUsage] = useState(true)

  // Dialog state
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // History state
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Fetch usage/quota on mount
  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      setIsLoadingUsage(true)
      const res = await fetch('/api/organization/usage')
      const data = await res.json()
      if (data.data) {
        setTier(data.data.tier)
        setRemainingGenerations(data.data.remainingAIGenerations || 0)
        setMaxGenerations(data.data.limits?.maxAIGenerationsPerDay || 0)
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    } finally {
      setIsLoadingUsage(false)
    }
  }

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true)
      const res = await fetch('/api/ai-email/history')
      const data = await res.json()
      setHistory(data.data || [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setLogoUrl(null)
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return logoUrl

    try {
      const formData = new FormData()
      formData.append('file', logoFile)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.url) {
        setLogoUrl(data.url)
        return data.url
      }
      return null
    } catch (error) {
      console.error('Failed to upload logo:', error)
      return null
    }
  }

  const handleGenerate = async () => {
    if (tier === 'free' || maxGenerations === 0) {
      return
    }

    if (remainingGenerations <= 0) {
      setGenerationError('Daily generation quota exceeded')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setCurrentSection('result')

    try {
      // Upload logo first if present
      let uploadedLogoUrl = logoUrl
      if (logoFile && !logoUrl) {
        uploadedLogoUrl = await uploadLogo()
      }

      const res = await fetch('/api/ai-email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designSpec,
          emailPurpose,
          additionalNotes: additionalNotes || undefined,
          logoUrl: uploadedLogoUrl || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate email')
      }

      setGenerationId(data.data.id)
      setGeneratedSubject(data.data.subject)
      setGeneratedHtml(data.data.html)
      setRemainingGenerations(data.data.remaining)
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate email')
      setCurrentSection('notes')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async (editFirst: boolean) => {
    setShowRegenerateDialog(false)
    if (editFirst) {
      setCurrentSection('design')
    } else {
      await handleGenerate()
    }
  }

  const handleSave = async () => {
    if (!generationId || !templateName.trim()) return

    setIsSaving(true)
    try {
      const res = await fetch('/api/ai-email/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId,
          templateName: templateName.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save template')
      }

      setShowSaveDialog(false)
      setTemplateName('')
      // Redirect to templates page
      window.location.href = `/app/templates/${data.data.templateId}`
    } catch (error) {
      console.error('Failed to save:', error)
      setGenerationError(error instanceof Error ? error.message : 'Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const loadFromHistory = (item: any) => {
    setDesignSpec(item.design_spec)
    setEmailPurpose(item.email_purpose)
    setAdditionalNotes(item.additional_notes || '')
    setLogoUrl(item.logo_url)
    if (item.generated_html) {
      setGenerationId(item.id)
      setGeneratedSubject(item.generated_subject)
      setGeneratedHtml(item.generated_html)
      setCurrentSection('result')
    }
    setShowHistory(false)
  }

  // Free tier - show upgrade message
  if (!isLoadingUsage && tier === 'free') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">AI Email Generator</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Generate professional email templates with AI
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto mt-12">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Upgrade to Use AI Email Generator
            </h2>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              AI Email Generator is available on Basic plan and above. Upgrade your subscription to access this feature and generate professional email templates with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" asChild>
                <a href="/#pricing">View Plans</a>
              </Button>
              <Button asChild>
                <a href="/subscribe/basic">
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade Now
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">AI Email Generator</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Generate professional email templates with AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quota indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              {remainingGenerations}/{maxGenerations} generations left today
            </span>
          </div>
          {/* History button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowHistory(true)
              fetchHistory()
            }}
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {(['design', 'purpose', 'notes', 'result'] as Section[]).map((section, index) => (
          <div key={section} className="flex items-center">
            <button
              onClick={() => {
                if (section === 'result' && !generatedHtml) return
                setCurrentSection(section)
              }}
              disabled={section === 'result' && !generatedHtml}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                currentSection === section
                  ? 'bg-blue-600 text-white'
                  : section === 'result' && !generatedHtml
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {section === 'design' && <Palette className="h-4 w-4" />}
              {section === 'purpose' && <Target className="h-4 w-4" />}
              {section === 'notes' && <FileText className="h-4 w-4" />}
              {section === 'result' && <Sparkles className="h-4 w-4" />}
              <span className="text-sm font-medium capitalize">{section}</span>
            </button>
            {index < 3 && (
              <ChevronRight className="h-4 w-4 mx-2 text-neutral-400" />
            )}
          </div>
        ))}
      </div>

      {/* Design Specification Section */}
      {currentSection === 'design' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-600" />
              Design Specification
            </CardTitle>
            <CardDescription>
              Configure the visual design of your email template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo (Optional)</Label>
              <div className="flex items-start gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-20 w-auto max-w-40 object-contain border rounded-lg p-2"
                    />
                    <button
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-40 h-20 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="h-6 w-6 text-neutral-400" />
                    <span className="text-xs text-neutral-500 mt-1">Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Layout & Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Layout</Label>
                <Select
                  value={designSpec.layout}
                  onValueChange={(v) => setDesignSpec({ ...designSpec, layout: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_OPTIONS.layout.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select
                  value={designSpec.colorScheme}
                  onValueChange={(v) => setDesignSpec({ ...designSpec, colorScheme: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_OPTIONS.colorScheme.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={designSpec.primaryColor}
                    onChange={(e) => setDesignSpec({ ...designSpec, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={designSpec.primaryColor}
                    onChange={(e) => setDesignSpec({ ...designSpec, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    placeholder="#2563eb"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={designSpec.secondaryColor}
                    onChange={(e) => setDesignSpec({ ...designSpec, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={designSpec.secondaryColor}
                    onChange={(e) => setDesignSpec({ ...designSpec, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    placeholder="#64748b"
                  />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={designSpec.fontFamily}
                  onValueChange={(v) => setDesignSpec({ ...designSpec, fontFamily: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_OPTIONS.fontFamily.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select
                  value={designSpec.fontSize}
                  onValueChange={(v) => setDesignSpec({ ...designSpec, fontSize: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_OPTIONS.fontSize.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Header & Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Header Style</Label>
                <Select
                  value={designSpec.headerStyle}
                  onValueChange={(v) => setDesignSpec({ ...designSpec, headerStyle: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_OPTIONS.headerStyle.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Footer Style</Label>
                <Select
                  value={designSpec.footerStyle}
                  onValueChange={(v) => setDesignSpec({ ...designSpec, footerStyle: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_OPTIONS.footerStyle.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Button & Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Button Style</Label>
                <Select
                  value={designSpec.buttonStyle}
                  onValueChange={(v) => setDesignSpec({ ...designSpec, buttonStyle: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_OPTIONS.buttonStyle.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Image Position</Label>
                <Select
                  value={designSpec.imagePosition}
                  onValueChange={(v) => setDesignSpec({ ...designSpec, imagePosition: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_OPTIONS.imagePosition.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Spacing & Borders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Spacing</Label>
                <Select
                  value={designSpec.spacing}
                  onValueChange={(v) => setDesignSpec({ ...designSpec, spacing: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_OPTIONS.spacing.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Border Style</Label>
                <Select
                  value={designSpec.borderStyle}
                  onValueChange={(v) => setDesignSpec({ ...designSpec, borderStyle: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_OPTIONS.borderStyle.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Shadow Style</Label>
                <Select
                  value={designSpec.shadowStyle}
                  onValueChange={(v) => setDesignSpec({ ...designSpec, shadowStyle: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_OPTIONS.shadowStyle.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={designSpec.responsiveDesign}
                  onCheckedChange={(v) =>
                    setDesignSpec({ ...designSpec, responsiveDesign: v === true })
                  }
                />
                <span className="text-sm">Responsive Design</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={designSpec.darkModeSupport}
                  onCheckedChange={(v) =>
                    setDesignSpec({ ...designSpec, darkModeSupport: v === true })
                  }
                />
                <span className="text-sm">Dark Mode Support</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDesignSpec(DEFAULT_DESIGN_SPEC)}>
                Reset
              </Button>
              <Button onClick={() => setCurrentSection('purpose')}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Purpose Section */}
      {currentSection === 'purpose' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Email Purpose
            </CardTitle>
            <CardDescription>
              Define the content and objective of your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Type & Industry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Type</Label>
                <Select
                  value={emailPurpose.emailType}
                  onValueChange={(v) => setEmailPurpose({ ...emailPurpose, emailType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.emailType.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Industry</Label>
                <Select
                  value={emailPurpose.industry}
                  onValueChange={(v) => setEmailPurpose({ ...emailPurpose, industry: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.industry.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Audience & Goal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={emailPurpose.targetAudience}
                  onValueChange={(v) => setEmailPurpose({ ...emailPurpose, targetAudience: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.targetAudience.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Primary Goal</Label>
                <Select
                  value={emailPurpose.primaryGoal}
                  onValueChange={(v) => setEmailPurpose({ ...emailPurpose, primaryGoal: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.primaryGoal.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CTA & Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Call to Action</Label>
                <Select
                  value={emailPurpose.callToAction}
                  onValueChange={(v) => setEmailPurpose({ ...emailPurpose, callToAction: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.callToAction.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Urgency Level</Label>
                <Select
                  value={emailPurpose.urgencyLevel}
                  onValueChange={(v) => setEmailPurpose({ ...emailPurpose, urgencyLevel: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.urgencyLevel.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Language & Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={emailPurpose.language}
                  onValueChange={(v) => setEmailPurpose({ ...emailPurpose, language: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.language.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Writing Style</Label>
                <Select
                  value={emailPurpose.writingStyle}
                  onValueChange={(v) => setEmailPurpose({ ...emailPurpose, writingStyle: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.writingStyle.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tone & Formality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select
                  value={emailPurpose.tone}
                  onValueChange={(v) => setEmailPurpose({ ...emailPurpose, tone: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.tone.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Formality</Label>
                <Select
                  value={emailPurpose.formality}
                  onValueChange={(v) => setEmailPurpose({ ...emailPurpose, formality: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.formality.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content Length */}
            <div className="space-y-2">
              <Label>Content Length</Label>
              <Select
                value={emailPurpose.contentLength}
                onValueChange={(v) => setEmailPurpose({ ...emailPurpose, contentLength: v })}
              >
                <SelectTrigger className="max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSE_OPTIONS.contentLength.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Personalization Fields */}
            <div className="space-y-2">
              <Label>Personalization Fields</Label>
              <p className="text-xs text-neutral-500 mb-2">
                Select placeholders to include in the email (e.g., {`{{name}}`})
              </p>
              <div className="flex flex-wrap gap-3">
                {PURPOSE_OPTIONS.personalization.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={emailPurpose.personalization.includes(opt.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEmailPurpose({
                            ...emailPurpose,
                            personalization: [...emailPurpose.personalization, opt.value],
                          })
                        } else {
                          setEmailPurpose({
                            ...emailPurpose,
                            personalization: emailPurpose.personalization.filter(
                              (v) => v !== opt.value
                            ),
                          })
                        }
                      }}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Include Elements */}
            <div className="space-y-2">
              <Label>Include Elements</Label>
              <p className="text-xs text-neutral-500 mb-2">
                Select additional elements to include in the email
              </p>
              <div className="flex flex-wrap gap-3">
                {PURPOSE_OPTIONS.includeElements.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={emailPurpose.includeElements.includes(opt.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEmailPurpose({
                            ...emailPurpose,
                            includeElements: [...emailPurpose.includeElements, opt.value],
                          })
                        } else {
                          setEmailPurpose({
                            ...emailPurpose,
                            includeElements: emailPurpose.includeElements.filter(
                              (v) => v !== opt.value
                            ),
                          })
                        }
                      }}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setCurrentSection('design')}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button onClick={() => setCurrentSection('notes')}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Notes Section */}
      {currentSection === 'notes' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Additional Notes
            </CardTitle>
            <CardDescription>
              Add any specific instructions or details for the AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Additional Instructions (Optional)</Label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value.slice(0, 100))}
                placeholder="e.g., Include company name 'TechCorp' in the header, mention 20% discount..."
                className="w-full h-32 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
              <p className="text-xs text-neutral-500 text-right">
                {additionalNotes.length}/100 characters
              </p>
            </div>

            {generationError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{generationError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setCurrentSection('purpose')}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || remainingGenerations <= 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Section */}
      {currentSection === 'result' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Generated Email
            </CardTitle>
            <CardDescription>
              Preview and save your AI-generated email template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-neutral-600 font-medium">Generating your email...</p>
                <p className="text-sm text-neutral-500 mt-1">This may take a few moments</p>
              </div>
            ) : generatedHtml ? (
              <>
                {/* Subject */}
                <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <div className="p-3 bg-neutral-50 rounded-lg border">
                    <p className="font-medium">{generatedSubject}</p>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Email Preview</Label>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <iframe
                      srcDoc={generatedHtml}
                      className="w-full h-[600px] border-0"
                      title="Email Preview"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowRegenerateDialog(true)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button onClick={() => setShowSaveDialog(true)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save as Template
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No email generated yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setCurrentSection('notes')}
                >
                  Go Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Regenerate Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Email</DialogTitle>
            <DialogDescription>
              Would you like to edit the specifications first or generate a new email with the same settings?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <Button variant="outline" onClick={() => handleRegenerate(true)}>
              Edit Specifications
            </Button>
            <Button onClick={() => handleRegenerate(false)} disabled={remainingGenerations <= 0}>
              Generate New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Enter a name for your email template
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Template Name</Label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Promotional Email - January Sale"
              className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!templateName.trim() || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generation History</DialogTitle>
            <DialogDescription>
              View and restore your recent email generations (last 7 days)
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No generation history found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">
                          {item.generated_subject || 'Untitled'}
                        </p>
                        <p className="text-sm text-neutral-500 mt-1">
                          {item.email_purpose?.emailType} • {item.email_purpose?.language}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400 ml-4">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
