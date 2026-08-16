import { Octokit } from "@octokit/rest";
import { graphql as graphqlClient } from "@octokit/graphql";

const MAX_REPOS = 15;

export interface GithubRepoData {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  languages: Record<string, number> | null;
  url: string;
}

export interface GithubProfileData {
  username: string;
  bio: string | null;
  publicReposCount: number | null;
  followers: number | null;
  topLanguages: Record<string, number> | null;
  contributionData: GithubContributionCalendar | null;
}

export interface GithubAnalysisResult {
  profile: GithubProfileData;
  repos: GithubRepoData[];
}

interface GithubContributionDay {
  date: string;
  contributionCount: number;
}

interface GithubContributionWeek {
  contributionDays: GithubContributionDay[];
}

export interface GithubContributionCalendar {
  totalContributions: number;
  weeks: GithubContributionWeek[];
}

interface ContributionsQueryResult {
  user: {
    contributionsCollection: {
      contributionCalendar: GithubContributionCalendar;
    };
  } | null;
}

/** Extrai o username de uma URL de perfil do GitHub (ex: "https://github.com/fulano" -> "fulano"). */
export function extractGithubUsername(githubUrl: string): string {
  const match = githubUrl
    .trim()
    .match(/^https?:\/\/(www\.)?github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)\/?$/);

  if (!match) {
    throw new Error(`URL do GitHub inválida: "${githubUrl}"`);
  }

  return match[2];
}

export async function analyzeGithubProfile(githubUrl: string): Promise<GithubAnalysisResult> {
  const username = extractGithubUsername(githubUrl);

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  let user: Awaited<ReturnType<typeof octokit.rest.users.getByUsername>>["data"];
  try {
    ({ data: user } = await octokit.rest.users.getByUsername({ username }));
  } catch (error) {
    if (typeof error === "object" && error !== null && "status" in error && error.status === 404) {
      throw new Error("Usuário do GitHub não encontrado");
    }
    throw error;
  }
  const { data: repoList } = await octokit.rest.repos.listForUser({
    username,
    sort: "updated",
    per_page: MAX_REPOS,
  });

  const languagesByRepo = await Promise.all(
    repoList.map((repo) =>
      octokit.rest.repos.listLanguages({ owner: username, repo: repo.name }).then((res) => res.data)
    )
  );

  const topLanguages: Record<string, number> = {};
  for (const languages of languagesByRepo) {
    for (const [language, bytes] of Object.entries(languages)) {
      topLanguages[language] = (topLanguages[language] ?? 0) + (bytes ?? 0);
    }
  }

  const contributionData = process.env.GITHUB_TOKEN?.trim()
    ? await fetchContributionCalendar(username)
    : null;

  const repos: GithubRepoData[] = repoList.map((repo, index) => ({
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    languages: languagesByRepo[index],
    url: repo.html_url,
  }));

  const profile: GithubProfileData = {
    username: user.login,
    bio: user.bio,
    publicReposCount: user.public_repos,
    followers: user.followers,
    topLanguages,
    contributionData,
  };

  return { profile, repos };
}

async function fetchContributionCalendar(username: string): Promise<GithubContributionCalendar> {
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);

  const graphqlWithAuth = graphqlClient.defaults({
    headers: { authorization: `token ${process.env.GITHUB_TOKEN}` },
  });

  const result = await graphqlWithAuth<ContributionsQueryResult>(
    `
      query ($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `,
    {
      username,
      from: from.toISOString(),
      to: to.toISOString(),
    }
  );

  if (!result.user) {
    throw new Error("Usuário do GitHub não encontrado");
  }

  return result.user.contributionsCollection.contributionCalendar;
}
