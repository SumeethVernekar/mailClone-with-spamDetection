import enum


class Folder(str, enum.Enum):
    inbox = "inbox"
    sent = "sent"
    spam = "spam"
