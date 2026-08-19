from pydantic import BaseModel


class SiteConfigUpdate(BaseModel):
    value: str
    description: str = ""


class SiteConfigOut(BaseModel):
    id: int
    key: str
    value: str
    description: str
