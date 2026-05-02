from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, Query, Response, UploadFile, status

from app.api.deps import CurrentUser, SessionDep
from app.schemas.file import FileRead
from app.services import file_service

router = APIRouter(tags=["files"])

SkipQuery = Annotated[int, Query(ge=0)]
LimitQuery = Annotated[int, Query(ge=1, le=100)]
UploadFileBody = Annotated[UploadFile, File(...)]


@router.get("/projects/{project_id}/files", response_model=list[FileRead])
def list_files(
    project_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
    skip: SkipQuery = 0,
    limit: LimitQuery = 50,
) -> list[FileRead]:
    return file_service.list_files(db, current_user, project_id, skip, limit)


@router.post(
    "/projects/{project_id}/files",
    response_model=FileRead,
    status_code=status.HTTP_201_CREATED,
)
def upload_file(
    project_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
    upload: UploadFileBody,
) -> FileRead:
    return file_service.upload_file(db, current_user, project_id, upload)


@router.get("/files/{file_id}", response_model=FileRead)
def get_file(
    file_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> FileRead:
    return file_service.get_file(db, current_user, file_id)


@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> Response:
    file_service.delete_file(db, current_user, file_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
