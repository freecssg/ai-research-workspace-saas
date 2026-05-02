from pydantic import AliasChoices, EmailStr, Field, SecretStr

from app.schemas.common import APIModel


class RegisterRequest(APIModel):
    email: EmailStr
    full_name: str | None = Field(
        default=None,
        max_length=255,
        validation_alias=AliasChoices("full_name", "name"),
    )
    password: SecretStr = Field(min_length=8, max_length=128)


class LoginRequest(APIModel):
    email: EmailStr
    password: SecretStr = Field(min_length=1, max_length=128)


class Token(APIModel):
    access_token: str
    token_type: str = "bearer"
