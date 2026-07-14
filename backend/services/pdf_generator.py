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
