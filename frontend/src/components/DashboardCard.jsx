export default function DashboardCard({
    title,
    value
}) {

    return (
        <div className="glass-card">
            <h3>{title}</h3>
            <h1>{value}</h1>
        </div>
    )
}