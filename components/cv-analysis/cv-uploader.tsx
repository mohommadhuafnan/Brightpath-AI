"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, Upload, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CVUploaderProps {
  userId: string
  existingCv: any | null
}

export function CVUploader({ userId, existingCv }: CVUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (selectedFile: File) => {
    setError(null)
    
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ]
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOC, DOCX, or TXT file")
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", userId)

      // Call API to analyze CV
      setIsAnalyzing(true)
      const response = await fetch("/api/cv/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze CV")
      }

      const data = await response.json()

      // Refresh the page to show results
      router.refresh()
      setFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Your CV
        </CardTitle>
        <CardDescription>
          Upload your resume in PDF, DOC, DOCX, or TXT format for AI analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!file ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
            `}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">
              {dragActive ? "Drop your file here" : "Drag and drop your CV"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, DOC, DOCX, TXT (max 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing your CV with AI...</span>
                </div>
                <Progress value={66} className="h-2" />
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={isUploading || isAnalyzing}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isAnalyzing ? "Analyzing..." : "Uploading..."}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze CV
                </>
              )}
            </Button>
          </div>
        )}

        {existingCv && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Previous CV analyzed</span>
            </div>
            <p className="text-sm">
              <span className="font-medium">{existingCv.file_name}</span>
              <span className="text-muted-foreground ml-2">
                ({new Date(existingCv.created_at).toLocaleDateString()})
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
