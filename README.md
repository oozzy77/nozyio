# NozyIO

**Python AI/ML pipeline visualization and orchestration UI for your codebase**

graph flow UI ↔️ python code

- Workflow nodes editor for your python code
- **Automatically scan your python functions to nodes** with params typing
- Visualize output results of each step/node, including images, charts
- Export the pipeline graph as Python code
- Python visual scripting

<img width="900" alt="Screenshot 2024-10-19 at 2 38 49 PM" src="https://github.com/user-attachments/assets/d6c5f930-cedc-426a-aaa8-11cdb92c6cd4">

## Install

In your python project root:

`pip install nozyio`

To start the nozyio UI:

`nozyio`

## Usage

**👇Export workflow to code**

<img width="900" alt="Screenshot 2024-10-19 at 3 57 23 PM 1" src="https://github.com/user-attachments/assets/64a69234-5532-43a4-b192-415317be6fcd">

**👇Automatically scan your python functions as nodes with params typing**

<img width="600" alt="Screenshot 2024-10-19 at 2 50 02 PM" src="https://github.com/user-attachments/assets/b6a2bb36-9d0e-4940-99da-7d40918bbaf1">

## Future Plans

- [ ] Visualize your python code to graph flow
- [ ] AI image nodes packages

## Development

install pip package in editable mode

`pip install -e .`

start nozyio server

`nozyio --allow-cors`

Start web dev server with hot reload

`cd nozyio/web && npm run dev`

Go to the web server url

### Build and publish to pypi

if you haven't installed twine:
`python -m pip install --upgrade twine`
if you haven't installed build:
`python -m pip install --upgrade build`

To build and publish to pypi:

`chmod +x build.sh`

`./build.sh`

## Credits

Lots of code are referenced from ComfyUI (https://github.com/comfyanonymous/ComfyUI)
