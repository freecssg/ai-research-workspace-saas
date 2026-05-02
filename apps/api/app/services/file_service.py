import hashlib
import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import API_ROOT, settings
from app.models import File, FileSourceType, FileStatus, User
from app.services.common import get_owned_project, get_owned_workspace, not_found

ALLOWED_UPLOAD_EXTENSIONS = {".pdf", ".txt", ".md", ".csv", ".docx"}


def _upload_root() -> Path:
    upload_dir = settings.upload_dir
    if not upload_dir.is_absolute():
        upload_dir = API_ROOT / upload_dir
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def _safe_extension(filename: str) -> str:
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Allowed types: PDF, TXT, MD, CSV, DOCX",
        )
    return extension


def list_files(
    db: Session,
    current_user: User,
    project_id: uuid.UUID,
    skip: int = 0,
    limit: int = 50,
) -> list[File]:
    project = get_owned_project(db, current_user, project_id)
    return list(
        db.scalars(
            select(File)
            .where(
                File.workspace_id == project.workspace_id,
                File.project_id == project.id,
            )
            .order_by(File.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    )


def upload_file(
    db: Session,
    current_user: User,
    project_id: uuid.UUID,
    upload: UploadFile,
) -> File:
    project = get_owned_project(db, current_user, project_id)
    original_filename = upload.filename or "uploaded-file"
    extension = _safe_extension(original_filename)

    project_dir = _upload_root() / str(project.id)
    project_dir.mkdir(parents=True, exist_ok=True)
    stored_filename = f"{uuid.uuid4()}{extension}"
    storage_path = project_dir / stored_filename

    digest = hashlib.sha256()
    size_bytes = 0

    try:
        with storage_path.open("wb") as destination:
            while chunk := upload.file.read(1024 * 1024):
                size_bytes += len(chunk)
                if size_bytes > settings.max_upload_size_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Uploaded file exceeds the maximum allowed size",
                    )
                digest.update(chunk)
                destination.write(chunk)
    except Exception:
        if storage_path.exists():
            storage_path.unlink()
        raise
    finally:
        upload.file.close()

    file_record = File(
        workspace_id=project.workspace_id,
        project_id=project.id,
        name=Path(original_filename).name,
        original_filename=original_filename,
        content_type=upload.content_type,
        storage_path=str(storage_path),
        size_bytes=size_bytes,
        checksum_sha256=digest.hexdigest(),
        source_type=FileSourceType.UPLOAD,
        status=FileStatus.UPLOADED,
    )
    db.add(file_record)
    db.commit()
    db.refresh(file_record)
    return file_record


def get_file(db: Session, current_user: User, file_id: uuid.UUID) -> File:
    file_record = db.get(File, file_id)
    if file_record is None:
        raise not_found("File")

    get_owned_workspace(db, current_user, file_record.workspace_id)
    return file_record


def delete_file(db: Session, current_user: User, file_id: uuid.UUID) -> None:
    file_record = get_file(db, current_user, file_id)
    storage_path = Path(file_record.storage_path)
    upload_root = _upload_root().resolve()

    db.delete(file_record)
    db.commit()

    try:
        resolved_storage_path = storage_path.resolve()
        if resolved_storage_path.is_file() and upload_root in resolved_storage_path.parents:
            resolved_storage_path.unlink()
            parent = resolved_storage_path.parent
            if parent != upload_root and not any(parent.iterdir()):
                shutil.rmtree(parent)
    except OSError:
        pass
