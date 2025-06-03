// GitHub API utility functions
interface GitHubUser {
  login: string;
  id: number;
  name: string;
  email: string;
  bio: string;
  location: string;
  avatar_url: string;
  html_url: string;
  blog: string;
  twitter_username: string;
  public_repos: number;
  followers: number;
  following: number;
  company: string;
  created_at: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
}

interface GitHubContribution {
  date: string;
  contributionCount: number;
}

export class GitHubAPI {
  private accessToken: string;
  private baseUrl = 'https://api.github.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUser(): Promise<GitHubUser> {
    return this.request('/user');
  }

  async getUserByUsername(username: string): Promise<GitHubUser> {
    return this.request(`/users/${username}`);
  }

  async getRepositories(username: string, options: { sort?: 'updated' | 'created' | 'pushed'; per_page?: number } = {}): Promise<GitHubRepo[]> {
    const params = new URLSearchParams({
      sort: options.sort || 'updated',
      per_page: (options.per_page || 10).toString(),
    });
    return this.request(`/users/${username}/repos?${params}`);
  }

  async getPinnedRepositories(username: string): Promise<GitHubRepo[]> {
    // Note: GitHub doesn't have a direct API for pinned repos
    // This is a workaround using GraphQL-like approach or most starred repos
    const repos = await this.getRepositories(username, { sort: 'updated', per_page: 6 });
    return repos.slice(0, 6); // Return top 6 as "pinned"
  }

  async getProfileReadme(username: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${username}/${username}/contents/README.md`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        return null; // No profile README
      }

      const data = await response.json();
      if (data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile README:', error);
      return null;
    }
  }

  async getContributionStats(username: string): Promise<{ totalContributions: number; contributionsByMonth: GitHubContribution[] }> {
    try {
      // This would typically require GraphQL API for full contribution graph
      // For now, we'll use a simplified approach
      const repos = await this.getRepositories(username, { per_page: 100 });
      
      // Calculate basic stats from repositories
      const totalContributions = repos.reduce((total, repo) => total + repo.stargazers_count, 0);
      
      // Mock monthly contributions (in a real app, you'd use GraphQL API)
      const contributionsByMonth = Array.from({ length: 12 }, (_, i) => ({
        date: new Date(2024, i, 1).toISOString().split('T')[0],
        contributionCount: Math.floor(Math.random() * 50) + 10,
      }));

      return {
        totalContributions,
        contributionsByMonth,
      };
    } catch (error) {
      console.error('Error fetching contribution stats:', error);
      return {
        totalContributions: 0,
        contributionsByMonth: [],
      };
    }
  }

  async getOrganizations(username: string) {
    try {
      return this.request(`/users/${username}/orgs`);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }
  }
}

// Helper function to extract skills from repositories
export function extractSkillsFromRepos(repos: GitHubRepo[]): Array<{ name: string; level: string }> {
  const languageCounts: Record<string, number> = {};
  
  repos.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
    
    // Extract skills from topics
    repo.topics?.forEach(topic => {
      const skill = topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      languageCounts[skill] = (languageCounts[skill] || 0) + 1;
    });
  });

  return Object.entries(languageCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10) // Top 10 skills
    .map(([language, count]) => ({
      name: language,
      level: count >= 5 ? 'Expert' : count >= 3 ? 'Advanced' : count >= 2 ? 'Intermediate' : 'Beginner'
    }));
}

export type { GitHubUser, GitHubRepo, GitHubContribution };
