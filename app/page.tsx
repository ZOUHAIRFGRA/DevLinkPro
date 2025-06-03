import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-muted/50 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Connect, Collaborate, Code
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                DevLink brings developers and projects together. Find your next collaboration, showcase your skills, and build amazing things.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
            Why Choose DevLink?
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Developer Profiles</CardTitle>
                <CardDescription>
                  Create and manage your professional profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Showcase your skills, experience, and projects to potential collaborators and employers.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Project Matching</CardTitle>
                <CardDescription>
                  Find projects that match your skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our intelligent matching system connects you with projects that align with your expertise.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Tools</CardTitle>
                <CardDescription>
                  Work together with in-app communication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built-in messaging, file sharing, and project management tools to streamline collaboration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Start Collaborating?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                Join thousands of developers who are already building amazing projects together.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Join DevLink Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
