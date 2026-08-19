import json
from datetime import datetime
from sqlmodel import Session, select
from fastapi import HTTPException

from app.models.bookmark import BookmarkCategory, BookmarkSite
from app.schemas.bookmark import (
    BookmarkCategoryCreate, BookmarkCategoryUpdate,
    BookmarkSiteCreate, BookmarkSiteUpdate,
)


# ---- Category ----

def get_categories(session: Session) -> list[BookmarkCategory]:
    return list(
        session.exec(select(BookmarkCategory).order_by(BookmarkCategory.sort)).all()
    )


def create_category(session: Session, data: BookmarkCategoryCreate) -> BookmarkCategory:
    cat = BookmarkCategory(**data.model_dump())
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


def update_category(session: Session, cat_id: int, data: BookmarkCategoryUpdate) -> BookmarkCategory:
    cat = session.get(BookmarkCategory, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(cat, k, v)
    cat.updated_at = datetime.now()
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


def delete_category(session: Session, cat_id: int):
    cat = session.get(BookmarkCategory, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")
    session.delete(cat)
    session.commit()


# ---- Site ----

def get_sites(session: Session, category_id: int | None = None) -> list[BookmarkSite]:
    q = select(BookmarkSite)
    if category_id is not None:
        q = q.where(BookmarkSite.category_id == category_id)
    q = q.order_by(BookmarkSite.sort)
    sites = list(session.exec(q).all())
    for s in sites:
        s.platforms = json.loads(s.platforms) if isinstance(s.platforms, str) else s.platforms
    return sites


def create_site(session: Session, data: BookmarkSiteCreate) -> BookmarkSite:
    site = BookmarkSite(
        category_id=data.category_id,
        name=data.name,
        url=data.url,
        icon=data.icon,
        description=data.description,
        platforms=json.dumps(data.platforms, ensure_ascii=False),
        sort=data.sort,
    )
    session.add(site)
    session.commit()
    session.refresh(site)
    site.platforms = data.platforms
    return site


def update_site(session: Session, site_id: int, data: BookmarkSiteUpdate) -> BookmarkSite:
    site = session.get(BookmarkSite, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="站点不存在")
    update_data = data.model_dump(exclude_unset=True)
    if "platforms" in update_data and isinstance(update_data["platforms"], list):
        update_data["platforms"] = json.dumps(update_data["platforms"], ensure_ascii=False)
    for k, v in update_data.items():
        setattr(site, k, v)
    site.updated_at = datetime.now()
    session.add(site)
    session.commit()
    session.refresh(site)
    site.platforms = json.loads(site.platforms) if isinstance(site.platforms, str) else site.platforms
    return site


def delete_site(session: Session, site_id: int):
    site = session.get(BookmarkSite, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="站点不存在")
    session.delete(site)
    session.commit()


def get_full_bookmarks(session: Session) -> list[dict]:
    categories = get_categories(session)
    result = []
    for cat in categories:
        assert cat.id is not None
        sites = get_sites(session, category_id=cat.id)
        result.append({
            "id": cat.id,
            "name": cat.name,
            "icon": cat.icon,
            "description": cat.description,
            "sort": cat.sort,
            "created_at": cat.created_at,
            "sites": sites,
        })
    return result
