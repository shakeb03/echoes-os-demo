// 📁 /components/MemoryCard.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Video, Headphones, Link as LinkIcon, Clock, TrendingUp } from 'lucide-react'

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
}

export default function MemoryCard({ memory }: MemoryCardProps) {
  const getSourceIcon = (source: string) => {
    if (source.includes('video') || source.includes('mp4')) {
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

  return (
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
            {memory.content}
          </p>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {getSourceIcon(memory.source)}
              <span className="truncate max-w-[200px]">{memory.source}</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
              >
                View Full
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
              >
                Related
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}