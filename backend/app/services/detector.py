from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

try:
    from PIL import Image
except Exception:  # pragma: no cover - fallback when Pillow is unavailable
    Image = None

try:
    from ultralytics import YOLO
except Exception:  # pragma: no cover - fallback when ultralytics is unavailable
    YOLO = None

from app.core.config import get_settings


@dataclass
class DetectionResult:
    label: str
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float

    @property
    def area(self) -> float:
        return max(0.0, self.x2 - self.x1) * max(0.0, self.y2 - self.y1)


class GarbageDetector:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.model = self._load_model()

    def _load_model(self):
        weights = self.settings.yolo_weights_path
        if YOLO is None or not weights.exists():
            return None
        try:
            return YOLO(str(weights))
        except Exception:
            return None

    def detect(self, image_path: str | Path) -> list[DetectionResult]:
        path = Path(image_path)
        if not path.exists():
            return []

        if self.model is None:
            return self._fallback_detect(path)

        try:
            outputs = self.model.predict(source=str(path), conf=0.25, verbose=False)
        except Exception:
            return self._fallback_detect(path)

        detections: list[DetectionResult] = []
        for output in outputs:
            names = getattr(output, "names", {})
            boxes = getattr(output, "boxes", None)
            if boxes is None:
                continue
            for box in boxes:
                coords = box.xyxy[0].tolist()
                cls_index = int(box.cls[0]) if getattr(box, "cls", None) is not None else 0
                detections.append(
                    DetectionResult(
                        label=str(names.get(cls_index, "garbage")),
                        confidence=float(box.conf[0]) if getattr(box, "conf", None) is not None else 0.0,
                        x1=float(coords[0]),
                        y1=float(coords[1]),
                        x2=float(coords[2]),
                        y2=float(coords[3]),
                    )
                )
        return detections

    def _fallback_detect(self, image_path: Path) -> list[DetectionResult]:
        if Image is None:
            return []
        try:
            with Image.open(image_path) as image:
                width, height = image.size
        except Exception:
            return []

        # Fallback keeps the app demoable without custom weights.
        return [
            DetectionResult(
                label="garbage",
                confidence=0.72,
                x1=width * 0.15,
                y1=height * 0.2,
                x2=width * 0.82,
                y2=height * 0.86,
            )
        ]


def classify_waste_type(labels: list[str]) -> str:
    joined = " ".join(label.lower() for label in labels)
    hazardous_keywords = {"battery", "chemical", "sharp", "medical", "glass", "syringe"}
    wet_keywords = {"food", "organic", "sewage", "sludge", "leaf", "wet"}
    dry_keywords = {"plastic", "paper", "metal", "cardboard", "bottle", "dry", "garbage"}

    if any(keyword in joined for keyword in hazardous_keywords):
        return "hazardous"
    if any(keyword in joined for keyword in wet_keywords):
        return "wet"
    if any(keyword in joined for keyword in dry_keywords):
        return "dry"
    return "unknown"


def calculate_severity(detections: list[DetectionResult], image_width: int, image_height: int) -> tuple[str, float]:
    if not detections:
        return "LOW", 0.0

    object_count_score = min(len(detections) / 6.0, 1.0)
    total_area = sum(d.area for d in detections)
    frame_area = max(1, image_width * image_height)
    area_score = min(total_area / frame_area, 1.0)
    confidence_score = sum(d.confidence for d in detections) / len(detections)

    severity_score = round((object_count_score * 0.4) + (area_score * 0.35) + (confidence_score * 0.25), 3)

    if severity_score >= 0.7:
        severity = "HIGH"
    elif severity_score >= 0.35:
        severity = "MEDIUM"
    else:
        severity = "LOW"
    return severity, severity_score
