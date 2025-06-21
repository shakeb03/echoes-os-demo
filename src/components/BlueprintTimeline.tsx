// 📁 /components/BlueprintTimeline.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  PenTool, 
  Lightbulb, 
  MessageSquare, 
  FileText, 
  Settings, 
  Zap,
  Edit,
  Search,
  Share
} from 'lucide-react'

interface BlueprintStep {
  step: number
  tool: string
  action: string
  note: string
}

interface BlueprintTimelineProps {
  steps: BlueprintStep[]
}

export default function BlueprintTimeline({ steps }: BlueprintTimelineProps) {
  const getToolIcon = (tool: string) => {
    const toolLower = tool.toLowerCase()
    
    if (toolLower.includes('notion') || toolLower.includes('obsidian')) {
      return <FileText className="h-5 w-5" />
    } else if (toolLower.includes('chatgpt') || toolLower.includes('claude')) {
      return <MessageSquare className="h-5 w-5" />
    } else if (toolLower.includes('figma') || toolLower.includes('canva')) {
      return <PenTool className="h-5 w-5" />
    } else if (toolLower.includes('research') || toolLower.includes('google')) {
      return <Search className="h-5 w-5" />
    } else if (toolLower.includes('edit') || toolLower.includes('grammarly')) {
      return <Edit className="h-5 w-5" />
    } else if (toolLower.includes('social') || toolLower.includes('twitter')) {
      return <Share className="h-5 w-5" />
    } else if (toolLower.includes('brainstorm') || toolLower.includes('ideation')) {
      return <Lightbulb className="h-5 w-5" />
    } else {
      return <Settings className="h-5 w-5" />
    }
  }

  const getToolColor = (tool: string) => {
    const toolLower = tool.toLowerCase()
    
    if (toolLower.includes('notion') || toolLower.includes('obsidian')) {
      return 'bg-blue-600'
    } else if (toolLower.includes('chatgpt') || toolLower.includes('claude')) {
      return 'bg-purple-600'
    } else if (toolLower.includes('figma') || toolLower.includes('canva')) {
      return 'bg-pink-600'
    } else if (toolLower.includes('research') || toolLower.includes('google')) {
      return 'bg-green-600'
    } else if (toolLower.includes('edit') || toolLower.includes('grammarly')) {
      return 'bg-orange-600'
    } else if (toolLower.includes('social') || toolLower.includes('twitter')) {
      return 'bg-cyan-600'
    } else if (toolLower.includes('brainstorm') || toolLower.includes('ideation')) {
      return 'bg-yellow-600'
    } else {
      return 'bg-slate-600'
    }
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-8">
        <Zap className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-400">No blueprint steps available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.step} className="relative">
          {/* Timeline line */}
          {index < steps.length - 1 && (
            <div className="absolute left-6 top-14 w-0.5 h-8 bg-slate-600" />
          )}
          
          <Card className="bg-slate-700/50 border-slate-600 relative">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Step icon */}
                <div className={`${getToolColor(step.tool)} rounded-full p-2 text-white flex-shrink-0`}>
                  {getToolIcon(step.tool)}
                </div>
                
                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-slate-400 border-slate-600">
                      Step {step.step}
                    </Badge>
                    <Badge className={`${getToolColor(step.tool)} text-white`}>
                      {step.tool}
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold text-white mb-1">
                    {step.action}
                  </h4>
                  
                  {step.note && (
                    <p className="text-slate-400 text-sm">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}