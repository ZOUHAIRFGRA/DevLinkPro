"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SkillsManager } from "./skills-manager";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Skill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

interface SocialLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  twitter?: string;
}

interface ProfileFormData {
  name: string;
  bio: string;
  location: string;
  skills: Skill[];
  socialLinks: SocialLinks;
}

export function EditProfileForm() {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    bio: "",
    location: "",
    skills: [],
    socialLinks: {
      github: "",
      linkedin: "",
      portfolio: "",
      twitter: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshingGithub, setRefreshingGithub] = useState(false);
  const [githubDataStale, setGithubDataStale] = useState(false);
  const [lastGithubUpdate, setLastGithubUpdate] = useState<string | null>(null);
  const router = useRouter();

  // Fetch current profile data (merged with GitHub data)
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        
        if (user) {
          setFormData({
            name: user.name || "",
            bio: user.bio || "",
            location: user.location || "",
            skills: user.skills || [],
            socialLinks: {
              github: user.socialLinks?.github || "",
              linkedin: user.socialLinks?.linkedin || "",
              portfolio: user.socialLinks?.portfolio || "",
              twitter: user.socialLinks?.twitter || "",
            },
          });
          
          // Set GitHub data staleness info
          setGithubDataStale(user.isGithubDataStale || false);
          setLastGithubUpdate(user.githubData?.lastUpdated || null);
        }
      } else {
        toast.error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to fetch profile data");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Refresh GitHub data
  const refreshGithubData = useCallback(async () => {
    setRefreshingGithub(true);
    try {
      const response = await fetch("/api/refresh-github", {
        method: "POST",
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success("GitHub data refreshed successfully!");
        
        // Update form with fresh data
        const user = data.user;
        if (user) {
          setFormData(prev => ({
            ...prev,
            bio: user.bio || prev.bio,
            location: user.location || prev.location,
            skills: user.skills && user.skills.length > prev.skills.length ? user.skills : prev.skills,
            socialLinks: {
              ...prev.socialLinks,
              github: user.socialLinks?.github || prev.socialLinks.github,
              portfolio: user.socialLinks?.portfolio || prev.socialLinks.portfolio,
              twitter: user.socialLinks?.twitter || prev.socialLinks.twitter,
            },
          }));
        }
        
        setGithubDataStale(false);
        setLastGithubUpdate(data.lastUpdated);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to refresh GitHub data");
      }
    } catch (error) {
      console.error("Error refreshing GitHub data:", error);
      toast.error("Failed to refresh GitHub data");
    } finally {
      setRefreshingGithub(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        // Wait a moment for the toast to show, then redirect
        setTimeout(() => {
          router.push("/profile");
          router.refresh(); // Refresh to show updated data
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillsChange = useCallback((skills: Skill[]) => {
    setFormData(prev => ({ ...prev, skills }));
  }, []);

  const handleSocialLinkChange = useCallback((platform: keyof SocialLinks, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (initialLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your profile data...</p>
            <p className="text-sm text-muted-foreground mt-2">Fetching info from GitHub and database</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
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
        
        {/* GitHub Refresh Button */}
        <div className="flex flex-col items-end gap-2">
          <Button
            type="button"
            variant={githubDataStale ? "default" : "outline"}
            size="sm"
            onClick={refreshGithubData}
            disabled={refreshingGithub}
            className="flex items-center gap-2"
          >
            {refreshingGithub ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
            )}
            Refresh GitHub Data
          </Button>
          {lastGithubUpdate && (
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(lastGithubUpdate).toLocaleDateString()}
              {githubDataStale && (
                <span className="text-amber-600 font-medium ml-1">(Stale)</span>
              )}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Auto-filled from GitHub if available
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Pre-filled from your GitHub profile. You can edit this to customize your bio.
              </p>
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
          <CardContent>
            <SkillsManager
              initialSkills={formData.skills}
              onChange={handleSkillsChange}
            />
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>
              Connect your professional social media profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={formData.socialLinks.github}
                  onChange={(e) => handleSocialLinkChange("github", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourusername"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={formData.socialLinks.portfolio}
                  onChange={(e) => handleSocialLinkChange("portfolio", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  type="url"
                  placeholder="https://twitter.com/yourusername"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                />
              </div>
            </div>
            {/* GitHub Data Refresh Section */}
            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshGithubData}
                disabled={refreshingGithub}
                className="mr-2"
              >
                {refreshingGithub ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Refresh GitHub Data"
                )}
              </Button>
              {githubDataStale && lastGithubUpdate && (
                <p className="text-xs text-muted-foreground">
                  GitHub data last updated{" "}
                  <time dateTime={lastGithubUpdate}>
                    {new Date(lastGithubUpdate).toLocaleString()}
                  </time>
                  . This data is stale.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex gap-4 pt-6">
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/profile">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
