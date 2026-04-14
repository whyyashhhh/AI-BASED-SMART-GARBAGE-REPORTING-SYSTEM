from pathlib import Path

from sqlalchemy.orm import Session

from app.models.complaint import Complaint
from app.schemas import ComplaintCreate


def create_complaint(
    db: Session,
    image_path: str | None,
    complaint_text: str,
    severity: str,
    waste_type: str,
    urgency: str,
    keywords: list[str],
    latitude: float | None,
    longitude: float | None,
) -> Complaint:
    complaint = Complaint(
        image_path=image_path,
        complaint_text=complaint_text,
        severity=severity,
        waste_type=waste_type,
        urgency=urgency,
        keywords=",".join(keywords),
        latitude=latitude,
        longitude=longitude,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


def list_complaints(db: Session, sort_by_severity: bool = True) -> list[Complaint]:
    query = db.query(Complaint)
    if sort_by_severity:
        severity_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        complaints = query.all()
        return sorted(complaints, key=lambda complaint: (severity_order.get(complaint.severity, 99), complaint.created_at),)
    return query.order_by(Complaint.created_at.desc()).all()


def mark_resolved(db: Session, complaint_id: int, resolved: bool = True) -> Complaint | None:
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if complaint is None:
        return None
    complaint.resolved = resolved
    db.commit()
    db.refresh(complaint)
    return complaint
