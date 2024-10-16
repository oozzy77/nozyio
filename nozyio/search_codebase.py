import os
import platform
import stat
import subprocess

def ensure_executable_permissions(binary_path):
    """Ensure the binary has executable permissions (only on Unix-like systems)."""
    system = platform.system().lower()

    if system in ['linux', 'darwin']:  # Only check on Linux and macOS
        if not os.access(binary_path, os.X_OK):
            # If the file is not executable, add the executable bit
            st = os.stat(binary_path)
            os.chmod(binary_path, st.st_mode | stat.S_IEXEC)
    else:
        # On Windows, we assume the binary (e.g., .exe) doesn't need this check
        pass

def get_ripgrep_binary():
    system = platform.system().lower()

    if system == "linux":
        return os.path.join(os.path.dirname(__file__), 'bin', 'linux', 'rg')
    elif system == "darwin":
        return os.path.join(os.path.dirname(__file__), 'bin', 'mac', 'rg')
    elif system == "windows":
        return os.path.join(os.path.dirname(__file__), 'bin', 'windows', 'rg.exe')
    else:
        raise OSError(f"Unsupported operating system: {system}")

def search_codebase(search_term):
    # Run ripgrep to search for class and function definitions
    binary_path = get_ripgrep_binary()
    # ensure_executable_permissions(binary_path)
    # result = subprocess.run([binary_path, search_term], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    rg_command = [
        binary_path, '-n', '--no-heading', '--color', 'never',
        r'^\s*(class|def)\s+\w+',  # regex to find class and function definitions
        '.'
    ]
    
    try:
        result = subprocess.run(rg_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        if result.returncode == 0:
            matches = result.stdout.splitlines()
            return [match for match in matches if search_term.lower() in match.lower()]
        else:
            return []
    except Exception as e:
        print(f"An error occurred while running ripgrep: {e}")
        return []

def typeahead_search():
    search_term = input("Start typing class/function name: ")
    while search_term:
        # Fetch the results from the codebase based on the search term
        matches = search_codebase(search_term)
        if matches:
            print("\n".join(matches))
        else:
            print("No matches found.")
        
        search_term = input("Start typing class/function name: ")

if __name__ == '__main__':
    typeahead_search()
