import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {session.user?.name || "Developer"}!</h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s what&apos;s happening with your projects and collaborations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Manage your developer profile and skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {session.user?.image && (
                  <Image 
                    src={session.user.image} 
                    alt="Profile" 
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{session.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href="/profile">View Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>
              Projects you&apos;re currently working on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No active projects yet. Start collaborating!
              </p>
              <Button asChild className="w-full">
                <Link href="/projects">Browse Projects</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No recent activity to show.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/activity">View All Activity</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/projects/new">Create New Project</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/developers">Find Developers</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/messages">Messages</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Verification */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Verification</CardTitle>
            <CardDescription>
              Showcase and verify your abilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add skills to your profile to get better project matches.
              </p>
              <Button asChild className="w-full">
                <Link href="/skills">Manage Skills</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Stay updated with important information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No new notifications.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/notifications">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
