export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}) {
  return (
    <div className={`stat-card stat-${variant}`}>
      <div className="stat-card-top">
        <div className="stat-icon">
          <Icon size={21} />
        </div>

        <span className="stat-title">{title}</span>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-subtitle">{subtitle}</div>
    </div>
  );
}
