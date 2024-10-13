# NozyIO

**Python AI/ML pipeline visualization and orchestration UI**

- Python visual scripting
- Automatically scan functions as i/o nodes with params typing in python project
- Export the workflow json as Python code
- Monitor output results in each step in realtime

<img width="900" alt="Screenshot 2024-10-12 at 11 04 35 PM" src="https://github.com/user-attachments/assets/8502f6fd-9c7b-4469-b22e-36da9b6601fb">

## Install

`pip install nozyio`

To start the nozyio UI:

`nozyio`

## Usage

**👇Export workflow to code**

<img width="900" alt="Screenshot 2024-10-12 at 11 06 03 PM" src="https://github.com/user-attachments/assets/7bb3a2d7-1687-4099-9e13-a61294cac046">

**👇Automatically scan py functions as nodes with params typing**

<img width="830" alt="Screenshot 2024-10-12 at 11 09 18 PM" src="https://github.com/user-attachments/assets/abad2101-973b-4538-85d2-61d5e7cfb67b">

## Development

### pip package development:

install pip package in editable mode

`pip install -e .`

start nozyio UI

`nozyio`

### UI development with hot reload:

Start python server:
`python -m nozyio.server --allow-cors`

Start web dev server:
`cd web && npm run dev`

Go to the web server url

### Build and publish to pypi

`chmod +x build.sh`

`./build.sh`

`twine upload dist/*`

## Credits

Lots of code are referenced from ComfyUI (https://github.com/comfyanonymous/ComfyUI)
