// 📁 /app/ask/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, Loader2, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import MemoryCard from '@/components/MemoryCard'
import SearchInput from '@/components/SearchInput'

interface MemoryResult {
  id: string
  content: string
  source: string
  title: string
  timestamp?: string
  score: number
}

export default function AskPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MemoryResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setQuery(searchQuery)

    try {
      const response = await fetch(`/api/ask?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      setResults(data.results || [])
      setSearchHistory(prev => [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 5))
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const suggestedQueries = [
    "When did I talk about burnout?",
    "What metaphors did I use for motivation?",
    "Show me content about productivity",
    "What did I say about remote work?",
    "Find my thoughts on AI and creativity"
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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <MessageCircle className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Ask Your Past Self</h1>
            <p className="text-xl text-slate-300">
              Query your uploaded content with natural language
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardContent className="pt-6">
              <SearchInput
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                isSearching={isSearching}
                placeholder="Ask anything about your past content..."
              />
            </CardContent>
          </Card>

          {searchHistory.length > 0 && (
            <Card className="bg-slate-800/30 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white text-lg">Recent Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearch(search)}
                      className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!query && (
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Try These Questions</CardTitle>
                <CardDescription className="text-slate-400">
                  Get started with these example queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {suggestedQueries.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="justify-start text-left h-auto p-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300"
                      onClick={() => handleSearch(suggestion)}
                    >
                      <MessageCircle className="h-4 w-4 mr-3 text-purple-400 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isSearching && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400 mr-3" />
                  <span className="text-slate-300">Searching your memory...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && !isSearching && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Results for "{query}"
                </h2>
                <span className="text-slate-400">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </span>
              </div>

              <div className="grid gap-4">
                {results.map((result) => (
                  <MemoryCard key={result.id} memory={result} />
                ))}
              </div>
            </div>
          )}

          {results.length === 0 && query && !isSearching && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                  <p className="text-slate-400 mb-4">
                    We couldn't find any content matching "{query}"
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setQuery('')}
                    className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                  >
                    Try Another Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}