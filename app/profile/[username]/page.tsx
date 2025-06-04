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
import { GitHubAPI, extractSkillsFromRepos, fetchPublicGitHubProfile, GitHubRepo } from "@/lib/github";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown (tables, strikethrough, etc.)
import rehypeRaw from "rehype-raw"; // To render HTML inside markdown (use with caution)
import {
  Tooltip,
  TooltipContent,
  TooltipProvider, // Ensure this is wrapping your app or page layout
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define custom renderers
const markdownComponents: Components = {
  // Custom renderer for images
  img: ({ node, src, alt, ...props }) => {
    // Check if it's a shields.io badge
    if (typeof src === "string" && src.includes("img.shields.io")) {
      return (
        <img
          src={src}
          alt={alt || "Tech Badge"} // Provide a default alt if missing
          style={{
            height: "28px", // Adjust height as desired for badges
            display: "inline-block", // Make them flow inline
            margin: "2px 4px", // Add some spacing around badges
            verticalAlign: "middle", // Align them nicely
          }}
          {...props} // Pass other props like title if any
        />
      );
    }
    // For other images (like GitHub stats, trophies etc.), render them normally
    // You might want to use Next/Image here for optimization if they are local
    // or if you know their dimensions. For external dynamic images, <img> is fine.
    return (
      <img src={src} alt={alt || ""} {...props} style={{ maxWidth: "100%" }} />
    ); // Added maxWidth for responsiveness of other images
  },

  p: ({ node, children, ...props }) => {
    // Check if this paragraph node contains primarily badge images (shields.io)
    let isBadgeParagraph = false;
    if (node && node.children) {
      isBadgeParagraph = Array.from(node.children).some((childNode: any) => {
        return (
          childNode.tagName === "img" &&
          childNode.properties &&
          typeof childNode.properties.src === "string" &&
          childNode.properties.src.includes("img.shields.io")
        );
      });
    }

    if (isBadgeParagraph) {
      // If it's the paragraph containing the tech stack, render it as a div
      // with flex layout to allow badges to wrap and align.
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap", // Allow badges to wrap to the next line
            alignItems: "center", // Align badges vertically
            gap: "4px", // Consistent gap (you had 0px 4px, just 4px is also common for flex gap)
            marginBottom: "1rem", // Add some space after the badge block
          }}
          {...props} // Pass through other props like 'key' if provided by react-markdown
        >
          {children}
        </div>
      );
    }

    // For all other paragraphs (NOT badge containers), apply specific Tailwind classes
    // These classes aim to give more control over paragraph styling than default prose.
    // Adjust these classes to match your desired look (e.g., GitHub's paragraph styling).
    return (
      <p
        className="my-3 leading-relaxed text-slate-700 dark:text-slate-300" // Example classes
        {...props}
      >
        {children}
      </p>
    );
  },

  h1: ({ node, ...props }) => (
    <h1
      className="text-2xl font-semibold my-4 text-slate-900 dark:text-slate-100"
      {...props}
    />
  ),
  h2: ({ node, ...props }) => (
    <h2
      className="text-xl font-semibold my-3 text-slate-800 dark:text-slate-200"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      className="text-lg font-semibold my-2 text-slate-700 dark:text-slate-300"
      {...props}
    />
  ),

  a: ({ node, ...props }) => (
    <a
      className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
  li: ({ node, ...props }) => <li className="my-1" {...props} />,
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
    console.log('GitHub User:', githubUser);

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
      plan: githubUser.plan, // Add plan for own profile
    };

    return profile;
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return null;
  }
}

interface ProfilePageProps {
  params: { username: string };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const viewingUsername = params.username;
  const isOwnProfile = session.githubLogin === viewingUsername;

  let profile;

  if (isOwnProfile) {
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
    // Fetch own profile with access token
    profile = await fetchGitHubProfile(session.accessToken);
    console.log('Own Profile:', profile);
  } else {
    // Fetch public profile data
    profile = await fetchPublicGitHubProfile(viewingUsername);
    console.log('Public Profile:', profile);
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Unable to load GitHub profile
          </h1>
          <p className="text-muted-foreground mb-4">
            We couldn&apos;t fetch the GitHub profile data for {viewingUsername}. The user might not exist or their profile might be private.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
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
        <div className="flex-1">            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {profile.name || profile.github?.username || "GitHub User"}
                  {/* PRO Badge - only show for own profile and when plan exists */}
                  {isOwnProfile && profile.plan?.name === "pro" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="default"
                            className="ml-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 text-xs font-semibold"
                          >
                            PRO
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Github Pro Member</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
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
            {/* Edit Profile Button - only show for own profile */}
            {isOwnProfile && (
              <Button asChild>
                <Link href="/profile/edit">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            )}
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
              GitHub organizations {isOwnProfile ? "I'm" : `${profile.name || viewingUsername} is`} part of
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
              {isOwnProfile ? "My" : `${profile.name || viewingUsername}'s`} most recently updated GitHub repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.repositories && profile.repositories.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.repositories
                  .slice(0, 6)
                  .map(
                    (repo: GitHubRepo) => (
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
              <CardDescription>
                {isOwnProfile ? "My" : `${profile.name || viewingUsername}'s`} GitHub profile introduction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={markdownComponents} // <-- Add your custom components here
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]} // rehypeRaw is important for your <br> tags
                  // rehypePlugins={[rehypeRaw, rehypeHighlight]} // if using syntax highlighting
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
              Projects {isOwnProfile ? "I've" : `${profile.name || viewingUsername} has`} created or collaborated on within DevLink
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No DevLink projects yet. {isOwnProfile ? "Start collaborating!" : ""}
              </p>
              {isOwnProfile && (
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
