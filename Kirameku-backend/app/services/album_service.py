from datetime import datetime
from sqlmodel import Session, select, func
from fastapi import HTTPException

from app.models import Album, Photo
from app.schemas import AlbumCreate, AlbumUpdate, PhotoCreate


def get_albums(session: Session) -> list[Album]:
    return list(session.exec(select(Album).order_by(Album.sort)).all())


def get_album_by_id(session: Session, album_id: int) -> Album:
    album = session.get(Album, album_id)
    if not album:
        raise HTTPException(status_code=404, detail="相册不存在")
    return album


def create_album(session: Session, data: AlbumCreate) -> Album:
    album = Album(**data.model_dump())
    session.add(album)
    session.commit()
    session.refresh(album)
    return album


def update_album(session: Session, album_id: int, data: AlbumUpdate) -> Album:
    album = session.get(Album, album_id)
    if not album:
        raise HTTPException(status_code=404, detail="相册不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(album, k, v)
    album.updated_at = datetime.now()
    session.add(album)
    session.commit()
    session.refresh(album)
    return album


def delete_album(session: Session, album_id: int):
    album = session.get(Album, album_id)
    if not album:
        raise HTTPException(status_code=404, detail="相册不存在")
    session.delete(album)
    session.commit()


def get_photos(session: Session, album_id: int) -> list[Photo]:
    return list(
        session.exec(
            select(Photo)
            .where(Photo.album_id == album_id)
            .order_by(Photo.sort)
        ).all()
    )


def add_photo(session: Session, data: PhotoCreate) -> Photo:
    photo = Photo(**data.model_dump())
    session.add(photo)
    session.flush()
    # 更新相册照片计数
    album = session.get(Album, data.album_id)
    if album:
        count = session.exec(
            select(func.count(Photo.id)).where(Photo.album_id == data.album_id)
        ).one()
        album.photo_count = count
        album.updated_at = datetime.now()
        session.add(album)
    session.commit()
    session.refresh(photo)
    return photo


def delete_photo(session: Session, photo_id: int):
    photo = session.get(Photo, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="照片不存在")
    album_id = photo.album_id
    session.delete(photo)
    session.flush()
    album = session.get(Album, album_id)
    if album:
        count = session.exec(
            select(func.count(Photo.id)).where(Photo.album_id == album_id)
        ).one()
        album.photo_count = count
        album.updated_at = datetime.now()
        session.add(album)
    session.commit()
