import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, MessageCircle, Github, Trophy, Calendar, TrendingUp, Heart, Star } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">DevLink Community</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of developers building amazing projects together
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">Join Community</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/projects">Browse Projects</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="p-6">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">12,500+</div>
            <div className="text-sm text-muted-foreground">Active Developers</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">3,200+</div>
            <div className="text-sm text-muted-foreground">Projects Created</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">8,900+</div>
            <div className="text-sm text-muted-foreground">Successful Matches</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm text-muted-foreground">Community Support</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Community Features */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Community Forums
              </CardTitle>
              <CardDescription>
                Connect with fellow developers, share knowledge, and get help
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">General Discussion</h4>
                    <p className="text-sm text-muted-foreground">General chat and introductions</p>
                  </div>
                  <Badge variant="secondary">1.2k posts</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Project Showcase</h4>
                    <p className="text-sm text-muted-foreground">Show off your completed projects</p>
                  </div>
                  <Badge variant="secondary">856 posts</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Help & Support</h4>
                    <p className="text-sm text-muted-foreground">Get help with technical issues</p>
                  </div>
                  <Badge variant="secondary">432 posts</Badge>
                </div>
              </div>
              
              <Button className="w-full" variant="outline">
                Join Discussions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Open Source
              </CardTitle>
              <CardDescription>
                Contribute to DevLink and community projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  DevLink is built by the community, for the community. Join us in building 
                  the future of developer collaboration.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                      View Source
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                      Contribute
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events & News */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>
                Join community events and workshops
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">DevLink Monthly Meetup</h4>
                    <Badge>Virtual</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Join us for project showcases and networking
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Dec 15, 2024 • 7:00 PM UTC</span>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Web3 Development Workshop</h4>
                    <Badge>Virtual</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn about building decentralized applications
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Dec 20, 2024 • 3:00 PM UTC</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full" variant="outline">
                View All Events
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Community Highlights
              </CardTitle>
              <CardDescription>
                Recent achievements and trending projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <h4 className="font-medium">Project of the Month</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    &quot;KessabPro&quot; - A sustainability management app built by our community for farmers
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <h4 className="font-medium">New Milestone</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We have reached 10,000+ successful project collaborations!
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-green-500" />
                    <h4 className="font-medium">Featured Developer</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Congratulations to @zouhairfgra for contributing to 15+ projects
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <Card className="mt-12 text-center">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Join the Community?</h2>
          <p className="text-muted-foreground mb-6">
            Start collaborating with developers from around the world. Create your profile, 
            find projects, and build amazing things together.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/help">Learn More</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
