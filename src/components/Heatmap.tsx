'use client';

import { useEffect, useState } from 'react';

interface ContributionCell {
  date: Date;
  count: number;
  intensity: number;
}

interface GitHubStats {
  followers: number;
  following: number;
  longestStreak: number;
  currentStreak: number;
  totalRepositories: number;
  totalStars: number;
}

interface TooltipPosition {
  x: number;
  y: number;
}

export function ContributionHeatmap({
  username,
  isEmbedded = false,
}: {
  username: string;
  isEmbedded?: boolean;
}) {
  const [contributions, setContributions] = useState<ContributionCell[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalContributions, setTotalContributions] = useState(0);
  const [months, setMonths] = useState<string[]>([]);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    count: number;
    position: TooltipPosition;
  } | null>(null);
  const [embedCode, setEmbedCode] = useState('');

  useEffect(() => {
    const generateMonthLabels = () => {
      const labels: string[] = [];
      const now = new Date();
      const currentMonth = now.getMonth();

      // Start from 11 months ago and include current month
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), currentMonth - i, 1);
        labels.push(date.toLocaleString('default', { month: 'short' }));
      }
      setMonths(labels);
    };

    generateMonthLabels();

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    setEmbedCode(
      `<iframe src="${baseUrl}/embed/${username}" width="100%" height="400" frameborder="0"></iframe>`
    );
  }, [username]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [contributionsResponse, statsResponse] = await Promise.all([
          fetch(
            `/api/github/contributions?username=${encodeURIComponent(username)}`
          ),
          fetch(`/api/github/stats?username=${encodeURIComponent(username)}`),
        ]);

        const [contributionsData, statsData] = await Promise.all([
          contributionsResponse.json(),
          statsResponse.json(),
        ]);

        if (!contributionsResponse.ok) {
          throw new Error(
            contributionsData.error || 'Failed to fetch contributions'
          );
        }

        const calendar =
          contributionsData.data.user.contributionsCollection
            .contributionCalendar;
        setTotalContributions(calendar.totalContributions);
        setContributions(processContributionData(calendar.weeks));
        setStats(statsData);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchData();
    }
  }, [username]);

  function handleCellHover(
    event: React.MouseEvent<HTMLDivElement>,
    day: ContributionCell
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    const position: TooltipPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    };

    setHoveredCell({
      date: day.date.toLocaleDateString(),
      count: day.count,
      position,
    });
  }

  function getIntensityColor(count: number): string {
    if (count === 0) return 'bg-neutral-800 hover:bg-neutral-700';
    if (count <= 3) return 'bg-emerald-900/50 hover:bg-emerald-900/70';
    if (count <= 6) return 'bg-emerald-700/50 hover:bg-emerald-700/70';
    if (count <= 9) return 'bg-emerald-500/50 hover:bg-emerald-500/70';
    return 'bg-emerald-300/50 hover:bg-emerald-300/70';
  }

  function processContributionData(weeks: any[]): ContributionCell[][] {
    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setFullYear(today.getFullYear() - 1);

    return weeks
      .filter((week) => {
        const weekDate = new Date(week.contributionDays[0].date);
        return weekDate >= yearAgo && weekDate <= today;
      })
      .map((week) =>
        week.contributionDays.map((day: any) => ({
          date: new Date(day.date),
          count: day.contributionCount,
          intensity: calculateIntensity(day.contributionCount),
        }))
      );
  }

  function calculateIntensity(count: number): number {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-neutral-400">Loading contributions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`w-full ${isEmbedded ? 'max-w-full' : 'max-w-4xl'}`}>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/95 backdrop-blur-sm p-6 shadow-xl">
        {!isEmbedded && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-100 mb-4">
              GitHub Activity - {username}
            </h1>
            <div className="bg-neutral-800/50 p-4 rounded-md backdrop-blur-sm">
              <h3 className="text-sm text-neutral-400 mb-2">
                Embed this chart
              </h3>
              <code className="text-xs text-neutral-300 block p-2 bg-neutral-950 rounded border border-neutral-700">
                {embedCode}
              </code>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Contributions"
            value={totalContributions}
            icon="🔥"
          />
          <StatCard title="Followers" value={stats?.followers || 0} icon="👥" />
          <StatCard
            title="Longest Streak"
            value={stats?.longestStreak || 0}
            icon="⚡"
          />
          <StatCard
            title="Repositories"
            value={stats?.totalRepositories || 0}
            icon="📚"
          />
        </div>

        <div className="relative overflow-hidden">
          {hoveredCell && (
            <div
              className="fixed z-50 bg-neutral-900 border border-neutral-700 rounded-md p-2 text-neutral-200 text-xs whitespace-nowrap pointer-events-none shadow-lg transform -translate-x-1/2"
              style={{
                left: hoveredCell.position.x,
                top: hoveredCell.position.y,
              }}
            >
              {hoveredCell.date}: {hoveredCell.count} contributions
            </div>
          )}

          <div className="flex flex-col">
            <div className="flex">
              <div className="w-8" />
              <div className="flex-1">
                <div className="grid grid-cols-12 text-xs text-neutral-400 mb-2">
                  {months.map((month, i) => (
                    <div
                      key={i}
                      className="text-center transform -translate-x-1/2 font-medium"
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex flex-col justify-between pr-2 text-xs text-neutral-400">
                <div className="h-[17px]" />
                <div className="h-[15px] flex items-center font-medium">
                  Mon
                </div>
                <div className="h-[17px]" />
                <div className="h-[15px] flex items-center font-medium">
                  Wed
                </div>
                <div className="h-[17px]" />
                <div className="h-[15px] flex items-center font-medium">
                  Fri
                </div>
                <div className="h-[17px]" />
              </div>

              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-[3px] min-w-max">
                  {contributions.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[3px]">
                      {week.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          onMouseEnter={(event) => handleCellHover(event, day)}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`h-[15px] w-[15px] rounded-sm transition-colors duration-200 ${getIntensityColor(
                            day.count
                          )}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-neutral-400 bg-neutral-800/30 p-3 rounded-lg backdrop-blur-sm">
            <div className="font-medium">Less</div>
            <div className="flex gap-[4px]">
              {[800, 900, 700, 500, 300].map((shade, index) => (
                <div
                  key={index}
                  className={`h-[15px] w-[15px] rounded-sm ${
                    shade === 800 ? 'bg-neutral-800' : `bg-emerald-${shade}/50`
                  }`}
                />
              ))}
            </div>
            <div className="font-medium">More</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-neutral-800/50 rounded-lg p-4 backdrop-blur-sm transition-all duration-200 hover:bg-neutral-800/70">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h3 className="text-sm text-neutral-400">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-neutral-100">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export default ContributionHeatmap;
