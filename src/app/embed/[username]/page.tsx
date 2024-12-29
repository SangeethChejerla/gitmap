import ContributionHeatmap from '@/components/Heatmap';

export default function EmbedPage({
  params,
}: {
  params: { username: string };
}) {
  return (
    <div className="p-4">
      <ContributionHeatmap username={params.username} isEmbedded={true} />
    </div>
  );
}
