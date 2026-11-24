import React from 'react';

const StatCard = ({ title, count, icon, colorClass, bgClass, subtitle }) => {
  return (
    <div className="col-12 col-sm-6 col-lg">
      <div className="tf-card tf-card-hover p-3 h-100 d-flex flex-column justify-content-between">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="text-muted small fw-medium text-uppercase">{title}</span>
          <div className={`stat-icon-wrapper ${bgClass} ${colorClass}`}>
            <i className={`bi ${icon}`}></i>
          </div>
        </div>
        <div>
          <h2 className="fw-bold mb-1">{count}</h2>
          {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
