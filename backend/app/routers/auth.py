from fastapi import APIRouter, HTTPException, status

from app.schemas import AdminLoginRequest, TokenResponse
from app.services.auth import create_access_token, verify_admin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: AdminLoginRequest) -> TokenResponse:
    if not verify_admin(payload.username, payload.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=payload.username)
    return TokenResponse(access_token=token)
