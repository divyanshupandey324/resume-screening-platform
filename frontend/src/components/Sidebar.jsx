import { useLocation, Link } from "react-router-dom";

export default function Sidebar() {
    const location = useLocation();
    const currentPath = location.pathname;

    const links = [
        { to: "/recruiter", label: "📊 Dashboard" },
        { to: "/resume-screening", label: "📤 Resume Screening" },
        { to: "/job-posts", label: "💼 Job Posts" },
        { to: "/video-evaluator", label: "🎥 Video Evaluator" },
        { to: "/mcq-leaderboard", label: "📝 MCQ Leaderboard" },
        { to: "/candidate-db", label: "📂 Candidate Database" },
        { to: "/rankings", label: "🏆 Rankings" },
        { to: "/analytics", label: "📈 Analytics" },
        { to: "/skill-gap", label: "⚡ Skill Gap" }
    ];

    return (
        <div className="sidebar" style={{ background: "#0b0f19", borderRight: "1px solid #1e293b", padding: "30px 20px", display: "flex", flexDirection: "column", minHeight: "100vh", width: "260px" }}>
            <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#6366f1", marginBottom: "40px", letterSpacing: "0.5px" }}>
                    AI Recruit
                </h2>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {links.map((link) => {
                        const isActive = currentPath === link.to;
                        return (
                            <li key={link.to}>
                                <Link 
                                    to={link.to} 
                                    style={{ 
                                        color: isActive ? "#a5b4fc" : "#94a3b8", 
                                        textDecoration: "none", 
                                        fontSize: "0.9rem", 
                                        fontWeight: "600", 
                                        display: "block", 
                                        padding: "10px 15px", 
                                        borderRadius: "8px", 
                                        background: isActive ? "rgba(0, 0, 0, 0.35)" : "transparent",
                                        borderLeft: isActive ? "4px solid #6366f1" : "4px solid transparent",
                                        transition: "all 0.2s" 
                                    }} 
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.target.style.background = "rgba(99, 102, 241, 0.08)"; 
                                            e.target.style.color = "#6366f1";
                                        }
                                    }} 
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.target.style.background = "transparent"; 
                                            e.target.style.color = "#94a3b8";
                                        }
                                    }}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}