import { useEffect, useState } from "react";
import axios from "axios";

import { Bar } from "react-chartjs-2";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const colors = [
    "rgba(99, 102, 241, 0.65)",  // Indigo
    "rgba(168, 85, 247, 0.65)",  // Purple
    "rgba(236, 72, 153, 0.65)",  // Pink
    "rgba(59, 130, 246, 0.65)",  // Blue
    "rgba(45, 212, 191, 0.65)",  // Teal
    "rgba(16, 185, 129, 0.65)",  // Green
    "rgba(245, 158, 11, 0.65)"   // Amber
];

const borderColors = [
    "rgba(99, 102, 241, 1)",
    "rgba(168, 85, 247, 1)",
    "rgba(236, 72, 153, 1)",
    "rgba(59, 130, 246, 1)",
    "rgba(45, 212, 191, 1)",
    "rgba(16, 185, 129, 1)",
    "rgba(245, 158, 11, 1)"
];

export default function RankingBarChart({ onDataLoad }) {

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: "Score",
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1
            }
        ]
    });

    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/candidate/rankings")
            .then((response) => {
                const candidates = response.data || [];

                setChartData({
                    labels: candidates.map(c => c.name),
                    datasets: [
                        {
                            label: "ATS Score %",
                            data: candidates.map(c => c.score),
                            backgroundColor: candidates.map((_, i) => colors[i % colors.length]),
                            borderColor: candidates.map((_, i) => borderColors[i % borderColors.length]),
                            borderWidth: 2,
                            borderRadius: 8,
                            borderSkipped: false
                        }
                    ]
                });

                if (onDataLoad) {
                    onDataLoad(candidates);
                }
            })
            .catch((error) => {
                console.log("Error loading RankingBarChart data:", error);
            });
    }, []);

    return (
        <div className="glass-card" style={{ padding: "25px", height: "100%", minHeight: "380px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "1.2rem", color: "#f1f5f9", marginBottom: "20px", marginTop: 0, textAlign: "left" }}>
                🏆 Candidate Ranking (ATS Score)
            </h2>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "280px" }}>
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return ` ATS Score: ${context.parsed.y}%`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                min: 0,
                                max: 100,
                                grid: {
                                    color: "rgba(255, 255, 255, 0.05)"
                                },
                                ticks: {
                                    color: "#94a3b8",
                                    font: {
                                        weight: "600"
                                    }
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    color: "#cbd5e1",
                                    font: {
                                        weight: "600"
                                    }
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}