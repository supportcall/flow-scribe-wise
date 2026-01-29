interface StatDisplayProps {
  value: string;
  label: string;
}

export function StatDisplay({ value, label }: StatDisplayProps) {
  return (
    <div className="text-center md:text-left">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
