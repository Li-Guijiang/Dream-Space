from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.deps import get_session, get_current_user
from app.schemas.bookmark import (
    BookmarkCategoryCreate, BookmarkCategoryUpdate, BookmarkCategoryOut,
    BookmarkSiteCreate, BookmarkSiteUpdate, BookmarkSiteOut, BookmarkFull,
)
from app.services import bookmark_service

router = APIRouter(prefix="/api/bookmarks", tags=["收藏夹"])


# ---- 前台：获取完整收藏夹（分类+站点） ----

@router.get("", response_model=list[BookmarkFull])
def list_bookmarks(session: Session = Depends(get_session)):
    return bookmark_service.get_full_bookmarks(session)


# ---- 分类 CRUD（需登录） ----

@router.get("/categories", response_model=list[BookmarkCategoryOut])
def list_categories(session: Session = Depends(get_session)):
    return bookmark_service.get_categories(session)


@router.post("/categories", response_model=BookmarkCategoryOut)
def create_category(
    data: BookmarkCategoryCreate,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return bookmark_service.create_category(session, data)


@router.put("/categories/{cat_id}", response_model=BookmarkCategoryOut)
def update_category(
    cat_id: int,
    data: BookmarkCategoryUpdate,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return bookmark_service.update_category(session, cat_id, data)


@router.delete("/categories/{cat_id}")
def delete_category(
    cat_id: int,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    bookmark_service.delete_category(session, cat_id)
    return {"ok": True}


# ---- 站点 CRUD（需登录） ----

@router.get("/sites", response_model=list[BookmarkSiteOut])
def list_sites(
    category_id: int | None = None,
    session: Session = Depends(get_session),
):
    return bookmark_service.get_sites(session, category_id)


@router.post("/sites", response_model=BookmarkSiteOut)
def create_site(
    data: BookmarkSiteCreate,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return bookmark_service.create_site(session, data)


@router.put("/sites/{site_id}", response_model=BookmarkSiteOut)
def update_site(
    site_id: int,
    data: BookmarkSiteUpdate,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return bookmark_service.update_site(session, site_id, data)


@router.delete("/sites/{site_id}")
def delete_site(
    site_id: int,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    bookmark_service.delete_site(session, site_id)
    return {"ok": True}
