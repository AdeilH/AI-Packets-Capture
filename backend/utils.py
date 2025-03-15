def sanitize_for_json(obj):
    """Clean object for JSON serialization by replacing None values in dictionaries."""
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items() if k is not None}
    elif isinstance(obj, list):
        return [sanitize_for_json(item) for item in obj]
    elif obj is None:
        return ""  # Replace None with empty string
    else:
        return obj 