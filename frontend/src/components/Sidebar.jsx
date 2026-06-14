import { Link } from "react-router-dom";

export default function Sidebar() {

    return (

        <div className="sidebar" style={{ background: "#0f172a", borderRight: "1px solid #1e293b", padding: "30px 20px" }}>

            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#6366f1", marginBottom: "40px" }}>

                AI Recruit

            </h2>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>

                <li>
                    <Link to="/recruiter" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600", display: "block", padding: "10px 15px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.style.background = "#1e293b"; e.target.style.color = "#6366f1";}} onMouseLeave={(e) => {e.target.style.background = "transparent"; e.target.style.color = "#cbd5e1";}}>
                        📊 Dashboard
                    </Link>
                </li>

                <li>
                    <Link to="/candidate-db" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600", display: "block", padding: "10px 15px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.style.background = "#1e293b"; e.target.style.color = "#6366f1";}} onMouseLeave={(e) => {e.target.style.background = "transparent"; e.target.style.color = "#cbd5e1";}}>
                        📂 Candidate Database
                    </Link>
                </li>

                <li>
                    <Link to="/rankings" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600", display: "block", padding: "10px 15px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.style.background = "#1e293b"; e.target.style.color = "#6366f1";}} onMouseLeave={(e) => {e.target.style.background = "transparent"; e.target.style.color = "#cbd5e1";}}>
                        🏆 Rankings
                    </Link>
                </li>

                <li>
                    <Link to="/analytics" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600", display: "block", padding: "10px 15px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.style.background = "#1e293b"; e.target.style.color = "#6366f1";}} onMouseLeave={(e) => {e.target.style.background = "transparent"; e.target.style.color = "#cbd5e1";}}>
                        📈 Analytics
                    </Link>
                </li>

                <li>
                    <Link to="/skill-gap" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600", display: "block", padding: "10px 15px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.style.background = "#1e293b"; e.target.style.color = "#6366f1";}} onMouseLeave={(e) => {e.target.style.background = "transparent"; e.target.style.color = "#cbd5e1";}}>
                        ⚡ Skill Gap
                    </Link>
                </li>

                <li>
                    <Link to="/resume-upload" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600", display: "block", padding: "10px 15px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.style.background = "#1e293b"; e.target.style.color = "#6366f1";}} onMouseLeave={(e) => {e.target.style.background = "transparent"; e.target.style.color = "#cbd5e1";}}>
                        📤 Resume Upload
                    </Link>
                </li>

            </ul>

        </div>

    );

}