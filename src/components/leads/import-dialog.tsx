'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface ImportResult {
  success: boolean
  imported: number
  total: number
  duplicatesSkipped: number
  errors?: string[]
}

export function ImportDialog({ open, onOpenChange, onSuccess }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls',
    ]

    if (!validTypes.some(type => selectedFile.type.includes(type) || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an Excel file (.xlsx or .xls)',
        variant: 'error',
      })
      return
    }

    setFile(selectedFile)
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult(data)

      if (data.imported > 0) {
        toast({
          title: 'Import successful',
          description: `Successfully imported ${data.imported} leads`,
          variant: 'success',
        })
        onSuccess()
      }
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import leads',
        variant: 'error',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/leads/import')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'leads_template.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Template downloaded',
        description: 'Fill in the template and upload it to import leads',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download template',
        variant: 'error',
      })
    }
  }

  const resetDialog = () => {
    setFile(null)
    setResult(null)
  }

  const handleClose = (open: boolean) => {
    if (!open) resetDialog()
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-success-100 to-success-50">
              <Upload className="h-5 w-5 text-success-600" />
            </div>
            Import Leads from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx) to bulk import leads into your database
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template Button */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-accent-50 to-primary-50 border border-accent-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/80 shadow-sm">
                <FileSpreadsheet className="h-5 w-5 text-accent-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">Need a template?</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Download our Excel template with the correct format
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="shrink-0"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {/* Upload Area */}
          {!result && (
            <div
              className={cn(
                'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
                isDragging
                  ? 'border-primary-400 bg-primary-50'
                  : file
                  ? 'border-success-400 bg-success-50'
                  : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0]
                  if (selectedFile) handleFileSelect(selectedFile)
                }}
                className="hidden"
              />

              {file ? (
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-success-100 flex items-center justify-center">
                    <FileSpreadsheet className="h-6 w-6 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{file.name}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="text-neutral-500"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Upload className={cn(
                      'h-6 w-6 transition-colors',
                      isDragging ? 'text-primary-500' : 'text-neutral-400'
                    )} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      Drag and drop your Excel file here
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      or{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        browse files
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Result */}
          {result && (
            <div className={cn(
              'rounded-xl p-4 border',
              result.imported > 0
                ? 'bg-success-50 border-success-200'
                : 'bg-warning-50 border-warning-200'
            )}>
              <div className="flex items-start gap-3">
                {result.imported > 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-neutral-900">
                    {result.imported > 0 ? 'Import Complete' : 'No leads imported'}
                  </p>
                  <div className="text-xs text-neutral-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-success-500" />
                      <span><strong>{result.imported}</strong> leads imported successfully</span>
                    </p>
                    <p>Total rows processed: {result.total}</p>
                    {result.duplicatesSkipped > 0 && (
                      <p>Duplicates merged: {result.duplicatesSkipped}</p>
                    )}
                  </div>
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-2 p-2 rounded-lg bg-white/60 text-xs">
                      <p className="font-medium text-error-600 mb-1">Errors:</p>
                      <ul className="list-disc list-inside text-neutral-600 space-y-0.5">
                        {result.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                        {result.errors.length > 5 && (
                          <li>...and {result.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              onClick={handleImport}
              disabled={!file || isUploading}
              loading={isUploading}
            >
              <Upload className="h-4 w-4" />
              Import Leads
            </Button>
          )}
          {result && result.imported > 0 && (
            <Button onClick={resetDialog}>
              Import More
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
