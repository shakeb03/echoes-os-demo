// 📁 /components/UploadWidget.tsx
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface UploadedFile {
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  progress: number
  id: string
  title?: string
}

export default function UploadWidget() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0,
      id: Math.random().toString(36).substr(2, 9),
      title: file.name.replace(/\.[^/.]+$/, "")
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const updateFileTitle = (id: string, title: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, title } : f))
  }

  const processFiles = async () => {
    setIsProcessing(true)

    for (const uploadFile of files) {
      if (uploadFile.status !== 'pending') continue

      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 10 } : f
      ))

      try {
        const formData = new FormData()
        formData.append('file', uploadFile.file)
        formData.append('title', uploadFile.title || uploadFile.file.name)

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id && f.progress < 90 
              ? { ...f, progress: f.progress + 10 } 
              : f
          ))
        }, 200)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        clearInterval(progressInterval)

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        // Update to processing
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'processing', progress: 95 } : f
        ))

        const result = await response.json()
        
        // Complete
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'complete', progress: 100 } : f
        ))

      } catch (error) {
        console.error('Upload error:', error)
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'error', progress: 0 } : f
        ))
      }
    }

    setIsProcessing(false)
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return <File className="h-4 w-4 text-slate-400" />
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />
    }
  }

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return 'Ready to upload'
      case 'uploading':
        return 'Uploading...'
      case 'processing':
        return 'Processing with AI...'
      case 'complete':
        return 'Complete!'
      case 'error':
        return 'Error occurred'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-700/50 border-slate-600 border-dashed-2">
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`
              cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
              ${isDragActive 
                ? 'border-purple-400 bg-purple-400/10' 
                : 'border-slate-500 hover:border-slate-400'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            {isDragActive ? (
              <p className="text-purple-400 font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-slate-300 font-medium mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-slate-500 text-sm">
                  Supports audio, video, PDF, and text files
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Files to Process</h3>
          
          {files.map((uploadFile) => (
            <Card key={uploadFile.id} className="bg-slate-700/50 border-slate-600">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(uploadFile.status)}
                    <div className="flex-1">
                      <Input
                        value={uploadFile.title}
                        onChange={(e) => updateFileTitle(uploadFile.id, e.target.value)}
                        className="bg-slate-600 border-slate-500 text-white text-sm"
                        placeholder="Enter content title..."
                        disabled={uploadFile.status !== 'pending'}
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        {uploadFile.file.name} • {(uploadFile.file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  {uploadFile.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {uploadFile.status !== 'pending' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        {getStatusText(uploadFile.status)}
                      </span>
                      <span className="text-sm text-slate-400">
                        {uploadFile.progress}%
                      </span>
                    </div>
                    <Progress 
                      value={uploadFile.progress} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={processFiles}
            disabled={isProcessing || files.every(f => f.status !== 'pending')}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Files...
              </>
            ) : (
              `Process ${files.filter(f => f.status === 'pending').length} File(s)`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}