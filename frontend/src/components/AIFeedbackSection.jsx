import React from "react";

export default function AIFeedbackSection({ feedback }) {
    if (!feedback) return null;

    const parseFeedback = (text) => {
        const lowerText = text.toLowerCase();
        
        const strengthsRegex = /(strengths|key competencies|pros):?/i;
        const weaknessesRegex = /(weaknesses|missing skills|areas for improvement|cons):?/i;
        const suggestionsRegex = /(suggestions|recommendations|actionable suggestions|tips):?/i;
        
        const strengthsMatch = text.match(strengthsRegex);
        const weaknessesMatch = text.match(weaknessesRegex);
        const suggestionsMatch = text.match(suggestionsRegex);
        
        if (!strengthsMatch && !weaknessesMatch && !suggestionsMatch) {
            return { generic: text };
        }
        
        const sections = [];
        if (strengthsMatch) sections.push({ name: "strengths", index: strengthsMatch.index, length: strengthsMatch[0].length });
        if (weaknessesMatch) sections.push({ name: "weaknesses", index: weaknessesMatch.index, length: weaknessesMatch[0].length });
        if (suggestionsMatch) sections.push({ name: "suggestions", index: suggestionsMatch.index, length: suggestionsMatch[0].length });
        
        sections.sort((a, b) => a.index - b.index);
        
        const result = {};
        
        for (let i = 0; i < sections.length; i++) {
            const current = sections[i];
            const start = current.index + current.length;
            const end = (i + 1 < sections.length) ? sections[i+1].index : text.length;
            
            const content = text.substring(start, end).trim();
            const items = content
                .split(/\n+/)
                .map(line => line.trim().replace(/^[-*•\d\.\s]+/, "").trim())
                .filter(line => line.length > 0);
                
            result[current.name] = items;
        }
        
        return result;
    };

    const sections = parseFeedback(feedback);

    if (sections.generic) {
        return (
            <div className="glass-card" style={{
                background: "rgba(15, 23, 42, 0.4)",
                border: "1px solid rgba(99, 102, 241, 0.15)",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
                padding: "24px",
                borderRadius: "16px",
                textAlign: "left"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "1.4rem" }}>🤖</span>
                    <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>AI Analysis Feedback</h4>
                </div>
                <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-line", margin: 0 }}>
                    {sections.generic}
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", textAlign: "left" }}>
            {/* Strengths Card */}
            {sections.strengths && sections.strengths.length > 0 && (
                <div className="glass-card" style={{
                    background: "rgba(16, 185, 129, 0.02)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    boxShadow: "0 8px 32px 0 rgba(16, 185, 129, 0.03)",
                    padding: "24px",
                    borderRadius: "16px",
                    transition: "transform 0.2s, border-color 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.2)"; }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                        <span style={{ fontSize: "1.3rem" }}>✅</span>
                        <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#34d399" }}>Key Strengths</h4>
                    </div>
                    <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {sections.strengths.map((item, idx) => (
                            <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", margin: 0, color: "#e2e8f0", fontSize: "0.95rem", lineHeight: "1.5" }}>
                                <span style={{ color: "#34d399", fontWeight: "bold", userSelect: "none" }}>•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Weaknesses Card */}
            {sections.weaknesses && sections.weaknesses.length > 0 && (
                <div className="glass-card" style={{
                    background: "rgba(245, 158, 11, 0.02)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    boxShadow: "0 8px 32px 0 rgba(245, 158, 11, 0.03)",
                    padding: "24px",
                    borderRadius: "16px",
                    transition: "transform 0.2s, border-color 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.2)"; }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                        <span style={{ fontSize: "1.3rem" }}>⚠️</span>
                        <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#fbbf24" }}>Areas for Improvement</h4>
                    </div>
                    <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {sections.weaknesses.map((item, idx) => (
                            <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", margin: 0, color: "#e2e8f0", fontSize: "0.95rem", lineHeight: "1.5" }}>
                                <span style={{ color: "#fbbf24", fontWeight: "bold", userSelect: "none" }}>•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Suggestions Card */}
            {sections.suggestions && sections.suggestions.length > 0 && (
                <div className="glass-card" style={{
                    background: "rgba(99, 102, 241, 0.02)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    boxShadow: "0 8px 32px 0 rgba(99, 102, 241, 0.03)",
                    padding: "24px",
                    borderRadius: "16px",
                    transition: "transform 0.2s, border-color 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.2)"; }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                        <span style={{ fontSize: "1.3rem" }}>💡</span>
                        <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#818cf8" }}>Actionable Suggestions</h4>
                    </div>
                    <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {sections.suggestions.map((item, idx) => (
                            <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", margin: 0, color: "#e2e8f0", fontSize: "0.95rem", lineHeight: "1.5" }}>
                                <span style={{ color: "#818cf8", fontWeight: "bold", userSelect: "none" }}>•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
