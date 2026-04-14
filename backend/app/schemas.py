from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


SeverityLabel = Literal["LOW", "MEDIUM", "HIGH"]
UrgencyLabel = Literal["normal", "urgent"]
WasteLabel = Literal["dry", "wet", "hazardous", "unknown"]


class LocationInput(BaseModel):
    latitude: float | None = None
    longitude: float | None = None


class TextAnalysisRequest(BaseModel):
    complaint_text: str = Field(min_length=1)


class ComplaintCreate(BaseModel):
    complaint_text: str = Field(default="")
    latitude: float | None = None
    longitude: float | None = None


class ComplaintCreateRequest(BaseModel):
    complaint_text: str = Field(default="")
    severity: SeverityLabel | None = None
    waste_type: WasteLabel | None = None
    urgency: UrgencyLabel | None = None
    keywords: list[str] = Field(default_factory=list)
    latitude: float | None = None
    longitude: float | None = None
    image_path: str | None = None


class TextAnalysisResponse(BaseModel):
    complaint_text: str
    urgency: UrgencyLabel
    keywords: list[str]


class DetectionBox(BaseModel):
    label: str
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float
    area: float


class ImageAnalysisResponse(BaseModel):
    severity: SeverityLabel
    severity_score: float
    waste_type: WasteLabel
    bounding_boxes: list[DetectionBox]
    confidence_scores: list[float]
    detected_labels: list[str]
    image_path: str | None = None


class ComplaintResponse(BaseModel):
    id: int
    image_path: str | None
    complaint_text: str
    severity: SeverityLabel
    waste_type: WasteLabel
    urgency: UrgencyLabel
    keywords: list[str]
    latitude: float | None
    longitude: float | None
    resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintListResponse(BaseModel):
    complaints: list[ComplaintResponse]


class ResolveRequest(BaseModel):
    resolved: bool = True


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ApiMessage(BaseModel):
    message: str


class AnalyzeImageInput(BaseModel):
    complaint_text: str = ""
    latitude: float | None = None
    longitude: float | None = None


class AnalyzeImageMeta(BaseModel):
    complaint_text: str = ""
    latitude: float | None = None
    longitude: float | None = None

