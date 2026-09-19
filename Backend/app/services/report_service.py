from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import os


def generate_inspection_report(
    inspection,
    findings,
    corrective_actions,
    output_path,
):

    os.makedirs(
        os.path.dirname(output_path),
        exist_ok=True
    )

    document = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=22,
        leading=26,
        alignment=TA_CENTER,
        spaceAfter=8,
    )

    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#64748b"),
        alignment=TA_CENTER,
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        "Heading",
        parent=styles["Heading2"],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=12,
        spaceAfter=8,
    )

    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
    )

    small_style = ParagraphStyle(
        "Small",
        parent=styles["BodyText"],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#475569"),
    )

    story = []

    # -------------------------------------------------
    # HEADER
    # -------------------------------------------------

    story.append(
        Paragraph(
            "INSPECTAI",
            title_style
        )
    )

    story.append(
        Paragraph(
            "Industrial Inspection Report",
            subtitle_style
        )
    )

    # -------------------------------------------------
    # INSPECTION DETAILS
    # -------------------------------------------------

    story.append(
        Paragraph(
            "Inspection Details",
            heading_style
        )
    )

    inspection_data = [
        ["Inspection", inspection.title or "-"],
        ["Location", inspection.location or "-"],
        ["Inspector", inspection.inspector or "-"],
        ["Inspection Date", inspection.inspection_date or "-"],
        ["Status", inspection.status or "-"],
        ["Risk Level", inspection.risk_level or "-"],
        [
            "Compliance Score",
            f"{inspection.compliance_score or 0}%"
        ],
    ]

    inspection_table = Table(
        inspection_data,
        colWidths=[
            42 * mm,
            125 * mm,
        ],
    )

    inspection_table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (0, -1),
                colors.HexColor("#f8fafc")
            ),
            (
                "TEXTCOLOR",
                (0, 0),
                (0, -1),
                colors.HexColor("#475569")
            ),
            (
                "FONTNAME",
                (0, 0),
                (0, -1),
                "Helvetica-Bold"
            ),
            (
                "FONTNAME",
                (1, 0),
                (1, -1),
                "Helvetica"
            ),
            (
                "FONTSIZE",
                (0, 0),
                (-1, -1),
                9
            ),
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.HexColor("#e2e8f0")
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                7
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                7
            ),
        ])
    )

    story.append(inspection_table)

    # -------------------------------------------------
    # SUMMARY
    # -------------------------------------------------

    story.append(
        Paragraph(
            "Inspection Summary",
            heading_style
        )
    )

    summary_text = (
        f"The inspection was assessed with an overall "
        f"risk level of <b>{inspection.risk_level}</b> "
        f"and a compliance score of "
        f"<b>{inspection.compliance_score or 0}%</b>. "
        f"A total of <b>{len(findings)}</b> finding(s) "
        f"were identified."
    )

    story.append(
        Paragraph(
            summary_text,
            body_style
        )
    )

    story.append(Spacer(1, 8))

    # -------------------------------------------------
    # FINDINGS
    # -------------------------------------------------

    story.append(
        Paragraph(
            "Inspection Findings",
            heading_style
        )
    )

    if not findings:

        story.append(
            Paragraph(
                "No findings were identified during AI analysis.",
                body_style
            )
        )

    else:

        for index, finding in enumerate(
            findings,
            start=1
        ):

            story.append(
                Paragraph(
                    f"{index}. {finding.title}",
                    ParagraphStyle(
                        f"FindingTitle{index}",
                        parent=body_style,
                        fontSize=10,
                        leading=14,
                        textColor=colors.HexColor(
                            "#0f172a"
                        ),
                        fontName="Helvetica-Bold",
                        spaceAfter=4,
                    )
                )
            )

            finding_data = [
                [
                    "Severity",
                    finding.severity or "-"
                ],
                [
                    "Category",
                    finding.category or "-"
                ],
                [
                    "Status",
                    finding.status or "-"
                ],
                [
                    "Page",
                    str(
                        finding.page_number
                    )
                    if finding.page_number
                    else "-"
                ],
                [
                    "Source",
                    finding.source_document or "-"
                ],
            ]

            finding_table = Table(
                finding_data,
                colWidths=[
                    35 * mm,
                    132 * mm,
                ],
            )

            finding_table.setStyle(
                TableStyle([
                    (
                        "BACKGROUND",
                        (0, 0),
                        (0, -1),
                        colors.HexColor("#f8fafc")
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (0, -1),
                        "Helvetica-Bold"
                    ),
                    (
                        "FONTSIZE",
                        (0, 0),
                        (-1, -1),
                        8
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.4,
                        colors.HexColor("#e2e8f0")
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP"
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5
                    ),
                ])
            )

            story.append(finding_table)

            story.append(Spacer(1, 5))

            story.append(
                Paragraph(
                    f"<b>Description:</b> "
                    f"{finding.description or '-'}",
                    small_style
                )
            )

            story.append(
                Spacer(1, 3)
            )

            story.append(
                Paragraph(
                    f"<b>Recommendation:</b> "
                    f"{finding.recommendation or '-'}",
                    small_style
                )
            )

            story.append(
                Spacer(1, 12)
            )

    # -------------------------------------------------
    # CORRECTIVE ACTIONS
    # -------------------------------------------------

    story.append(
        Paragraph(
            "Corrective Actions",
            heading_style
        )
    )

    if not corrective_actions:

        story.append(
            Paragraph(
                "No corrective actions have been created.",
                body_style
            )
        )

    else:

        action_data = [
            [
                "Action",
                "Assigned To",
                "Priority",
                "Due Date",
                "Status",
            ]
        ]

        for action in corrective_actions:

            action_data.append([
                Paragraph(
                    action.title or "-",
                    small_style
                ),
                Paragraph(
                    action.assigned_to or "-",
                    small_style
                ),
                Paragraph(
                    action.priority or "-",
                    small_style
                ),
                Paragraph(
                    action.due_date or "-",
                    small_style
                ),
                Paragraph(
                    action.status or "-",
                    small_style
                ),
            ])

        action_table = Table(
            action_data,
            colWidths=[
                55 * mm,
                28 * mm,
                22 * mm,
                25 * mm,
                27 * mm,
            ],
            repeatRows=1,
        )

        action_table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#f8fafc")
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    colors.HexColor("#e2e8f0")
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP"
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
            ])
        )

        story.append(action_table)

    # -------------------------------------------------
    # FOOTER
    # -------------------------------------------------

    story.append(
        Spacer(1, 20)
    )

    story.append(
        Paragraph(
            "Generated by InspectAI — "
            "On-Premise Industrial Inspection Intelligence",
            subtitle_style
        )
    )

    document.build(story)