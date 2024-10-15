import json
import os
import sys

def get_config() -> dict:
    current_dir = os.getcwd()
    config = {}
    if os.path.exists("nozy_config.json"):
        with open("config.json", "r") as f:
            config = json.load(f)
    config = {
        'package_path': 'nozy_packages',
        'model_paths': ['models'],
        'workflow_path': 'nozy_workflows',
        'output_path': 'nozy_outputs',
        'ignore': ['node_modules', 'venv', '.env', '.git', '__pycache__', 'dist', '.DS_Store'],
        **config,
    }
    if isinstance(config.get('package_path'), str):
        config['package_path'] = os.path.join(current_dir, config['package_path'])
    if isinstance(config.get('model_paths'), str):
        config['model_paths'] = os.path.join(current_dir, config['model_paths'])
    if isinstance(config.get('model_paths'), list):
        config['model_paths'] = [os.path.join(current_dir, path) for path in config['model_paths']]
    if isinstance(config.get('workflow_path'), str):
        config['workflow_path'] = os.path.join(current_dir, config['workflow_path'])
    if isinstance(config.get('output_path'), str):
        config['output_path'] = os.path.join(current_dir, config['output_path'])

    sys.path.append(config['package_path'])
    return config

def get_root_dir():
    return os.getcwd()

def should_ignore(path: str) -> bool:
    if path.startswith('.'):
        return True
    return any(path.startswith(ignore) for ignore in config['ignore'])

config = get_config()