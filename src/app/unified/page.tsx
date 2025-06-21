// 📁 /app/unified/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Zap, Loader2, MessageCircle, GitBranch } from 'lucide-react'
import Link from 'next/link'
import MemoryCard from '@/components/MemoryCard'
import BlueprintTimeline from '@/components/BlueprintTimeline'

interface MemoryResult {
  id: string
  content: string
  source: string
  title: string
  timestamp?: string
  score: number
}

interface BlueprintStep {
  step: number
  tool: string
  action: string
  note: string
}

interface UnifiedResult {
  memories: MemoryResult[]
  blueprint: BlueprintStep[]
  analysis: {
    contentType: string
    confidence: number
    insights: string[]
  }
}

export default function UnifiedPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<UnifiedResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('memories')

  const handleProcess = async () => {
    if (!input.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/echoes-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input })
      })
      
      const data = await response.json()
      setResult(data)
      
      // Auto-switch to first tab with results
      if (data.memories?.length > 0) {
        setActiveTab('memories')
      } else if (data.blueprint?.length > 0) {
        setActiveTab('blueprint')
      }
    } catch (error) {
      console.error('Processing failed:', error)
      setResult(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const exampleInputs = [
    {
      title: "Query Past Content",
      content: "What did I say about work-life balance?",
      type: "query"
    },
    {
      title: "Analyze Tweet Thread",
      content: "🧵 My 5 rules for remote work:\n\n1/ Set boundaries\n2/ Over-communicate\n3/ Create rituals\n4/ Stay visible\n5/ Invest in your setup",
      type: "content"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Zap className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Unified Mode</h1>
            <p className="text-xl text-slate-300">
              Memory search + Blueprint analysis in one powerful interface
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Input</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter a query or paste content for full analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about your past content OR paste content to analyze..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[200px] resize-none"
                />
                
                <Button
                  onClick={handleProcess}
                  disabled={!input.trim() || isProcessing}
                  className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Full Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Try These Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exampleInputs.map((example, index) => (
                    <div key={index} className="border border-slate-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{example.title}</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setInput(example.content)}
                          className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                        >
                          Use
                        </Button>
                      </div>
                      <p className="text-sm text-slate-400 truncate">
                        {example.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {isProcessing && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-400 mr-3" />
                  <div className="text-center">
                    <p className="text-slate-300 font-medium">Processing with full analysis...</p>
                    <p className="text-slate-500 text-sm mt-1">Searching memories and generating blueprint</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && !isProcessing && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Analysis Results</CardTitle>
                {result.analysis && (
                  <CardDescription className="text-slate-400">
                    {result.analysis.contentType} • {result.analysis.confidence}% confidence
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                    <TabsTrigger 
                      value="memories" 
                      className="data-[state=active]:bg-purple-600 flex items-center"
                      disabled={!result.memories?.length}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Memories ({result.memories?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="blueprint" 
                      className="data-[state=active]:bg-green-600 flex items-center"
                      disabled={!result.blueprint?.length}
                    >
                      <GitBranch className="h-4 w-4 mr-2" />
                      Blueprint ({result.blueprint?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="insights" 
                      className="data-[state=active]:bg-yellow-600 flex items-center"
                      disabled={!result.analysis?.insights?.length}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Insights ({result.analysis?.insights?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="memories" className="mt-6">
                    {result.memories?.length > 0 ? (
                      <div className="space-y-4">
                        {result.memories.map((memory) => (
                          <MemoryCard key={memory.id} memory={memory} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">No matching memories found</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="blueprint" className="mt-6">
                    {result.blueprint?.length > 0 ? (
                      <BlueprintTimeline steps={result.blueprint} />
                    ) : (
                      <div className="text-center py-8">
                        <GitBranch className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">No blueprint generated</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="insights" className="mt-6">
                    {result.analysis?.insights?.length > 0 ? (
                      <div className="space-y-4">
                        {result.analysis.insights.map((insight, index) => (
                          <Card key={index} className="bg-slate-700/50 border-slate-600">
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <div className="bg-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold mt-1">
                                  {index + 1}
                                </div>
                                <p className="text-slate-300">{insight}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Zap className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">No insights generated</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {!result && !isProcessing && (
            <Card className="bg-slate-800/30 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Ready for Full Analysis</h3>
                  <p className="text-slate-400">
                    Enter your input above to get memories, blueprint, and insights
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}