from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps import get_db, require_admin_authorization
from app.schemas import ComplaintCreateRequest, ComplaintListResponse, ComplaintResponse, ResolveRequest
from app.services.complaint_service import create_complaint, list_complaints, mark_resolved
from app.services.nlp import detect_urgency, extract_keywords

router = APIRouter(prefix="/complaints", tags=["complaints"])

@router.post("", response_model=ComplaintResponse)
def create_public_complaint(
    payload: ComplaintCreateRequest,
    db: Session = Depends(get_db),
) -> ComplaintResponse:
    urgency = payload.urgency or (detect_urgency(payload.complaint_text) if payload.complaint_text else "normal")
    keywords = payload.keywords or (extract_keywords(payload.complaint_text) if payload.complaint_text else [])
    severity = payload.severity or ("MEDIUM" if urgency == "urgent" else "LOW")
    waste_type = payload.waste_type or "unknown"

    complaint = create_complaint(
        db=db,
        image_path=payload.image_path,
        complaint_text=payload.complaint_text,
        severity=severity,
        waste_type=waste_type,
        urgency=urgency,
        keywords=keywords,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    return ComplaintResponse(
        id=complaint.id,
        image_path=complaint.image_path,
        complaint_text=complaint.complaint_text,
        severity=complaint.severity,
        waste_type=complaint.waste_type,
        urgency=complaint.urgency,
        keywords=complaint.keywords.split(",") if complaint.keywords else [],
        latitude=complaint.latitude,
        longitude=complaint.longitude,
        resolved=complaint.resolved,
        created_at=complaint.created_at,
    )


@router.get("", response_model=ComplaintListResponse)
def get_complaints(
    db: Session = Depends(get_db),
    _admin: str = Depends(require_admin_authorization),
    sort_by_severity: bool = Query(default=True),
) -> ComplaintListResponse:
    complaint_rows = list_complaints(db=db, sort_by_severity=sort_by_severity)
    complaints = []
    for row in complaint_rows:
        complaints.append(
            ComplaintResponse(
                id=row.id,
                image_path=row.image_path,
                complaint_text=row.complaint_text,
                severity=row.severity,  
                waste_type=row.waste_type,
                urgency=row.urgency,
                keywords=row.keywords.split(",") if row.keywords else [],
                latitude=row.latitude,
                longitude=row.longitude,
                resolved=row.resolved,
                created_at=row.created_at,
            )
        )
    return ComplaintListResponse(complaints=complaints)


@router.patch("/{complaint_id}/resolve", response_model=ComplaintResponse)
def resolve_complaint(
    complaint_id: int,
    payload: ResolveRequest,
    db: Session = Depends(get_db),
    _admin: str = Depends(require_admin_authorization),
) -> ComplaintResponse:
    complaint = mark_resolved(db=db, complaint_id=complaint_id, resolved=payload.resolved)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return ComplaintResponse(
        id=complaint.id,
        image_path=complaint.image_path,
        complaint_text=complaint.complaint_text,
        severity=complaint.severity,
        waste_type=complaint.waste_type,
        urgency=complaint.urgency,
        keywords=complaint.keywords.split(",") if complaint.keywords else [],
        latitude=complaint.latitude,
        longitude=complaint.longitude,
        resolved=complaint.resolved,
        created_at=complaint.created_at,
    )
