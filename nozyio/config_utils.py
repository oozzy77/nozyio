import json
import os
import sys

def get_config() -> dict:
    current_dir = os.getcwd()
    default_config = {
        'package_path': os.path.join(current_dir, 'nozy_packages'),
        'model_path': 'models',
        'workflow_path': 'workflows',
        'output_path': 'outputs',
        'ignore': ['node_modules', 'venv', '.env', '.git', '__pycache__', 'dist', '.DS_Store'],
    }
    config = {}
    if os.path.exists("config.json"):
        with open("config.json", "r") as f:
            config = json.load(f)
    if config.get('package_path') is not None:
        config['package_path'] = os.path.join(current_dir, config['package_path'])
    
    config = {
        **default_config,
        **config,
    }
    sys.path.append(config['package_path'])
    return config

def get_root_dir():
    return os.getcwd()

def should_ignore(path: str) -> bool:
    if path.startswith('.'):
        return True
    return any(path.startswith(ignore) for ignore in config['ignore'])

config = get_config()