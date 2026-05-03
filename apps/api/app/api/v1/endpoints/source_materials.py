from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, Form, UploadFile

from app.api.deps import CurrentUser, SessionDep
from app.models import SourceKind, SourceVisibility
from app.schemas.common import Message
from app.schemas.source_material import SourceMaterialRead
from app.services.source_material_service import SourceMaterialService
from app.services.workspace_service import WorkspaceService

router = APIRouter(tags=["source-materials"])


@router.get("/knowledge-bases/{kb_id}/materials", response_model=list[SourceMaterialRead])
def list_kb_materials(
    kb_id: UUID,
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[SourceMaterialRead]:
    return [
        SourceMaterialRead.model_validate(material)
        for material in SourceMaterialService.list_by_knowledge_base(db, kb_id, skip, limit)
    ]


@router.post(
    "/knowledge-bases/{kb_id}/materials",
    response_model=SourceMaterialRead,
    status_code=201,
)
def create_kb_material(
    kb_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
    title: Annotated[str, Form()],
    source_kind: Annotated[SourceKind, Form()],
    visibility: Annotated[SourceVisibility, Form()] = SourceVisibility.LAB_INTERNAL,
    workspace_id: Annotated[UUID | None, Form()] = None,
    original_filename: Annotated[str | None, Form()] = None,
    source_url: Annotated[str | None, Form()] = None,
    content_type: Annotated[str | None, Form()] = None,
    citation_metadata: Annotated[str | None, Form()] = None,
    upload: Annotated[UploadFile | None, File()] = None,
) -> SourceMaterialRead:
    material = SourceMaterialService.create_material(
        db,
        current_user,
        knowledge_base_id=kb_id,
        workspace_id=workspace_id,
        title=title,
        source_kind=source_kind,
        visibility=visibility,
        original_filename=original_filename,
        source_url=source_url,
        content_type=content_type,
        citation_metadata=SourceMaterialService.parse_citation_metadata(citation_metadata),
        upload=upload,
    )
    return SourceMaterialRead.model_validate(material)


@router.get("/workspaces/{workspace_id}/materials", response_model=list[SourceMaterialRead])
def list_workspace_materials(
    workspace_id: UUID,
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[SourceMaterialRead]:
    return [
        SourceMaterialRead.model_validate(material)
        for material in SourceMaterialService.list_by_workspace(db, workspace_id, skip, limit)
    ]


@router.post(
    "/workspaces/{workspace_id}/materials",
    response_model=SourceMaterialRead,
    status_code=201,
)
def create_workspace_material(
    workspace_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
    title: Annotated[str, Form()],
    source_kind: Annotated[SourceKind, Form()],
    visibility: Annotated[SourceVisibility, Form()] = SourceVisibility.LAB_INTERNAL,
    original_filename: Annotated[str | None, Form()] = None,
    source_url: Annotated[str | None, Form()] = None,
    content_type: Annotated[str | None, Form()] = None,
    citation_metadata: Annotated[str | None, Form()] = None,
    upload: Annotated[UploadFile | None, File()] = None,
) -> SourceMaterialRead:
    workspace = WorkspaceService.get_workspace(db, workspace_id)
    material = SourceMaterialService.create_material(
        db,
        current_user,
        knowledge_base_id=workspace.knowledge_base_id,
        workspace_id=workspace_id,
        title=title,
        source_kind=source_kind,
        visibility=visibility,
        original_filename=original_filename,
        source_url=source_url,
        content_type=content_type,
        citation_metadata=SourceMaterialService.parse_citation_metadata(citation_metadata),
        upload=upload,
    )
    return SourceMaterialRead.model_validate(material)


@router.get("/materials/{material_id}", response_model=SourceMaterialRead)
def get_material(material_id: UUID, db: SessionDep, _: CurrentUser) -> SourceMaterialRead:
    return SourceMaterialRead.model_validate(SourceMaterialService.get_material(db, material_id))


@router.delete("/materials/{material_id}", response_model=Message)
def delete_material(
    material_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> Message:
    SourceMaterialService.delete_material(db, material_id, current_user)
    return Message(detail="Source material deleted")
