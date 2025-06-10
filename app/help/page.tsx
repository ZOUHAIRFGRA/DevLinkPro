import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { Search, MessageCircle, Book, Users, ArrowRight } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-xl text-muted-foreground">
          Find answers to common questions and get the help you need
        </p>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search for help articles, guides, and FAQs..." 
                className="pl-10"
              />
            </div>
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Book className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Learn the basics of using DevLink
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#getting-started">
                View Guide <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Community Support</CardTitle>
            <CardDescription>
              Get help from other developers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/community">
                Join Community <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <MessageCircle className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Reach out to our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/contact">
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Quick answers to the most common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="getting-started">
              <AccordionTrigger>How do I get started with DevLink?</AccordionTrigger>
              <AccordionContent>
                Getting started is easy! Sign up with your GitHub account, complete your profile, 
                and start browsing projects or create your own. You can also use our discovery 
                feature to find projects that match your skills.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="create-project">
              <AccordionTrigger>How do I create a project?</AccordionTrigger>
              <AccordionContent>
                To create a project, navigate to the Projects page and click &quot;Create Project&quot;. 
                Fill in your project details, specify the roles you need, and publish it. 
                Developers can then discover and apply to join your project.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="apply-project">
              <AccordionTrigger>How do I apply to join a project?</AccordionTrigger>
              <AccordionContent>
                Browse projects on the Projects page or use the Discovery feature. When you find 
                a project you&apos;re interested in, click &quot;View Details&quot; and then &quot;Apply&quot;. You can 
                select the role you want and include a message to the project owner.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="matching">
              <AccordionTrigger>How does the matching system work?</AccordionTrigger>
              <AccordionContent>
                Our matching system analyzes your skills, interests, and past projects to suggest 
                relevant opportunities. Use the Discovery page to swipe through personalized 
                recommendations for both projects and developers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="profile">
              <AccordionTrigger>How do I improve my profile?</AccordionTrigger>
              <AccordionContent>
                Complete all profile sections, add your skills with proficiency levels, showcase 
                your best projects, and keep your GitHub profile updated. A complete profile 
                helps you get better project matches and collaboration opportunities.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="messaging">
              <AccordionTrigger>How do I communicate with other developers?</AccordionTrigger>
              <AccordionContent>
                Once you match with a project or developer, you can start messaging through our 
                built-in chat system. You can also create group chats for project teams. 
                Access your conversations through the Messages page.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="safety">
              <AccordionTrigger>Is DevLink safe to use?</AccordionTrigger>
              <AccordionContent>
                Yes! We verify all users through GitHub authentication, have community guidelines 
                in place, and provide reporting tools for any inappropriate behavior. Always 
                review project details carefully before committing to collaborations.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cost">
              <AccordionTrigger>Is DevLink free to use?</AccordionTrigger>
              <AccordionContent>
                DevLink is completely free for developers to create profiles, browse projects, 
                and collaborate. We believe in supporting the open-source community and making 
                collaboration accessible to everyone.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
