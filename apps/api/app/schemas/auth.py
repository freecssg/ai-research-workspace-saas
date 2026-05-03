from pydantic import EmailStr, Field, SecretStr

from app.schemas.common import APIModel
from app.schemas.user import UserRead


class LoginRequest(APIModel):
    email: EmailStr
    password: SecretStr


class TokenRead(APIModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(TokenRead):
    user: UserRead


class ChangePasswordRequest(APIModel):
    current_password: SecretStr
    new_password: SecretStr = Field(min_length=8, max_length=128)
