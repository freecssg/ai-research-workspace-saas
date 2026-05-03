from pydantic import EmailStr, Field, SecretStr

from app.models.enums import UserRole
from app.schemas.common import APIModel, ReadModel


class UserBase(APIModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=255)
    role: UserRole = UserRole.MEMBER
    is_active: bool = True


class UserCreate(UserBase):
    password: SecretStr = Field(min_length=8, max_length=128)


class UserUpdate(APIModel):
    email: EmailStr | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    password: SecretStr | None = Field(default=None, min_length=8, max_length=128)
    role: UserRole | None = None
    is_active: bool | None = None


class UserRead(UserBase, ReadModel):
    pass
