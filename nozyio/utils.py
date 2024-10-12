import math


def is_serializable(value):
    """Check if a value is JSON serializable."""
    if isinstance(value, float):
        if math.isinf(value) or math.isnan(value):
            return False
        return True
    elif isinstance(value, (int, str, bool)):
        return True
    elif isinstance(value, (list, tuple)):
        return all(is_serializable(item) for item in value)
    elif isinstance(value, dict):
        return all(isinstance(key, str) and is_serializable(val) for key, val in value.items())
    return False
    
    