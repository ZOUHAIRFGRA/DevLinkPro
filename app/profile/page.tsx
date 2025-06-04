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
      plan: { name: "pro" }, // Add plan for own profile
    };

    return profile;
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return null;
  }
}

async function fetchPublicGitHubProfile(username: string) {
  try {
    const github = new GitHubAPI(); // No access token for public requests

    // Fetch public GitHub user data
    const githubUser = await github.getUserByUsername(username);
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

    // Transform GitHub data to our profile format (public data only)
    const profile = {
      id: githubUser.id.toString(),
      name: githubUser.name || githubUser.login,
      email: githubUser.email, // May be null for privacy
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
      plan: null, // No plan info for other users
    };

    return profile;
  } catch (error) {
    console.error("Error fetching public GitHub profile:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign-in");
  }

  if (!session.githubLogin) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">GitHub Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">
            Unable to determine your GitHub username. Please sign in with GitHub again.
          </p>
          <Button asChild>
            <Link href="/auth/sign-in">Sign in with GitHub</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Redirect to the user's own profile using their GitHub username
  redirect(`/profile/${session.githubLogin}`);
}
