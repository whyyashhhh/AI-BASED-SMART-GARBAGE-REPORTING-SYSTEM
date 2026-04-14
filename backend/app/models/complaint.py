from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text

from app.db.session import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String(500), nullable=True)
    complaint_text = Column(Text, nullable=False, default="")
    severity = Column(String(20), nullable=False, default="LOW")
    waste_type = Column(String(20), nullable=False, default="unknown")
    urgency = Column(String(20), nullable=False, default="normal")
    keywords = Column(String(500), nullable=False, default="")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    resolved = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

