/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Globe,
  Github,
  Mail,
  Calendar,
  Edit,
  Star,
  GitFork,
  Users,
  Building,
} from "lucide-react";
import { GitHubAPI, extractSkillsFromRepos } from "@/lib/github";
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown (tables, strikethrough, etc.)
import rehypeRaw from "rehype-raw"; // To render HTML inside markdown (use with caution)

// Define custom renderers
const markdownComponents: Components = {
  // Target all images
  img: ({ node, src, alt, ...props }) => {
    // Check if it's likely a badge based on src or alt text
    const isBadge = (typeof src === 'string' && (src.includes('shields.io') || src.includes('img.shields.io'))) || (typeof alt === 'string' && alt.toLowerCase().includes('badge'));

    if (isBadge) {
      return (
        <img
          src={src}
          alt={alt}
          style={{
            height: '25px', // Or use Tailwind classes
            margin: '2px 4px',
            display: 'inline-block',
            verticalAlign: 'middle',
          }}
          {...props}
        />
      );
    }
    // For other images, you could use Next/Image or default rendering
    // For simplicity here, we'll just render a normal img but you could enhance this
    return <img src={src} alt={alt} {...props} />;
  },
  // You might also want to style paragraphs containing only badges differently
  p: ({node, ...props}: { node?: any; [key: string]: any }) => {
    // Check if this paragraph primarily contains badges
    const containsOnlyBadges = node?.children ? Array.from(node.children).every(
      (child: any) => child.tagName === 'img' && (child.properties?.src?.includes('shields.io') || child.properties?.alt?.toLowerCase().includes('badge'))
    ) : false;

    if (containsOnlyBadges) {
      return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }} {...props} />;
    }
    return <p {...props} />;
  }
};
async function fetchGitHubProfile(accessToken: string) {
  try {
    const github = new GitHubAPI(accessToken);

    // Fetch GitHub user data
    const githubUser = await github.getUser();
    const repositories = await github.getRepositories(githubUser.login, {
      per_page: 50,
    });
    const pinnedRepos = await github.getPinnedRepositories(githubUser.login);
    const profileReadme = await github.getProfileReadme(githubUser.login);
    const contributionStats = await github.getContributionStats(
      githubUser.login
    );
    const organizations = await github.getOrganizations(githubUser.login);

    // Extract skills from repositories
    const extractedSkills = extractSkillsFromRepos(repositories);

    // Transform GitHub data to our profile format
    const profile = {
      id: githubUser.id.toString(),
      name: githubUser.name || githubUser.login,
      email: githubUser.email,
      image: githubUser.avatar_url,
      bio: githubUser.bio || "",
      location: githubUser.location || "",
      github: {
        username: githubUser.login,
        url: githubUser.html_url,
        publicRepos: githubUser.public_repos,
        followers: githubUser.followers,
        following: githubUser.following,
        company: githubUser.company,
        createdAt: githubUser.created_at,
        profileReadme,
        contributions: contributionStats,
        organizations,
      },
      skills: extractedSkills,
      repositories: repositories.slice(0, 10), // Top 10 recent repos
      pinnedRepositories: pinnedRepos,
      socialLinks: {
        github: githubUser.html_url,
        portfolio: githubUser.blog || "",
        twitter: githubUser.twitter_username
          ? `https://twitter.com/${githubUser.twitter_username}`
          : "",
        linkedin: "", // Not available from GitHub API
      },
      joinedDate: githubUser.created_at,
    };

    return profile;
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign-in");
  }

  if (!session.accessToken) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">GitHub Access Required</h1>
          <p className="text-muted-foreground mb-4">
            Please sign in with GitHub to view your profile data.
          </p>
          <Button asChild>
            <Link href="/auth/sign-in">Sign in with GitHub</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Fetch real GitHub profile data
  const profile = await fetchGitHubProfile(session.accessToken);

  if (!profile) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Unable to load GitHub profile
          </h1>
          <p className="text-muted-foreground mb-4">
            We couldn&apos;t fetch your GitHub data. Please try refreshing or
            signing in again.
          </p>
          <Button asChild>
            <Link href="/auth/sign-in">Sign in with GitHub</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          {profile.image && (
            <Image
              src={profile.image}
              alt={`${profile.name || "User"}'s profile`}
              width={120}
              height={120}
              className="w-30 h-30 rounded-full border-4 border-border"
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {profile.name || "GitHub User"}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-3">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.github?.company && (
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{profile.github.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {new Date(
                      profile.github?.createdAt || profile.joinedDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <Button asChild>
              <Link href="/profile/edit">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>

          {profile.bio && <p className="text-lg mb-4">{profile.bio}</p>}

          {/* GitHub Stats */}
          <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
            {profile.github && (
              <>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{profile.github.followers} followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{profile.github.following} following</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{profile.github.publicRepos} repositories</span>
                </div>
              </>
            )}
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
            {profile.socialLinks?.github && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            {profile.socialLinks?.portfolio && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={profile.socialLinks.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Portfolio
                </a>
              </Button>
            )}
            {profile.socialLinks?.twitter && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </a>
              </Button>
            )}
            {profile.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${profile.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Technical Skills from GitHub */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Skills</CardTitle>
            <CardDescription>
              Skills extracted from GitHub repositories and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill: { name: string; level: string }) => (
                  <div
                    key={skill.name}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium">{skill.name}</span>
                    <Badge
                      variant={
                        skill.level === "Expert"
                          ? "default"
                          : skill.level === "Advanced"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {skill.level}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No skills data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Organizations */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>
              GitHub organizations I&apos;m part of
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.github?.organizations &&
            profile.github.organizations.length > 0 ? (
              <div className="space-y-3">
                {profile.github.organizations
                  .slice(0, 5)
                  .map(
                    (org: {
                      id: number;
                      login: string;
                      avatar_url: string;
                      description?: string;
                    }) => (
                      <div key={org.id} className="flex items-center gap-3">
                        <Image
                          src={org.avatar_url}
                          alt={org.login}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{org.login}</div>
                          {org.description && (
                            <div className="text-sm text-muted-foreground">
                              {org.description}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <p className="text-muted-foreground">No organizations found</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Repositories */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Repositories</CardTitle>
            <CardDescription>
              My most recently updated GitHub repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.repositories && profile.repositories.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.repositories
                  .slice(0, 6)
                  .map(
                    (repo: {
                      id: number;
                      name: string;
                      html_url: string;
                      description?: string;
                      stargazers_count: number;
                      forks_count: number;
                      language?: string;
                      updated_at: string;
                    }) => (
                      <div key={repo.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 transition-colors"
                            >
                              {repo.name}
                            </a>
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              <span>{repo.stargazers_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" />
                              <span>{repo.forks_count}</span>
                            </div>
                          </div>
                        </div>
                        {repo.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          {repo.language && (
                            <Badge variant="outline" className="text-xs">
                              {repo.language}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Updated{" "}
                            {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No repositories found
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile README (if available) */}
        {profile.github?.profileReadme && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profile README</CardTitle>
              <CardDescription>My GitHub profile introduction</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Apply prose styling to the container of ReactMarkdown */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
  <ReactMarkdown
    components={markdownComponents} // Add this prop
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw]}
  >
    {profile.github.profileReadme}
  </ReactMarkdown>
</div>
            </CardContent>
          </Card>
        )}

        {/* DevLink Projects Placeholder */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>DevLink Projects</CardTitle>
            <CardDescription>
              Projects I&apos;ve created or collaborated on within DevLink
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No DevLink projects yet. Start collaborating!
              </p>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
