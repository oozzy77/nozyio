# [Work In Progress] setup.py to install the ripgrep binary according to OS to reduce pacakge size
import os
import platform
import subprocess
import urllib.request
from setuptools import setup, find_packages
from setuptools.command.install import install

class PostInstallCommand(install):
    """Post-installation script to download and install the appropriate ripgrep binary."""
    def run(self):
        install.run(self)
        download_ripgrep_binary()

def download_ripgrep_binary():
    # Detect the platform
    system = platform.system().lower()
    arch = platform.machine()

    # Define the URL based on the platform
    if system == 'linux' and arch == 'x86_64':
        url = 'https://github.com/BurntSushi/ripgrep/releases/download/14.1.1/ripgrep-14.1.1-x86_64-unknown-linux-musl.tar.gz'
        binary_name = 'rg'
    elif system == 'darwin':
        url = 'https://github.com/BurntSushi/ripgrep/releases/download/14.1.1/ripgrep-14.1.1-x86_64-apple-darwin.tar.gz'
        binary_name = 'rg'
    elif system == 'windows':
        url = 'https://github.com/BurntSushi/ripgrep/releases/download/14.1.1/ripgrep-14.1.1-x86_64-pc-windows-msvc.zip'
        binary_name = 'rg.exe'
    else:
        raise OSError(f"Unsupported platform: {system} {arch}")

    # Download the binary
    print(f"Downloading ripgrep binary from {url}")
    binary_archive_path = os.path.join(os.getcwd(), 'rg_download')
    urllib.request.urlretrieve(url, binary_archive_path)

    # Extract the binary (tar.gz for Linux/macOS, zip for Windows)
    if system != 'windows':
        subprocess.run(['tar', '-xzf', binary_archive_path, '-C', os.getcwd()], check=True)
    else:
        # Extract zip for Windows
        import zipfile
        with zipfile.ZipFile(binary_archive_path, 'r') as zip_ref:
            zip_ref.extractall(os.getcwd())

    # Clean up the downloaded archive
    os.remove(binary_archive_path)

    # Ensure the binary is executable (for non-Windows platforms)
    if system != 'windows':
        binary_path = os.path.join(os.getcwd(), binary_name)
        os.chmod(binary_path, 0o755)

    print(f"ripgrep binary installed successfully at {binary_path}")

setup(
    name='nozyio',
    version='0.1.7',
    description='Node based workflow orchestration UI for python ML/AI computing',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    author='oozzy',
    author_email='nozyio.hello@gmail.com',
    url='https://github.com/oozzy77/nozyio',  # Replace with your GitHub URL if necessary
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'aiohttp',
        'astpretty',
        'requests',
        'pillow',
    ],
    entry_points={
        'console_scripts': [
            'nozyio = nozyio.server:start_server',
        ],
    },
    cmdclass={
        'install': PostInstallCommand,  # Use the custom install command
    },
    python_requires='>=3.6',
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    package_data={
        'nozyio': ['web/dist/*', 'bin/linux/rg', 'bin/mac/rg', 'bin/windows/rg.exe']
    },
)
