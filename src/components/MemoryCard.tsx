// 📁 /components/MemoryCard.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, Video, Headphones, Link as LinkIcon, Clock, TrendingUp, ExternalLink, Search } from 'lucide-react'

interface MemoryResult {
  id: string
  content: string
  source: string
  title: string
  timestamp?: string
  score: number
}

interface MemoryCardProps {
  memory: MemoryResult
  onFindRelated?: (memory: MemoryResult) => void
}

export default function MemoryCard({ memory, onFindRelated }: MemoryCardProps) {
  const [isFullDialogOpen, setIsFullDialogOpen] = useState(false)

  const getSourceIcon = (source: string) => {
    if (source.includes('video') || source.includes('mp4') || source.includes('youtube')) {
      return <Video className="h-4 w-4" />
    } else if (source.includes('audio') || source.includes('podcast')) {
      return <Headphones className="h-4 w-4" />
    } else if (source.includes('http')) {
      return <LinkIcon className="h-4 w-4" />
    } else {
      return <FileText className="h-4 w-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score > 0.8) return 'bg-green-600'
    if (score > 0.6) return 'bg-yellow-600'
    return 'bg-slate-600'
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return null

    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return timestamp
    }
  }

  const handleViewFull = () => {
    setIsFullDialogOpen(true)
  }

  const handleFindRelated = () => {
    if (onFindRelated) {
      onFindRelated(memory)
    } else {
      // Default behavior - search for related content based on title
      const searchQuery = memory.title.split(' ').slice(0, 3).join(' ')
      window.location.href = `/ask?query=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleSourceClick = () => {
    if (memory.source.startsWith('http')) {
      window.open(memory.source, '_blank')
    }
  }

  const getContentPreview = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              {getSourceIcon(memory.source)}
              <h3 className="font-semibold text-white truncate">{memory.title}</h3>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge
                variant="secondary"
                className={`${getScoreColor(memory.score)} text-white text-xs`}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {Math.round(memory.score * 100)}%
              </Badge>
              {memory.timestamp && (
                <Badge variant="outline" className="text-slate-400 border-slate-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimestamp(memory.timestamp)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-slate-300 leading-relaxed">
              {getContentPreview(memory.content)}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {getSourceIcon(memory.source)}
                <span
                  className={`truncate max-w-[200px] ${memory.source.startsWith('http') ? 'cursor-pointer hover:text-slate-400' : ''}`}
                  onClick={handleSourceClick}
                >
                  {memory.source}
                </span>
                {memory.source.startsWith('http') && (
                  <ExternalLink className="h-3 w-3" />
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewFull}
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                >
                  View Full
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFindRelated}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                >
                  Related
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Content Dialog */}
      <Dialog open={isFullDialogOpen} onOpenChange={setIsFullDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {getSourceIcon(memory.source)}
              {memory.title}
            </DialogTitle>
            <div className="text-slate-400 text-sm mt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{Math.round(memory.score * 100)}% match</span>
                </div>
                {memory.timestamp && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimestamp(memory.timestamp)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {getSourceIcon(memory.source)}
                  <span
                    className={`truncate max-w-[300px] ${memory.source.startsWith('http') ? 'cursor-pointer hover:text-slate-300' : ''}`}
                    onClick={handleSourceClick}
                  >
                    {memory.source}
                  </span>
                  {memory.source.startsWith('http') && (
                    <ExternalLink className="h-3 w-3" />
                  )}
                </div>
              </div>
            </div>

          </DialogHeader>
          <div className="mt-4">
            <div className="bg-slate-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {memory.content}
              </pre>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={handleFindRelated}
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <Search className="h-4 w-4 mr-2" />
                Find Related Content
              </Button>
              {memory.source.startsWith('http') && (
                <Button
                  onClick={handleSourceClick}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original Source
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}