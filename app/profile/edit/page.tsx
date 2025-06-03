import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";

export default async function EditProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your professional information</p>
        </div>
      </div>

      <form className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your full name"
                  defaultValue={session.user?.name || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="your.email@example.com"
                  defaultValue={session.user?.email || ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio/Summary</Label>
              <Textarea 
                id="bio"
                placeholder="Tell others about yourself, your interests, and what you're passionate about..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input 
                id="location" 
                placeholder="City, State/Country"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferred Roles */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Roles</CardTitle>
            <CardDescription>
              What types of roles are you interested in?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="cursor-pointer">
                Frontend Developer
                <X className="w-3 h-3 ml-1" />
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Full Stack Developer
                <X className="w-3 h-3 ml-1" />
              </Badge>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Add New Role</Label>
              <div className="flex gap-2">
                <Input 
                  id="new-role" 
                  placeholder="e.g., Backend Developer, DevOps Engineer"
                />
                <Button type="button">Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Skills</CardTitle>
            <CardDescription>
              List your technical skills and proficiency levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <Input placeholder="Skill name" className="flex-1" />
                <select className="px-3 py-2 border rounded-md">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <Button variant="outline" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button variant="outline" type="button">
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card>
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>
              Add your professional work experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input id="job-title" placeholder="e.g., Senior Frontend Developer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="e.g., Tech Corp" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="job-location">Location</Label>
                  <Input id="job-location" placeholder="e.g., San Francisco, CA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="month" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input id="end-date" type="month" placeholder="Leave empty if current" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-description">Description</Label>
                <Textarea 
                  id="job-description"
                  placeholder="Describe your role, responsibilities, and achievements..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
            <Button variant="outline" type="button">
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>
              Add your educational background
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input id="degree" placeholder="e.g., Bachelor of Science in Computer Science" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school">School/University</Label>
                  <Input id="school" placeholder="e.g., University of California" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="school-location">Location</Label>
                  <Input id="school-location" placeholder="e.g., Berkeley, CA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edu-start">Start Date</Label>
                  <Input id="edu-start" type="month" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edu-end">End Date</Label>
                  <Input id="edu-end" type="month" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edu-description">Description (Optional)</Label>
                <Textarea 
                  id="edu-description"
                  placeholder="Relevant coursework, achievements, etc..."
                  className="min-h-[60px]"
                />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
            <Button variant="outline" type="button">
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio & Social Links</CardTitle>
            <CardDescription>
              Connect your external profiles and portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Profile</Label>
                <Input 
                  id="github" 
                  type="url"
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input 
                  id="linkedin" 
                  type="url"
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio Website</Label>
                <Input 
                  id="portfolio" 
                  type="url"
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X Profile</Label>
                <Input 
                  id="twitter" 
                  type="url"
                  placeholder="https://twitter.com/yourusername"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex gap-4 pt-6">
          <Button type="submit" size="lg">
            Save Changes
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/profile">
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
