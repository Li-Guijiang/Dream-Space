import json
from sqlmodel import Session, select
from fastapi import HTTPException

from app.models import Project
from app.schemas import ProjectCreate, ProjectUpdate


def _to_dict(p: Project) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "slug": p.slug,
        "description": p.description,
        "long_description": p.long_description,
        "cover_image": p.cover_image,
        "tech_stack": json.loads(p.tech_stack) if p.tech_stack else [],
        "link_github": p.link_github,
        "link_gitee": p.link_gitee,
        "link_live": p.link_live,
        "link_docs": p.link_docs,
        "status": p.status,
        "status_label": p.status_label,
        "is_featured": p.is_featured,
        "sort": p.sort,
        "created_at": p.created_at,
    }


def get_projects(session: Session) -> list[dict]:
    rows = list(session.exec(select(Project).order_by(Project.sort)).all())
    return [_to_dict(p) for p in rows]


def get_project_by_slug(session: Session, slug: str) -> dict:
    p = session.exec(select(Project).where(Project.slug == slug)).first()
    if not p:
        raise HTTPException(status_code=404, detail="项目不存在")
    return _to_dict(p)


def create_project(session: Session, data: ProjectCreate) -> dict:
    d = data.model_dump()
    d["tech_stack"] = json.dumps(d["tech_stack"], ensure_ascii=False)
    p = Project(**d)
    session.add(p)
    session.commit()
    session.refresh(p)
    return _to_dict(p)


def update_project(session: Session, project_id: int, data: ProjectUpdate) -> dict:
    p = session.get(Project, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="项目不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        if k == "tech_stack" and v is not None:
            v = json.dumps(v, ensure_ascii=False)
        setattr(p, k, v)
    session.add(p)
    session.commit()
    session.refresh(p)
    return _to_dict(p)


def delete_project(session: Session, project_id: int):
    p = session.get(Project, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="项目不存在")
    session.delete(p)
    session.commit()
