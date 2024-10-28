import json
import math
import os
import subprocess
import tempfile
import traceback
from .config_utils import config

def get_username_repo_from_url(url: str):
    if not url.startswith("https://github.com/"):
        raise ValueError("Invalid URL")
    if url.endswith(".git"):
        url = url[:-4]
    if url.endswith("/"):
        url = url[:-1]
    username, repo = url.split("/")[-2:]
    return username, repo

def install_node_package(url: str):
    package_path = config['package_path']
    username, repo = get_username_repo_from_url(url)
    repo_path = os.path.join(package_path, repo)
    if os.path.exists(repo_path):
        raise Exception(f"Package {repo} already installed")
    
    try:
        subprocess.run(["git", "clone", url, repo_path], check=True)
    except subprocess.CalledProcessError as e:
        print(e, traceback.format_exc())
        raise Exception(f"Failed to clone repository: {e}")
    
    requirements_path = os.path.join(repo_path, "requirements.txt")
    if os.path.exists(requirements_path):
        try:
            subprocess.run(["pip", "install", "-r", requirements_path], check=True)
        except subprocess.CalledProcessError as e:
            print(e, traceback.format_exc())
            raise Exception(f"Failed to install requirements: {e}")
    
    install_py_path = os.path.join(repo_path, "install.py")
    if os.path.exists(install_py_path):
        try:
            subprocess.run(["python", install_py_path], check=True)
        except subprocess.CalledProcessError as e:
            print(e, traceback.format_exc())
            raise Exception(f"Failed to run install.py: {e}")

def list_community_node_packages():
    packages = []
    with open("node_packages.json", "r") as f:
        packages = json.load(f)
    return packages
    