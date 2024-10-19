# NozyIO

**Python AI/ML pipeline visualization and orchestration UI for your codebase**

graph flow UI ↔️ python code

- Workflow nodes editor for your python code
- **Automatically scan your python functions to nodes** with params typing
- Visualize output results of each step/node, including images, charts
- Export the pipeline graph as Python code
- Python visual scripting

<img width="1723" alt="378056651-d6c5f930-cedc-426a-aaa8-11cdb92c6cd4-min" src="https://github.com/user-attachments/assets/be4cf1fc-7e71-4e35-91e8-5622a792cd93">


## Install

In your python project root:

`pip install nozyio`

To start the nozyio UI:

`nozyio`

## Usage

**👇Export workflow to code**

<img width="1728" alt="378069723-64a69234-5532-43a4-b192-415317be6fcd-min" src="https://github.com/user-attachments/assets/b93e8de8-35aa-4144-a41d-10ede476a74d">

**👇Automatically scan your python functions as nodes with params typing**

<img width="400" alt="Screenshot 2024-10-19 at 2 50 02 PM" src="https://github.com/user-attachments/assets/b6a2bb36-9d0e-4940-99da-7d40918bbaf1">

**👇Double-click canvas to search any functions in current project and add nodes**

<img width="400" alt="Screenshot 2024-10-19 at 10 42 41 PM" src="https://github.com/user-attachments/assets/f18b4569-ee60-4385-ad95-3fe72a9e5f43">


### Define a node

Nozyio will automatically scan your python functions and convert them to nodes. You can define the input, output types by adding **type annotations** to the function parameters and return type. Params with no type annotation will become "any" type.

| Python Type             | UI Element         | HTML element            |
| ----------------------- | ------------------ | ----------------------- |
| `int`                   | number input box   | `<input type="number">` |
| `str`                   | text text box      | `<input type="text">`   |
| `Literal["abc", "xyz"]` | dropdown input box | `<select>`              |
| `PIL.Image.Image`       | image preview      | `<img>`                 |

**Example 1:**

```python
from PIL.Image import Image

def resize_image(
    image: Image,
    width: int = 512,
    height: int = 512,
    method: Literal["stretch", "fit", "crop", "resize to width", "resize to height"] = "stretch",
    interpolation: str = "nearest"
) -> Image:
    # ...some code here...
    return image.resize((width, height), interp_method)
resize_image.NOZY_NODE_DEF = {
    "node_title": "Resize Image",
    "description": "Resize image to provided width and height",
}
```
👆This function will be rendered as below. You can see that all args default values are also the default value for the input box UI
 
<img width="398" alt="Screenshot 2024-10-19 at 9 22 37 PM" src="https://github.com/user-attachments/assets/4be4c5ae-c2ab-429b-8830-89504bffeb2e">

**Example 2:**

You can also add custom **UI widgets** to the input parameters by adding a `widget` field to the input definition. In below example, we use `server_file_picker` widget to let user select an image file from the files on the server:

```python
from PIL import Image.Image
def load_image(image_path: str) -> Image.Image:
    if image_path.startswith('http://') or image_path.startswith('https://'):
        response = requests.get(image_path)
        response.raise_for_status()  # Raises an error for bad responses
        image_data = BytesIO(response.content)
        return Image.open(image_data)
    else:
        return Image.open(image_path)
load_image.NOZY_NODE_DEF = {
    "node_title": "Load Image",
    "description": "Load image from path",
    "inputs": {
        "image_path": {
            "type": "filepath",
            "widget": {
                'type': 'server_file_picker',
                'options': {
                    'extensions': ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp']
                }
            },
            "hide_handle": True,
            "description": "Path to image"
        }
    },
    "outputs": [{"name": "image", "type": "Image", "description": "Loaded image"}]
}
```

<img width="349" alt="Screenshot 2024-10-19 at 9 37 21 PM" src="https://github.com/user-attachments/assets/529bf77e-99c6-4ff8-8487-c383bf4d92c1">

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
