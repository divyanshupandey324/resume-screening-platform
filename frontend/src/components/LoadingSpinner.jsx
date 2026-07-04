import React from 'react';

export default function LoadingSpinner() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            width: '100%',
            background: 'transparent',
            color: '#cbd5e1'
        }}>
            <div style={{
                width: '45px',
                height: '45px',
                border: '3px solid rgba(99, 102, 241, 0.1)',
                borderTop: '3px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '20px',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)'
            }} />
            <div style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#94a3b8',
                letterSpacing: '0.05em',
                animation: 'pulse 1.5s ease-in-out infinite'
            }}>
                Loading Platform Workspace...
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
