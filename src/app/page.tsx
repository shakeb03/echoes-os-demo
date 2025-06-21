// 📁 /app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, MessageCircle, GitBranch, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            Echoes <span className="text-purple-400">OS</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Your AI memory + workflow historian. Upload past content, query your creative patterns, 
            and reconstruct the workflow that produced your best work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <Upload className="h-8 w-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Upload Content</CardTitle>
              <CardDescription className="text-slate-400">
                Videos, podcasts, blogs, tweets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/upload">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Start Upload
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Ask Your Past</CardTitle>
              <CardDescription className="text-slate-400">
                Query your content with natural language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/ask">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Ask Question
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <GitBranch className="h-8 w-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Blueprint Mode</CardTitle>
              <CardDescription className="text-slate-400">
                Reconstruct creative workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/blueprint">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Analyze Process
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <Zap className="h-8 w-8 text-yellow-400 mb-2" />
              <CardTitle className="text-white">Unified Mode</CardTitle>
              <CardDescription className="text-slate-400">
                Memory + Blueprint combined
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/unified">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Full Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Upload & Transcribe</h3>
              <p className="text-slate-400">
                Upload your past content. AI transcribes and embeds everything for search.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Query Your Memory</h3>
              <p className="text-slate-400">
                Ask natural language questions about your past work and ideas.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Reconstruct Process</h3>
              <p className="text-slate-400">
                Discover the creative workflow and tools behind your best content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}