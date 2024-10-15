import os

from .config_utils import config, get_root_dir, should_ignore


def list_files(path, extensions=None):
    if not os.path.exists(path):
        return []
    children = []
    ignore_files = config.get('ignore', [])
    for file in os.listdir(path):
        ext = file.split(".")[-1]
        abs_path = os.path.join(path, file)
        rel_path = os.path.relpath(abs_path, get_root_dir())
        if should_ignore(file):
            continue

        if os.path.isdir(abs_path):
            children.append({
                "type": "folder",
                "name": file,
                "path": abs_path,
                "rel_path": rel_path
            })
        else:
            if extensions and ext not in extensions and f'.{ext}' not in extensions:
                continue
            children.append({
                "type": "file",
                "name": file,
                "path": abs_path,
                "rel_path": rel_path
            })
    return children