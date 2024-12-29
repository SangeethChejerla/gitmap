import ContributionHeatmap from '@/components/Heatmap';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">GitHub Contribution Widget</h1>
        <ContributionHeatmap username="example-user" />

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">How to Use</h2>
          <div className="prose prose-invert">
            <p>
              To embed this widget on your website, simply replace
              "example-user" with your GitHub username in the iframe code below:
            </p>
            <pre className="bg-neutral-900 p-4 rounded-lg overflow-x-auto">
              {`<iframe 
  src="${process.env.NEXT_PUBLIC_BASE_URL}/embed/YOUR-USERNAME" 
  width="100%" 
  height="400" 
  frameborder="0"
></iframe>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
