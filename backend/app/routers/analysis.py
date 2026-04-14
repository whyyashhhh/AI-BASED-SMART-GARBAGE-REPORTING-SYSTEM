from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

try:
    from PIL import Image
except Exception:  # pragma: no cover - fallback when Pillow is unavailable
    Image = None

from app.core.config import ALLOWED_IMAGE_EXTENSIONS, get_settings
from app.deps import get_db
from app.schemas import AnalyzeImageMeta, ImageAnalysisResponse, TextAnalysisResponse
from app.services.complaint_service import create_complaint
from app.services.detector import GarbageDetector, calculate_severity, classify_waste_type
from app.services.nlp import detect_urgency, extract_keywords

router = APIRouter(tags=["analysis"])
settings = get_settings()
detector = GarbageDetector()


@router.post("/analyze-text", response_model=TextAnalysisResponse)
def analyze_text(complaint_text: str = Form(...)) -> TextAnalysisResponse:
    urgency = detect_urgency(complaint_text)
    keywords = extract_keywords(complaint_text)
    return TextAnalysisResponse(complaint_text=complaint_text, urgency=urgency, keywords=keywords)


@router.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image(
    db: Session = Depends(get_db),
    image: UploadFile = File(...),
    complaint_text: str = Form(default=""),
    latitude: float | None = Form(default=None),
    longitude: float | None = Form(default=None),
) -> ImageAnalysisResponse:
    suffix = Path(image.filename or "image.jpg").suffix.lower()
    if suffix not in ALLOWED_IMAGE_EXTENSIONS:
        suffix = ".jpg"

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid4().hex}{suffix}"
    stored_path = settings.upload_dir / stored_name

    contents = await image.read()
    stored_path.write_bytes(contents)

    if Image is None:
        width, height = 1, 1
    else:
        try:
            with Image.open(stored_path) as img:
                width, height = img.size
        except Exception:
            width, height = 1, 1

    detections = detector.detect(stored_path)
    severity, severity_score = calculate_severity(detections, width, height)
    labels = [d.label for d in detections]
    waste_type = classify_waste_type(labels)

    urgency = detect_urgency(complaint_text) if complaint_text else "normal"
    keywords = extract_keywords(complaint_text) if complaint_text else []

    create_complaint(
        db=db,
        image_path=str(stored_path),
        complaint_text=complaint_text,
        severity=severity,
        waste_type=waste_type,
        urgency=urgency,
        keywords=keywords,
        latitude=latitude,
        longitude=longitude,
    )

    return ImageAnalysisResponse(
        severity=severity,
        severity_score=severity_score,
        waste_type=waste_type,
        bounding_boxes=[
            {
                "label": detection.label,
                "confidence": detection.confidence,
                "x1": detection.x1,
                "y1": detection.y1,
                "x2": detection.x2,
                "y2": detection.y2,
                "area": detection.area,
            }
            for detection in detections
        ],
        confidence_scores=[detection.confidence for detection in detections],
        detected_labels=labels,
        image_path=str(stored_path),
    )
