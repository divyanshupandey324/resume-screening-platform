import { useEffect, useState } from "react";
import axios from "axios";

import { Pie } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function CandidatePieChart({ onDataLoad }) {

  const [chartData, setChartData] = useState({
    labels: ["Shortlisted", "Rejected"],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: [
          "rgba(16, 185, 129, 0.2)",
          "rgba(239, 68, 68, 0.2)"
        ],
        borderColor: [
          "rgba(16, 185, 129, 1)",
          "rgba(239, 68, 68, 1)"
        ],
        borderWidth: 1
      }
    ]
  });

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/analytics")
      .then((response) => {
        const shortlisted = response.data.shortlisted || 0;
        const rejected = response.data.rejected || 0;
        const totalCandidates = response.data.total_candidates || (shortlisted + rejected);

        setChartData({
          labels: ["Shortlisted", "Rejected"],
          datasets: [
            {
              data: [shortlisted, rejected],
              backgroundColor: [
                "rgba(16, 185, 129, 0.65)", // Premium emerald green
                "rgba(244, 63, 94, 0.65)"   // Premium rose red
              ],
              borderColor: [
                "rgba(16, 185, 129, 1)",
                "rgba(244, 63, 94, 1)"
              ],
              borderWidth: 2,
              hoverOffset: 6
            }
          ]
        });

        if (onDataLoad) {
          onDataLoad({ shortlisted, rejected, total_candidates: totalCandidates });
        }
      })
      .catch((error) => {
        console.log("Error loading CandidatePieChart data:", error);
      });
  }, []);

  return (
    <div className="glass-card" style={{ padding: "25px", height: "100%", minHeight: "380px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <h2 style={{ fontSize: "1.2rem", color: "#f1f5f9", marginBottom: "20px", marginTop: 0, textAlign: "left" }}>
        📊 Screening Status Distribution
      </h2>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", maxHeight: "280px" }}>
        <Pie 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
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