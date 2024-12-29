'use client';

import ContributionHeatmap from '@/components/Heatmap';
import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [submittedUsername, setSubmittedUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedUsername(username);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          GitHub Contribution Heatmap
        </h1>

        <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
            className="flex-1 px-4 py-2 rounded bg-gray-800 text-white"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        {submittedUsername && (
          <ContributionHeatmap username={submittedUsername} />
        )}
      </div>
    </main>
  );
}
