import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";

export default function RecruiterDashboard() {

    const [stats, setStats] = useState({
        totalCandidates: 0,
        shortlisted: 0,
        rejected: 0,
        averageScore: 0,
        averageSkillMatch: 0
    });

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/analytics")
        .then((analyticsRes) => {
            const data = analyticsRes.data;
            setStats({
                totalCandidates: data.total_candidates || 0,
                shortlisted: data.shortlisted || 0,
                rejected: data.rejected || 0,
                averageScore: data.average_score || 0,
                averageSkillMatch: data.average_skill_match || 0
            });
        })
        .catch((error) => {
            console.log(error);
        });
    }, []);

    return (

        <div className="dashboard" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>

            <Sidebar />

            <div className="content" style={{ padding: "40px", flex: 1 }}>

                <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "10px" }}>

                    Recruiter Dashboard

                </h1>
                
                <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
                    Overview of your recruitment pipeline and candidate stats.
                </p>

                <br />

                <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>

                    <DashboardCard
                        title="Total Candidates"
                        value={stats.totalCandidates}
                    />

                    <DashboardCard
                        title="Shortlisted Candidates"
                        value={stats.shortlisted}
                    />

                    <DashboardCard
                        title="Rejected Candidates"
                        value={stats.rejected}
                    />

                    <DashboardCard
                        title="Average Score"
                        value={`${stats.averageScore}%`}
                    />

                    <DashboardCard
                        title="Average Skill Match"
                        value={`${stats.averageSkillMatch}%`}
                    />

                </div>

            </div>

        </div>

    );

}