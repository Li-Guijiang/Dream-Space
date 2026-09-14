from datetime import datetime
from sqlmodel import Session, select
from fastapi import HTTPException

from app.models import Category
from app.schemas import CategoryCreate, CategoryUpdate


def get_categories(session: Session) -> list[Category]:
    return list(session.exec(select(Category).order_by(Category.sort)).all())


def get_category_by_id(session: Session, cat_id: int) -> Category:
    cat = session.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")
    return cat


def create_category(session: Session, data: CategoryCreate) -> Category:
    cat = Category(**data.model_dump())
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


def update_category(session: Session, cat_id: int, data: CategoryUpdate) -> Category:
    cat = session.get(Category, cat_id)
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
    cat = session.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")
    session.delete(cat)
    session.commit()
