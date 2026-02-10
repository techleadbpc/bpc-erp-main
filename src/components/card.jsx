function DataCard({ icon, data, title, chart }) {
  return (
    <div className="flex-1 flex items-center justify-between bg-muted/100 rounded p-4">
      <div className="space-y-2">
        {icon}
        <p className="font-semibold">{data}</p>
        <p className="text-xs text-[hsl(var(--primary))]">{title}</p>
      </div>
      <div>{chart}</div>
    </div>
  );
}

export default DataCard;
