import React from 'react';
import { Button } from './ui/button';
import FloatingNavbar from './FloatingNavbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  Smartphone
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingNavbar />
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-background via-card to-primary/10 text-foreground">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  Built at CodeWithKiro Hackathon
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-foreground">
                  Stop juggling Slack, Trello, and Google Docs. 
                  <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                    Start building.
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                  The all-in-one workspace built by hackers for hackers. Bring your team, tasks, and code together and focus on what matters.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  Get Early Access Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                  Watch Demo
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                ✅ Tested by 100Devs Community • ✅ Free to get started
              </p>
            </div>
            
            {/* Product Screenshot Placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-card to-muted rounded-lg p-6 shadow-2xl border">
                <div className="bg-muted rounded-lg h-64 lg:h-80 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">Product Screenshot</p>
                    <p className="text-sm">HackerDen Dashboard Preview</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Live & Ready!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              The old way is broken. It's time for a new one.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your team is brilliant, but you're fighting the tools instead of building the future.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Smartphone className="h-8 w-8 text-destructive" />,
                title: "Tab-Switching Trap",
                description: "Constantly jumping between 6+ tools kills your flow state"
              },
              {
                icon: <MessageSquare className="h-8 w-8 text-primary" />,
                title: "Communication Breakdown", 
                description: "Important updates get lost in endless Slack threads"
              },
              {
                icon: <Clock className="h-8 w-8 text-chart-3" />,
                title: "Endless Setup",
                description: "Spending hours configuring tools instead of coding"
              },
              {
                icon: <Zap className="h-8 w-8 text-destructive" />,
                title: "Deadline Panic",
                description: "Scrambling to piece together submissions at the last minute"
              }
            ].map((problem, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">{problem.icon}</div>
                  <h3 className="font-semibold mb-2">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground">{problem.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-card via-muted/50 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">The Solution</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Introducing HackerDen: The All-in-One HQ for Winning Teams
            </h2>
          </div>
          
          <Tabs defaultValue="clarity" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clarity">From Chaos to Clarity</TabsTrigger>
              <TabsTrigger value="flow">From Friction to Flow</TabsTrigger>
              <TabsTrigger value="success">From Stress to Success</TabsTrigger>
            </TabsList>
            
            <TabsContent value="clarity" className="mt-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Everything in One Place</h3>
                  <div className="space-y-4">
                    {[
                      { icon: <MessageSquare className="h-5 w-5" />, text: "Integrated Chat - No more Slack chaos" },
                      { icon: <Kanban className="h-5 w-5" />, text: "Kanban Board - Visual task management" },
                      { icon: <FileText className="h-5 w-5" />, text: "Hackathon Templates - Start fast, finish strong" },
                      { icon: <Trophy className="h-5 w-5" />, text: "Judge-Ready Submissions - One-click exports" }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="text-primary">{feature.icon}</div>
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-card to-muted rounded-lg p-8 h-64 flex items-center justify-center border">
                  <div className="text-center text-muted-foreground">
                    <Kanban className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Integrated Workspace</p>
                    <p className="text-sm">Screenshot Placeholder</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="flow" className="mt-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="bg-gradient-to-br from-card to-muted rounded-lg p-8 h-64 flex items-center justify-center border">
                  <div className="text-center text-muted-foreground">
                    <Zap className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Real-time Collaboration</p>
                    <p className="text-sm">Demo Video Placeholder</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Seamless Team Sync</h3>
                  <p className="text-muted-foreground">
                    Watch your team's ideas come to life in real-time. No more "Can you see my screen?" 
                    moments. Everything syncs instantly across all devices.
                  </p>
                  <Button>See It In Action</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="success" className="mt-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Built for Winners</h3>
                  <p className="text-muted-foreground">
                    From idea to submission in record time. Our templates and workflows are battle-tested 
                    by winning teams at major hackathons.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">5hrs</div>
                      <div className="text-sm text-muted-foreground">Saved per hackathon</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-chart-1">4+</div>
                      <div className="text-sm text-muted-foreground">Tools replaced</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-chart-2">1-click</div>
                      <div className="text-sm text-muted-foreground">Judge-ready export</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-card to-muted rounded-lg p-8 h-64 flex items-center justify-center border">
                  <div className="text-center text-muted-foreground">
                    <Trophy className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Success Metrics</p>
                    <p className="text-sm">Results Dashboard</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="testimonials" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Built for hackers. Vetted by the community.
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                quote: "HackerDen saved our team 6 hours during the last hackathon. We could focus on building instead of managing tools.",
                author: "Sarah Chen",
                role: "100Devs Community",
                avatar: "SC"
              },
              {
                quote: "The judge-ready export feature is a game-changer. Our submission looked professional without the last-minute scramble.",
                author: "Marcus Rodriguez", 
                role: "CodeWithKiro Winner",
                avatar: "MR"
              },
              {
                quote: "Finally, a tool that gets it. Built by developers who actually participate in hackathons.",
                author: "Aisha Patel",
                role: "100Devs Community",
                avatar: "AP"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">5+ Hours</div>
              <p className="text-muted-foreground">Average time saved per hackathon</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-chart-1">4+ Tools</div>
              <p className="text-muted-foreground">Replaced with one platform</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-chart-2">1-Click</div>
              <p className="text-muted-foreground">Judge-ready submissions</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Answers to Your Toughest Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Is HackerDen really free?</AccordionTrigger>
                <AccordionContent>
                  Yes! HackerDen is free for all hackathon participants. We believe great tools shouldn't be a barrier to innovation. Premium features for enterprise teams will be available later.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How secure is my data?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>End-to-end encryption for all communications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>SOC 2 compliant infrastructure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Your code and ideas remain 100% yours</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I use this for non-hackathon projects?</AccordionTrigger>
                <AccordionContent>
                  Absolutely! While HackerDen is optimized for hackathons, it works great for any collaborative project. Many teams use it for side projects, startup MVPs, and even client work.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How does HackerDen compare to existing tools?</AccordionTrigger>
                <AccordionContent>
                  Unlike general-purpose tools, HackerDen is purpose-built for fast-moving development teams. We combine the best of Slack, Trello, Figma, and GitHub into one seamless experience designed specifically for hackathons and rapid prototyping.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>What if I need help getting started?</AccordionTrigger>
                <AccordionContent>
                  We've got you covered! Every new team gets access to our Hackathon Starter Kit with templates, best practices, and direct support from our community of experienced hackers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="cta" className="py-24 bg-gradient-to-br from-card via-primary/20 to-chart-2/20 text-foreground relative overflow-hidden border-t">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 mb-4">
              Limited Time Bonus
            </Badge>
            
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Ready to build without the chaos?
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8">
              The clock is ticking. Don't waste another minute fighting your tools.
            </p>
            
            <Card className="bg-card/50 border backdrop-blur max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">🎁 The HackerDen Starter Kit</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sign up now and get exclusive access to:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  {[
                    "Hackathon Project Vault with 50+ proven ideas",
                    "Boilerplate code templates for popular stacks",
                    "Judge-friendly presentation templates",
                    "Direct access to our community of winners"
                  ].map((bonus, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm">{bonus}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-8 py-4">
                Get Early Access Now
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Join thousands of hackers who have already made the switch. It's free, intuitive, and built for you.
              </p>
              
              <p className="text-lg font-medium text-primary">
                Don't let tool-juggling kill your team's momentum. Get the unfair advantage now and start winning.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
