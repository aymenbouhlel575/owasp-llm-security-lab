from dataclasses import dataclass


@dataclass
class AttackResult:
    attack_name: str
    category: str
    payload: str
    response: str
    success: bool
    severity: str

