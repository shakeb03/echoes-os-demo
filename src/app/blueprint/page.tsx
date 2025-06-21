// 📁 /app/blueprint/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, GitBranch, Loader2, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import BlueprintTimeline from '@/components/BlueprintTimeline'

interface BlueprintStep {
  step: number
  tool: string
  action: string
  note: string
}

export default function BlueprintPage() {
  const [content, setContent] = useState('')
  const [blueprint, setBlueprint] = useState<BlueprintStep[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!content.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      
      const data = await response.json()
      setBlueprint(data.blueprint || [])
    } catch (error) {
      console.error('Analysis failed:', error)
      setBlueprint([])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const exampleContent = `Here's a thread I wrote about productivity:

🧵 The 3-layer productivity system I use:

1/ Context switching kills creativity
Most people jump between tasks like ping pong balls
Your brain needs time to load the "context" of each task
Solution: Time-block similar tasks together

2/ Energy management > Time management  
Track when you're most creative vs administrative
Do deep work when your brain is fresh
Save email/calls for low-energy periods

3/ The "Good Enough" principle
Perfectionism is procrastination in disguise
Ship 80% solutions that you can iterate on
Done is better than perfect

What's your biggest productivity challenge?`

  const handleExampleAnalysis = () => {
    setContent(exampleContent)
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
            <GitBranch className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Blueprint Mode</h1>
            <p className="text-xl text-slate-300">
              Reconstruct the creative workflow behind your content
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Input Content</CardTitle>
                  <CardDescription className="text-slate-400">
                    Paste your content to analyze the creative process behind it
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your blog post, tweet thread, or any content here..."
                    className="bg-slate-700 border-slate-600 text-white min-h-[300px] resize-none"
                  />
                  
                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={handleAnalyze}
                      disabled={!content.trim() || isAnalyzing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <GitBranch className="h-4 w-4 mr-2" />
                          Analyze Workflow
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleExampleAnalysis}
                      variant="outline"
                      className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Try Example
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="text-white font-medium">Content Analysis</p>
                        <p className="text-slate-400">AI analyzes structure, tone, and style patterns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="text-white font-medium">Workflow Reconstruction</p>
                        <p className="text-slate-400">Infers likely tools and creative steps</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="text-white font-medium">Process Timeline</p>
                        <p className="text-slate-400">Shows step-by-step creation process</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              {isAnalyzing && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-green-400 mr-3" />
                      <span className="text-slate-300">Analyzing creative workflow...</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {blueprint.length > 0 && !isAnalyzing && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Creative Blueprint</CardTitle>
                    <CardDescription className="text-slate-400">
                      Reconstructed workflow for this content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BlueprintTimeline steps={blueprint} />
                  </CardContent>
                </Card>
              )}

              {blueprint.length === 0 && !isAnalyzing && !content && (
                <Card className="bg-slate-800/30 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <GitBranch className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Ready to Analyze</h3>
                      <p className="text-slate-400">
                        Paste your content to see the creative process behind it
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}