// 📁 /components/SearchInput.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2, Mic } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  isSearching?: boolean
  placeholder?: string
}

export default function SearchInput({ 
  value, 
  onChange, 
  onSearch, 
  isSearching = false,
  placeholder = "Search your content..."
}: SearchInputProps) {
  const [isListening, setIsListening] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isSearching) {
      onSearch(value.trim())
    }
  }

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: { results: { transcript: any }[][] }) => {
        const transcript = event.results[0][0].transcript
        onChange(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      alert('Speech recognition not supported in this browser')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-slate-700 border-slate-600 text-white pr-12 text-lg h-12"
            disabled={isSearching}
          />
          
          {/* Voice search button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceSearch}
            disabled={isSearching || isListening}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-400"
          >
            <Mic className={`h-4 w-4 ${isListening ? 'text-red-400 animate-pulse' : ''}`} />
          </Button>
        </div>
        
        <Button
          type="submit"
          disabled={!value.trim() || isSearching}
          className="bg-purple-600 hover:bg-purple-700 h-12 px-6"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <Mic className="h-4 w-4 text-red-400 animate-pulse" />
            <span className="text-sm">Listening...</span>
          </div>
        </div>
      )}
    </form>
  )
}