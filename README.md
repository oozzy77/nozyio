# NozyIO

**Python AI/ML pipeline visualization and orchestration UI**
graph flow UI ↔️ python code

- Python visual scripting
- **Automatically scan your python functions to nodes** with params typing
- Export the pipeline graph as Python code
- Visualize output results in each node
- [Upcoming] Visualize your python code to graph flow

<img width="900" alt="Screenshot 2024-10-12 at 11 04 35 PM" src="https://github.com/user-attachments/assets/8502f6fd-9c7b-4469-b22e-36da9b6601fb">

## Install

In your python project root:

`pip install nozyio`

To start the nozyio UI:

`nozyio`

## Usage

**👇Export workflow to code**

<img width="900" alt="Screenshot 2024-10-12 at 11 06 03 PM" src="https://github.com/user-attachments/assets/7bb3a2d7-1687-4099-9e13-a61294cac046">

**👇Automatically scan your python functions as nodes with params typing**

<img width="830" alt="Screenshot 2024-10-12 at 11 09 18 PM" src="https://github.com/user-attachments/assets/abad2101-973b-4538-85d2-61d5e7cfb67b">

## Development

install pip package in editable mode

`pip install -e .`

start nozyio server

`nozyio --allow-cors`

Start web dev server with hot reload

`cd nozyio/web && npm run dev`

Go to the web server url

### Build and publish to pypi

`chmod +x build.sh`

`./build.sh`

`twine upload dist/*`

## Credits

Lots of code are referenced from ComfyUI (https://github.com/comfyanonymous/ComfyUI)
