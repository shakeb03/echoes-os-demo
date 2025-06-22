'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GitBranch, Lightbulb, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import MemoryCard from '@/components/MemoryCard';

export default function BlueprintPage() {
  const [content, setContent] = useState('')
  const [stepOnePrompts, setStepOnePrompts] = useState<string[]>([])
  const [stepTwoPrompt, setStepTwoPrompt] = useState('')
  const [isLoadingStep1, setIsLoadingStep1] = useState(false)
  const [isLoadingStep2, setIsLoadingStep2] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [title, setTitle] = useState('')
  const [topics, setTopics] = useState('')
  const [context, setContext] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [showModal, setShowModal] = useState(false)

  const handleStepOne = async () => {
    setIsLoadingStep1(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 1, content }),
      })
      const data = await res.json()
      setStepOnePrompts(data.prompts)
    } catch (error) {
      console.error('Error in Step 1:', error)
    } finally {
      setIsLoadingStep1(false)
    }
  }

  const handleStepTwo = async () => {
    if (!stepOnePrompts.length || !title || !topics || !context) return
    setIsLoadingStep2(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 2,
          content: 'placeholder',
          basePrompts: stepOnePrompts,
          title,
          topics,
          context,
        }),
      })
      const data = await res.json()
      setStepTwoPrompt(data.finalPrompt)
    } catch (error) {
      console.error('Error in Step 2:', error)
    } finally {
      setIsLoadingStep2(false)
    }
  }

  const handleGenerateContent = async () => {
    if (!stepTwoPrompt) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: stepTwoPrompt }),
      })
      const data = await res.json()
      setGeneratedContent(data.output || 'No content returned.')
      setShowModal(true)
    } catch (error) {
      console.error('Error generating content:', error)
      setGeneratedContent('Failed to generate content.')
      setShowModal(true)
    } finally {
      setIsGenerating(false)
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

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <GitBranch className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Rebuild Your Creative Process</h1>
            <p className="text-xl text-slate-300">Uncover the prompts and steps that built your content</p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Step 1: Deconstruct Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste blog post, tweet thread, or podcast transcript..."
                className="min-h-[140px] text-white text-slate-300"
              />
              <Button onClick={handleStepOne} disabled={isLoadingStep1} className="w-full">
                {isLoadingStep1 ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Generate Reverse Prompts'}
              </Button>

              {stepOnePrompts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-300">Generated Prompts:</p>
                  <ul className="space-y-1">
                    {stepOnePrompts.map((prompt, i) => (
                      <li key={i} className="bg-slate-700/50 hover:bg-slate-700 px-3 py-2 rounded text-sm text-slate-300 text-white">{prompt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {stepOnePrompts.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Step 2: Guided Prompt Creation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-white text-slate-300">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New Title" />
                <Input value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Topics (comma separated)" />
                <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Context or creative goal" />
                <Button onClick={handleStepTwo} disabled={isLoadingStep2} className="w-full">
                  {isLoadingStep2 ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Generate Final Prompt'}
                </Button>

                {stepTwoPrompt && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Final Compositional Prompt:</p>
                      <div className="bg-slate-700 px-3 py-2 rounded text-sm text-slate-100 whitespace-pre-wrap">
                        {stepTwoPrompt}
                      </div>
                    </div>
                    <Button onClick={handleGenerateContent} disabled={isGenerating} className="w-full bg-purple-600 hover:bg-purple-700">
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        'Generate My Content'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Output Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
  <DialogContent
    className="max-w-2xl bg-slate-800 border-slate-700 p-6"
    style={{ maxHeight: '80vh', overflowY: 'auto' }}
  >
    <DialogHeader>
      <DialogTitle className="text-white">Your AI-Generated Content</DialogTitle>
    </DialogHeader>

    <div
      className="mt-4 rounded bg-slate-700 text-sm text-slate-300 whitespace-pre-wrap p-4"
      style={{ maxHeight: '60vh', overflowY: 'auto' }}
    >
      {generatedContent}
    </div>
  </DialogContent>
</Dialog>
    </div>
  )
}
