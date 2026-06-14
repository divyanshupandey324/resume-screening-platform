import { Link } from "react-router-dom";

export default function Home(){

    return(

        <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "radial-gradient(circle at center, #1e293b, #0f172a)" }}>

            <h1 style={{ fontSize: "3rem", fontWeight: "800", color: "#f8fafc", textShadow: "0 0 20px rgba(99, 102, 241, 0.4)", marginBottom: "10px" }}>

                AI Recruitment Platform

            </h1>

            <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "40px" }}>
                Next-generation ATS and Smart Resume Screening Engine
            </p>

            <div className="glass-card" style={{ maxWidth: "450px", width: "100%", textAlign: "center", padding: "40px" }}>

                <h2 style={{ color: "#f1f5f9", marginBottom: "15px", fontWeight: "600" }}>

                    Get Started

                </h2>

                <p style={{ color: "#cbd5e1", fontSize: "0.95rem", marginBottom: "30px" }}>

                    Please select an option below to enter the workspace.

                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <Link to="/login">
                        <button className="btn" style={{ width: "100%", padding: "14px", fontSize: "1rem", fontWeight: "600", transition: "all 0.3s ease" }}>
                            Login to Account
                        </button>
                    </Link>

                    <Link to="/register">
                        <button className="btn" style={{ width: "100%", padding: "14px", fontSize: "1rem", fontWeight: "600", background: "transparent", border: "2px solid #6366f1", color: "#6366f1", transition: "all 0.3s ease" }}>
                            Register New Account
                        </button>
                    </Link>
                </div>

            </div>

        </div>

    )

}