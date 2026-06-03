from pydantic import BaseModel


class SocialLinkRequest(BaseModel):
    code: str
    state: str
