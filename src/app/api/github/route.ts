import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        followers {
          totalCount
        }
        following {
          totalCount
        }
        repositories(first: 100, ownerAffiliations: OWNER) {
          totalCount
          nodes {
            stargazers {
              totalCount
            }
          }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
          contributionYears
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    const user = data.data.user;
    const totalStars = user.repositories.nodes.reduce(
      (acc: number, repo: any) => acc + repo.stargazers.totalCount,
      0
    );

    return NextResponse.json({
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      totalRepositories: user.repositories.totalCount,
      totalStars,
      // You'll need to implement streak calculation logic
      longestStreak: 0,
      currentStreak: 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
