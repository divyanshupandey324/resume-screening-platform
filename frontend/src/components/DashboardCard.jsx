import React from 'react';

const DashboardCard = React.memo(function DashboardCard({
    title,
    value
}) {
    return (
        <div className="glass-card">
            <h3>{title}</h3>
            <h1>{value}</h1>
        </div>
    )
});

export default DashboardCard;