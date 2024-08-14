import React from "react";

const StatItem: React.FC<{ title: string; value: string | number }> = ({
  title,
  value,
}) => {
  return (
    <div className="stat">
      <div className="stat-title">{title}</div>
      <div className="stat-value text-lg text-secondary">{value}</div>
    </div>
  );
};

export default StatItem;