// 📁 /app/blueprint/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export default function BlueprintPage() {
  const [content, setContent] = useState('')
  // stepOnePrompts is correctly initialized as an empty array, so .length is always safe
  const [stepOnePrompts, setStepOnePrompts] = useState<string[]>([])
  const [stepTwoPrompt, setStepTwoPrompt] = useState('')
  const [isLoadingStep1, setIsLoadingStep1] = useState(false)
  const [isLoadingStep2, setIsLoadingStep2] = useState(false)

  const [title, setTitle] = useState('')
  const [topics, setTopics] = useState('')
  const [context, setContext] = useState('')

  const handleStepOne = async () => {
    setIsLoadingStep1(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 1,
          content
        }),
      })

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to generate prompts');
      }

      const data = await res.json()
      setStepOnePrompts(data.prompts)
    } catch (error: any) {
      console.error("Error in Step 1:", error.message);
      // Optionally show a user-friendly error message in the UI
      alert(`Error generating prompts: ${error.message}`);
    } finally {
      setIsLoadingStep1(false)
    }
  }

  const handleStepTwo = async () => {
    if (!stepOnePrompts.length || !title || !topics || !context) {
      alert("All fields are required for Step 2");
      return;
    }
    setIsLoadingStep2(true);
    console.log("Sending Step 2 request with data:");
    console.log("step:", 2);
    console.log("basePrompts:", stepOnePrompts);
    console.log("title:", title);
    console.log("topics:", topics);
    console.log("context:", context);
  
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 2,
          content: 'dummy value',
          basePrompts: stepOnePrompts,
          title,
          topics,
          context,
        }),
      });
  
      console.log("Response status:", res.status);
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to generate final prompt');
      }
  
      const data = await res.json();
      setStepTwoPrompt(data.finalPrompt);
    } catch (error: any) {
      console.error("Error in Step 2:", error.message);
      alert(`Error generating final prompt: ${error.message}`);
    } finally {
      setIsLoadingStep2(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Deconstruct Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste blog post, tweet, podcast transcript..."
          />
          <Button onClick={handleStepOne} disabled={isLoadingStep1}>
            {isLoadingStep1 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate Reverse Prompts'}
          </Button>
          {/* Simplified check: stepOnePrompts is always an array */}
          {stepOnePrompts.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Generated Prompts:</p>
              <ul className="space-y-1">
                {stepOnePrompts.map((prompt, i) => (
                  <li key={i} className="bg-muted px-3 py-2 rounded text-sm">{prompt}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conditionally render Step 2 card only if Step 1 has prompts */}
      {stepOnePrompts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: User-Guided Prompt Creation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <Input value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Topics (comma separated)" />
            <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Context / Goal" />
            <Button onClick={handleStepTwo} disabled={isLoadingStep2}>
              {isLoadingStep2 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate Final Prompt'}
            </Button>
            {stepTwoPrompt && (
              <div className="space-y-2">
                <p className="font-semibold">Final Prompt:</p>
                <div className="bg-muted p-2 rounded text-sm whitespace-pre-wrap">{stepTwoPrompt}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}