// 📁 /app/upload/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Upload, Link as LinkIcon, FileText, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import UploadWidget from '@/components/UploadWidget'

export default function UploadPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [title, setTitle] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'url',
          content: urlInput,
          title: title || 'Untitled URL Content'
        })
      })
      const result = await response.json()

      if (result.success) {
        // Show success message
        setUploadSuccess(result.title)
        setUrlInput('')
        setTitle('')

        // Auto redirect after showing success
        setTimeout(() => {
          if (confirm('Would you like to go to the Ask page to search your uploaded content?')) {
            window.location.href = '/ask'
          }
        }, 3000)
      } else {
        throw new Error(result.details || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'text',
          content: textInput,
          title: title || 'Untitled Text Content'
        })
      })
      const result = await response.json()

      if (result.success) {
        // Show success message
        setUploadSuccess(result.title)
        setTextInput('')
        setTitle('')

        // Auto redirect after showing success
        setTimeout(() => {
          if (confirm('Would you like to go to the Ask page to search your uploaded content?')) {
            window.location.href = '/ask'
          }
        }, 3000)
      } else {
        throw new Error(result.details || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Upload Your Content</h1>
            <p className="text-xl text-slate-300">
              Upload videos, podcasts, blog posts, or paste content directly
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Choose Upload Method</CardTitle>
              <CardDescription className="text-slate-400">
                Select how you'd like to add content to your Echoes OS memory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                  <TabsTrigger value="file" className="data-[state=active]:bg-purple-600">
                    <Upload className="h-4 w-4 mr-2" />
                    File Upload
                  </TabsTrigger>
                  <TabsTrigger value="url" className="data-[state=active]:bg-purple-600">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    URL/Link
                  </TabsTrigger>
                  <TabsTrigger value="text" className="data-[state=active]:bg-purple-600">
                    <FileText className="h-4 w-4 mr-2" />
                    Text/Paste
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="mt-6">
                  <UploadWidget />
                </TabsContent>

                <TabsContent value="url" className="mt-6">
                  <form onSubmit={handleUrlSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Content Title (Optional)
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., My Podcast Episode on AI"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        URL or Link
                      </label>
                      <Input
                        type="url"
                        placeholder="https://example.com/my-content"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing URL...
                        </>
                      ) : (
                        'Process URL'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="text" className="mt-6">
                  <form onSubmit={handleTextSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Content Title (Optional)
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., Blog Post About Productivity"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Content Text
                      </label>
                      <Textarea
                        placeholder="Paste your blog post, tweet thread, or any text content here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[200px]"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Process Text'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardContent className="pt-6">
                <Upload className="h-8 w-8 text-purple-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Supported Files</h3>
                <p className="text-sm text-slate-400">
                  MP4, MP3, WAV, PDF, TXT and more
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/30 border-slate-700">
              <CardContent className="pt-6">
                <LinkIcon className="h-8 w-8 text-blue-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">URL Support</h3>
                <p className="text-sm text-slate-400">
                  YouTube, Podcast platforms, blogs
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/30 border-slate-700">
              <CardContent className="pt-6">
                <FileText className="h-8 w-8 text-green-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Direct Text</h3>
                <p className="text-sm text-slate-400">
                  Paste articles, tweets, notes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}