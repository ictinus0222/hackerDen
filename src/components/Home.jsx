import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import FloatingNavbar from './FloatingNavbar';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Clock, 
  Zap,
  MessageSquare,
  Kanban,
  FileText,
  Trophy,
  Shield,
  Smartphone,
  GitBranch,
  Palette,
  Bot,
  Upload,
  Code,
  Play,
  Target,
  Lightbulb,
  Settings,
  Heart,
  Coffee
} from 'lucide-react';

const Home = () => {
  const [activeDemo, setActiveDemo] = useState('kanban');
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingNavbar />
      
      {/* HERO SECTION - Phase 7 Implementation */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-background via-card to-primary/5 text-foreground pt-20">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Built at CodeWithKiro Hackathon
                  </Badge>
                  <Badge variant="secondary" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                    Tested by 100Devs Community
                  </Badge>
                </div>

                {/* Winning Headline */}
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Stop juggling Slack, Trello, and Google Docs. 
                  <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent block mt-2">
                    Start building.
                  </span>
                </h1>

                {/* Supporting Subheadline */}
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                  The all-in-one workspace built by hackers for hackers. Bring your team, tasks, and code together and focus on what matters.
                </p>
              </div>
              
              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-8 py-4"
                  onClick={handleGetStarted}
                >
                  Get Early Access Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust Reinforcement */}
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Free to get started • No credit card required • Live and ready to use
              </p>
            </div>
            
            {/* Hero Visual - Dark Theme Screenshot */}
            <div className="relative">
              <div className="bg-gradient-to-br from-card to-muted rounded-xl p-6 shadow-2xl border">
                <div className="bg-background rounded-lg overflow-hidden">
                  {/* Mock HackerDen Interface */}
                  <div className="bg-card p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <Code className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold">HackerDen</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-destructive rounded-full"></div>
                        <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 h-48">
                    <div className="bg-muted/50 p-3 border-r">
                      <div className="text-xs text-muted-foreground mb-2">TO-DO</div>
                      <div className="space-y-2">
                        <div className="bg-card p-2 rounded text-xs">Setup API endpoints</div>
                        <div className="bg-card p-2 rounded text-xs">Design database schema</div>
                      </div>
                    </div>
                    <div className="bg-primary/5 p-3 border-r">
                      <div className="text-xs text-muted-foreground mb-2">IN PROGRESS</div>
                      <div className="space-y-2">
                        <div className="bg-primary/10 p-2 rounded text-xs border border-primary/20">
                          Build authentication
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3">
                      <div className="text-xs text-muted-foreground mb-2">DONE</div>
                      <div className="space-y-2">
                        <div className="bg-card p-2 rounded text-xs opacity-60">Project setup</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Live Badge */}
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium text-sm">Live & Real-time!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION - Phase 8 Implementation */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              The old way is broken. It's time for a new one.
            </h2>
            <div className="text-xl text-muted-foreground space-y-4">
              <p>
                You've seen it before: the frantic Slack messages, the outdated Trello cards, the Google Docs that nobody can find. Your team is brilliant, but you're fighting the tools, not the problem.
              </p>
              <p>
                Hours are vanishing just on setup and context-switching, leaving you less time to build. This chaos isn't a badge of honor. It's the silent killer of great ideas and the number one cause of hackathon burnout.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <Smartphone className="h-12 w-12 text-destructive" />,
                title: "The Tab-Switching Trap",
                description: "Constantly jumping between Slack, Trello, Google Drive, and GitHub kills your flow state and wastes precious time."
              },
              {
                icon: <MessageSquare className="h-12 w-12 text-primary" />,
                title: "The Communication Breakdown", 
                description: "Important messages get lost in a sea of channels and DMs. Critical updates disappear into the void."
              },
              {
                icon: <Clock className="h-12 w-12 text-chart-3" />,
                title: "The Endless Setup",
                description: "Wasting critical hours setting up tools, configuring permissions, and syncing data instead of writing code."
              },
              {
                icon: <Zap className="h-12 w-12 text-destructive" />,
                title: "The Deadline Panic",
                description: "Rushing to consolidate tasks, screenshots, and code for final submission while the clock ticks down."
              }
            ].map((problem, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-8 pb-6">
                  <div className="mb-6 flex justify-center">{problem.icon}</div>
                  <h3 className="font-bold text-lg mb-3">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-xl text-muted-foreground">
              What if there was a better way? One where your team worked in harmony, and your tools worked <em>for</em> you, not against you.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION - Phase 9 Implementation */}
      <section id="features" className="py-24 bg-gradient-to-br from-card via-muted/50 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              The Solution
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Introducing HackerDen: The All-in-One HQ for Winning Teams
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              What if you could eliminate the chaos and just... build? HackerDen is the single, integrated workspace built by hackers, for hackers. It replaces the messy tangle of separate tools with one streamlined platform.
            </p>
          </div>
          
          {/* Core Benefits Framework */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">From Chaos to Clarity</h3>
                <p className="text-muted-foreground">
                  See your entire project at a glance with integrated Kanban boards, real-time chat, and a single source of truth for all your files and tasks.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-chart-1/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-chart-1" />
                </div>
                <h3 className="text-xl font-bold mb-3">From Friction to Flow</h3>
                <p className="text-muted-foreground">
                  Get an unfair advantage with a unified space that eliminates tab-switching and communication gaps. Every team member is on the same page, always.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-chart-2" />
                </div>
                <h3 className="text-xl font-bold mb-3">From Stress to Success</h3>
                <p className="text-muted-foreground">
                  Our hackathon-first design and automated submission features reduce last-minute panic, so you can focus on building a project that blows the judges away.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Deep Dive */}
          <div className="bg-background/50 rounded-2xl p-8 border">
            <h3 className="text-2xl font-bold text-center mb-8">
              HackerDen isn't just a prettier Trello. It's a battle-tested HQ with features built specifically for the hackathon grind:
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[
                  { 
                    icon: <MessageSquare className="h-6 w-6 text-primary" />, 
                    title: "Integrated Chat", 
                    desc: "Talk strategy and share code snippets without leaving your workspace." 
                  },
                  { 
                    icon: <Kanban className="h-6 w-6 text-chart-1" />, 
                    title: "Hackathon-Ready Templates", 
                    desc: "Skip setup and jump straight into building with pre-configured project boards." 
                  },
                  { 
                    icon: <Palette className="h-6 w-6 text-chart-2" />, 
                    title: "Interactive Whiteboard", 
                    desc: "Brainstorm ideas, sketch wireframes, and visualize concepts with your team in real-time." 
                  },
                  { 
                    icon: <Trophy className="h-6 w-6 text-primary" />, 
                    title: "Judge-Ready Submissions", 
                    desc: "One-click submissions that automatically package your project so you can focus on your final demo, not frantic uploads." 
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-card p-2 rounded-lg border">{feature.icon}</div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Demo Preview */}
              <div className="bg-card rounded-lg p-4 border">
                <div className="mb-4">
                  <div className="flex gap-2 mb-3">
                    {['kanban', 'chat', 'whiteboard', 'files'].map((demo) => (
                      <button
                        key={demo}
                        onClick={() => setActiveDemo(demo)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          activeDemo === demo 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground hover:bg-primary/10'
                        }`}
                      >
                        {demo.charAt(0).toUpperCase() + demo.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                  {activeDemo === 'kanban' && (
                    <div className="text-center">
                      <Kanban className="h-12 w-12 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Drag & Drop Kanban</p>
                      <p className="text-xs text-muted-foreground">Live demo placeholder</p>
                    </div>
                  )}
                  {activeDemo === 'chat' && (
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 text-chart-1" />
                      <p className="text-sm font-medium">Real-time Team Chat</p>
                      <p className="text-xs text-muted-foreground">Live demo placeholder</p>
                    </div>
                  )}
                  {activeDemo === 'whiteboard' && (
                    <div className="text-center">
                      <Palette className="h-12 w-12 mx-auto mb-2 text-chart-2" />
                      <p className="text-sm font-medium">Interactive Whiteboard</p>
                      <p className="text-xs text-muted-foreground">Live demo placeholder</p>
                    </div>
                  )}
                  {activeDemo === 'files' && (
                    <div className="text-center">
                      <Upload className="h-12 w-12 mx-auto mb-2 text-chart-2" />
                      <p className="text-sm font-medium">File Sharing System</p>
                      <p className="text-xs text-muted-foreground">Live demo placeholder</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF SECTION - Phase 10 Implementation */}
      <section id="testimonials" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Built for hackers. Vetted by the community.
            </h2>
          </div>
          
          {/* Testimonials */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                quote: "We didn't waste the first 3 hours setting up tools—HackerDen had everything we needed in one place. It was a game-changer for our workflow.",
                author: "Sarah Chen",
                role: "Early HackerDen Tester, 100Devs Community",
                avatar: "SC",
                rating: 5
              },
              {
                quote: "Finally, no juggling between Slack, Trello, and Google Drive. Tasks, chat, and files were just... there. It felt like HackerDen was built just for us.",
                author: "Alex Rodriguez", 
                role: "CodeWithKiro Participant",
                avatar: "AR",
                rating: 5
              },
              {
                quote: "The auto-submission feature saved us during crunch time. No more copy-pasting chaos before judging. We could focus on our demo, not frantic uploads.",
                author: "Maya Patel",
                role: "100Devs Community",
                avatar: "MP",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Results Gallery */}
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
                <Clock className="h-8 w-8" />
                Save Hours
              </div>
              <p className="text-muted-foreground">Unlike generic tools, HackerDen gets your team to "zero to building" in minutes.</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-chart-1 flex items-center justify-center gap-2">
                <Zap className="h-8 w-8" />
                Replace 4+ Tools
              </div>
              <p className="text-muted-foreground">Consolidate your Slack, Trello, Google Docs, and more into one powerful platform.</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-chart-2 flex items-center justify-center gap-2">
                <Trophy className="h-8 w-8" />
                Judge-Ready
              </div>
              <p className="text-muted-foreground">Our built-in submission system eliminates last-minute panic, so you can focus on your demo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE DEEP DIVE SECTIONS */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Every feature built for hackathon success
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From real-time collaboration to judge-ready submissions, every feature in HackerDen is designed specifically for the unique challenges of hackathon development.
            </p>
          </div>

          <div className="space-y-16">
            {/* Kanban Board Feature */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Kanban className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Advanced Task Management</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  Four-column Kanban board with real-time drag-and-drop, priority levels, and progress tracking. 
                  Watch your team's productivity soar with visual task management designed for fast-paced development.
                </p>
                <ul className="space-y-2">
                  {[
                    "Real-time synchronization across all team members",
                    "Drag and drop on both desktop and mobile",
                    "Task assignment with role-based permissions",
                    "Progress tracking excluding blocked tasks"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card rounded-xl p-6 border shadow-lg">
                <div className="bg-background rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="space-y-2">
                      <div className="bg-muted p-2 rounded text-center font-medium">TO-DO</div>
                      <div className="bg-card border p-2 rounded">Setup API</div>
                      <div className="bg-card border p-2 rounded">Design UI</div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-primary/10 p-2 rounded text-center font-medium">IN PROGRESS</div>
                      <div className="bg-primary/20 border border-primary/30 p-2 rounded">Auth system</div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-destructive/10 p-2 rounded text-center font-medium">BLOCKED</div>
                      <div className="bg-destructive/20 border border-destructive/30 p-2 rounded">Database</div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-chart-2/10 p-2 rounded text-center font-medium">DONE</div>
                      <div className="bg-chart-2/20 border border-chart-2/30 p-2 rounded opacity-60">Project setup</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Chat Feature */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="bg-card rounded-xl p-6 border shadow-lg lg:order-1">
                <div className="bg-background rounded-lg p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">SC</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="bg-muted p-2 rounded-lg">Just pushed the auth changes 🚀</div>
                        <div className="text-xs text-muted-foreground mt-1">Sarah • 2 min ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-chart-1 text-white text-xs">AR</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="bg-primary/10 p-2 rounded-lg">Perfect! Testing now. UI looks great 👌</div>
                        <div className="text-xs text-muted-foreground mt-1">Alex • 1 min ago</div>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-2 rounded-lg text-xs text-center text-muted-foreground">
                      <Bot className="h-3 w-3 inline mr-1" />
                      Task "Setup authentication" moved to Done by Sarah
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 lg:order-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-chart-1" />
                  </div>
                  <h3 className="text-2xl font-bold">Real-time Team Communication</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  Built-in team chat with system notifications, code sharing, and instant updates. 
                  No more switching between Slack and your project management tool.
                </p>
                <ul className="space-y-2">
                  {[
                    "Instant messaging with team members",
                    "Automatic task activity notifications",
                    "Code snippet sharing and formatting",
                    "Dark theme optimized for long coding sessions"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-chart-1" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* File Sharing Feature */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <Upload className="h-6 w-6 text-chart-2" />
                  </div>
                  <h3 className="text-2xl font-bold">Smart File Sharing</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  Upload, preview, and share files instantly with your team. Support for images, PDFs, code files, 
                  and more with syntax highlighting for development files.
                </p>
                <ul className="space-y-2">
                  {[
                    "Support for all file types up to 10MB",
                    "Code syntax highlighting and preview",
                    "Direct mobile camera integration",
                    "Real-time file synchronization"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-chart-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card rounded-xl p-6 border shadow-lg">
                <div className="bg-background rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">Team Files</span>
                      <Button size="sm" className="h-6 px-2 text-xs">
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <Code className="h-4 w-4 text-primary" />
                        <span>auth.js</span>
                        <span className="ml-auto text-muted-foreground">2.3 KB</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <FileText className="h-4 w-4 text-chart-1" />
                        <span>design-mockup.pdf</span>
                        <span className="ml-auto text-muted-foreground">1.2 MB</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <Palette className="h-4 w-4 text-chart-2" />
                        <span>logo-final.png</span>
                        <span className="ml-auto text-muted-foreground">456 KB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Interactive Whiteboard Feature */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <Palette className="h-6 w-6 text-chart-2" />
                </div>
                <h3 className="text-2xl font-bold">Interactive Whiteboard</h3>
              </div>
              <p className="text-lg text-muted-foreground">
                Collaborate visually with your team in real-time. Sketch ideas, create wireframes, and brainstorm 
                solutions together on an infinite canvas designed for fast-paced hackathon ideation.
              </p>
              <ul className="space-y-2">
                {[
                  "Real-time collaborative drawing and sketching",
                  "Pre-built templates for wireframes and flowcharts",
                  "Infinite canvas with zoom and pan controls",
                  "Shape tools and sticky notes for organized brainstorming"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-chart-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-xl p-6 border shadow-lg">
              <div className="bg-background rounded-lg p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Team Whiteboard</span>
                    <Button size="sm" className="h-6 px-2 text-xs">
                      <Palette className="h-3 w-3 mr-1" />
                      Draw
                    </Button>
                  </div>
                  <div className="h-32 bg-muted/30 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Palette className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                        <p className="text-xs font-medium">Interactive Canvas</p>
                        <p className="text-xs text-muted-foreground">Sketch, wireframe, brainstorm</p>
                      </div>
                    </div>
                    {/* Simulated drawing elements */}
                    <div className="absolute top-2 left-2 w-16 h-8 bg-primary/20 rounded border-2 border-primary/40"></div>
                    <div className="absolute top-12 right-4 w-12 h-12 bg-chart-1/20 rounded-full border-2 border-chart-1/40"></div>
                    <div className="absolute bottom-2 left-8 w-20 h-6 bg-chart-2/20 rounded border-2 border-chart-2/40"></div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <div className="bg-muted/50 px-2 py-1 rounded">✏️ Draw</div>
                    <div className="bg-muted/50 px-2 py-1 rounded">📝 Text</div>
                    <div className="bg-muted/50 px-2 py-1 rounded">🔷 Shapes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Vault & Link Sharing Feature */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-card rounded-xl p-6 border shadow-lg lg:order-1">
              <div className="bg-background rounded-lg p-4">
                <div className="space-y-4 text-sm">
                  <div className="text-center">
                    <h4 className="font-semibold mb-2">Team Vault</h4>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Secure Link Sharing
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-muted p-2 rounded">
                      <div className="font-medium">Shared Links</div>
                      <div className="text-xs text-muted-foreground">GitHub repos, design files</div>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <div className="font-medium">Resources</div>
                      <div className="text-xs text-muted-foreground">API docs, tutorials</div>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <div className="font-medium">Project Assets</div>
                      <div className="text-xs text-muted-foreground">Figma, deployment links</div>
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Access Team Vault
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-6 lg:order-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Team Vault & Link Sharing</h3>
              </div>
              <p className="text-lg text-muted-foreground">
                Centralize all your important project links in one secure location. Share GitHub repos, design files,
                and resources with your team while keeping everything organized and private.
              </p>
              <ul className="space-y-2">
                {[
                  "Secure storage for project links and resources",
                  "Organized categories for different link types",
                  "Team-only access with privacy controls",
                  "Quick access to all project-related URLs"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* OBJECTION HANDLING - Phase 11 Implementation */}
      <section id="faq" className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Answers to Your Toughest Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              We've addressed every concern so you can focus on what matters: building something amazing.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left">
                  What if HackerDen breaks when I need it most?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <div className="space-y-3">
                    <p>HackerDen is built on a modern, reliable tech stack with React 19 and Appwrite for maximum performance and stability.</p>
                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Advanced error handling</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Offline support</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Community battle-tested</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left">
                  How is this better than my current Slack + Trello + Google Docs setup?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <div className="space-y-4">
                    <p>While generic tools require constant tab-switching and manual syncing, HackerDen provides a truly integrated experience:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Your Current Setup</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Context switching between 4+ tools</li>
                          <li>• Manual updates and syncing</li>
                          <li>• Lost messages and files</li>
                          <li>• Hours wasted on setup</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">HackerDen</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Everything in one unified workspace</li>
                          <li>• Real-time automatic synchronization</li>
                          <li>• Built-in hackathon features</li>
                          <li>• Zero setup time with join codes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left">
                  Will I waste precious time learning a new tool?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p className="mb-4">HackerDen is designed for instant productivity. Most teams are up and running in under 30 seconds:</p>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Getting started timeline:</span>
                      <Badge variant="secondary">Under 30 seconds</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Join team with simple invite code</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Intuitive interface - no learning curve</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Start building immediately</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left">
                  Is HackerDen free? What's the catch?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p className="mb-4">Yes, HackerDen is completely free for hackathon participants. No hidden fees, no credit card required.</p>
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">Built by hackers, for hackers</span>
                    </div>
                    <p className="text-sm">We believe great tools shouldn't be a barrier to innovation. HackerDen will always be free for hackathon teams.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left">
                  Is my team's data and code safe?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <div className="space-y-4">
                    <p>Security is our top priority. Your intellectual property and team data are protected with enterprise-grade security:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Secure OAuth with Google & GitHub</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>End-to-end encrypted communications</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Your code and ideas remain 100% yours</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>SOC 2 compliant infrastructure</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left">
                  Can I use HackerDen for non-hackathon projects?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>Absolutely! While HackerDen is optimized for hackathons, it works great for any fast-paced collaborative project:</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Side projects and weekend builds
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Startup MVP development
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Student group projects
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Open source contributions
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CONVERSION CATALYST FINALE - Phase 12 Implementation */}
      <section id="cta" className="py-24 bg-gradient-to-br from-card via-primary/10 to-chart-2/10 relative overflow-hidden border-t">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-chart-2/5"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl lg:text-5xl font-bold">
                Stop fighting your tools.<br />
                <span className="text-primary">Start building the future.</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
                Be among the first to experience hackathon collaboration done right.
              </p>
              <p className="text-lg font-medium text-primary">
                Every second counts.
              </p>
            </div>

            {/* Simple Value Props */}
            <Card className="bg-gradient-to-br from-card/50 to-card border-primary/20 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="font-medium">Set up your entire workspace in under 5 minutes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="font-medium">Everything your team needs in one place</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="font-medium">Built by hackers, for hackers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xl px-12 py-6 shadow-lg hover:shadow-xl transition-all"
                onClick={handleGetStarted}
              >
                Start Building Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Early access • Free to try • Help us build the future of hackathons
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
