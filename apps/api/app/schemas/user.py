from pydantic import EmailStr, Field, SecretStr

from app.models.enums import UserStatus
from app.schemas.common import APIModel, ReadModel


class UserBase(APIModel):
    email: EmailStr
    full_name: str | None = Field(default=None, max_length=255)
    status: UserStatus = UserStatus.ACTIVE


class UserCreate(UserBase):
    password: SecretStr = Field(min_length=8, max_length=128)


class UserUpdate(APIModel):
    email: EmailStr | None = None
    full_name: str | None = Field(default=None, max_length=255)
    password: SecretStr | None = Field(default=None, min_length=8, max_length=128)
    status: UserStatus | None = None


class UserRead(UserBase, ReadModel):
    pass
