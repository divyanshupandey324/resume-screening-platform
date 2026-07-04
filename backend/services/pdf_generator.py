from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_report(candidate_name, score):
    filename = f"{candidate_name}_report.pdf"
    pdf = SimpleDocTemplate(filename)
    styles = getSampleStyleSheet()
    elements = []
    
    elements.append(Paragraph("Candidate Evaluation Report", styles["Title"]))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"Candidate: {candidate_name}", styles["Normal"]))
    elements.append(Paragraph(f"Score: {score}", styles["Normal"]))
    pdf.build(elements)
    return filename

def generate_interview_pdf_report(candidate_name: str, job_title: str, metrics: dict) -> str:
    filename = f"uploads/{candidate_name.replace(' ', '_')}_interview_report.pdf"
    import os
    os.makedirs("uploads", exist_ok=True)
    
    pdf = SimpleDocTemplate(filename, pagesize=(612, 792), rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    # Custom colors
    primary_color = colors.HexColor("#6366f1")
    text_color = colors.HexColor("#1e293b")
    
    # Custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=primary_color,
        spaceAfter=15
    )
    
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=text_color
    )
    
    value_style = ParagraphStyle(
        'ValueStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        textColor=text_color
    )

    elements = []
    elements.append(Paragraph("AI Video Interview Evaluation Report", title_style))
    elements.append(Spacer(1, 10))
    
    info_data = [
        [Paragraph("Candidate Name:", label_style), Paragraph(candidate_name, value_style)],
        [Paragraph("Position:", label_style), Paragraph(job_title, value_style)],
        [Paragraph("Date Analyzed:", label_style), Paragraph(metrics.get("date_analyzed", "Today"), value_style)]
    ]
    info_table = Table(info_data, colWidths=[150, 350])
    info_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0,0), (-1,-1), text_color),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0"))
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph("Performance Metrics Breakdown", styles["Heading2"]))
    elements.append(Spacer(1, 10))
    
    metrics_data = [
        [Paragraph("Metric", label_style), Paragraph("Score", label_style), Paragraph("Evaluation Note", label_style)],
        [Paragraph("Confidence", value_style), Paragraph(f"{metrics.get('confidence')}%", value_style), Paragraph("Posture, facial expression, and tone steadiness.", value_style)],
        [Paragraph("Communication", value_style), Paragraph(f"{metrics.get('communication')}%", value_style), Paragraph("Pronunciation, voice tone consistency, pacing.", value_style)],
        [Paragraph("Eye Contact", value_style), Paragraph(f"{metrics.get('eye_contact')}%", value_style), Paragraph("Focus level and camera gaze distribution.", value_style)],
        [Paragraph("Fluency", value_style), Paragraph(f"{metrics.get('fluency')}%", value_style), Paragraph("Grammar correct rate and vocabulary richness.", value_style)],
        [Paragraph("Body Language", value_style), Paragraph(f"{metrics.get('body_language')}%", value_style), Paragraph("Hand gestures, expressions, head positioning.", value_style)],
        [Paragraph("Overall Score", label_style), Paragraph(f"{metrics.get('overall_score')}%", label_style), Paragraph("Composite score of all interview indicators.", label_style)]
    ]
    
    metrics_table = Table(metrics_data, colWidths=[120, 80, 300])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, colors.HexColor("#f8fafc")]),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#e0e7ff"))
    ]))
    elements.append(metrics_table)
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph("Linguistic & Coding Competence Summary", styles["Heading2"]))
    elements.append(Spacer(1, 5))
    elements.append(Paragraph(metrics.get("coding_assessment", "N/A"), value_style))
    elements.append(Spacer(1, 15))
    
    elements.append(Paragraph("Actionable Feedback", styles["Heading2"]))
    elements.append(Spacer(1, 5))
    elements.append(Paragraph(metrics.get("general_feedback", "N/A"), value_style))
    
    pdf.build(elements)
    return filename