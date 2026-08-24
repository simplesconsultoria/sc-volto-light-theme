import re


def is_valid_color(value: str) -> bool:
    """Validates a hex color code."""
    pattern = re.compile(r"^#(?:[0-9a-fA-F]{3}){1,2}$")
    return bool(re.match(pattern, value))
