# NozyIO

**Python AI / ML pipeline visualization tool.** Fastest way to add a pipeline GUI demo to your python ML/AI project effortlessly. You can easily pick input files, tune parameters, and preview any image input/output from the GUI. It can also be used as a visual scripting tool for python.

demo: https://youtu.be/L_6kY-fhIcU

- **Automatically discover python functions as nodes** with parameters typing
- Visual file picker GUI for any function inputs requires file
- Visualize output results of each step/node, including images, charts
- Save pipeline graph as json and **switch between pipelines quickly**
- Export the pipeline graph as Python code
- Python visual scripting

<img width="1723" alt="378056651-d6c5f930-cedc-426a-aaa8-11cdb92c6cd4-min" src="https://github.com/user-attachments/assets/be4cf1fc-7e71-4e35-91e8-5622a792cd93">

## Install

In your python project root:

`pip install nozyio`

To start the nozyio UI:

`nozyio`

## Usage

**Super easy node define (just write a function with typing) For example:**

```python
from PIL.Image import Image

def resize_image(
    image: Image,
    width: int = 512,
    height: int = 768,
    method: Literal["stretch", "fit", "crop"],
    interpolation: str
) -> Image:
    # ...some code here...
    return image.resize((width, height), interp_method)

resize_image.NOZY_NODE_DEF = {
    "node_title": "Resize Image",
}

```

👇This function will be rendered as below. You can see that all args default values are populated as the input box defaults

<img width="398" alt="Screenshot 2024-10-19 at 9 22 37 PM" src="https://github.com/user-attachments/assets/4be4c5ae-c2ab-429b-8830-89504bffeb2e">

**👇Export workflow to code, preview any image input/output**

<img width="1728" alt="378069723-64a69234-5532-43a4-b192-415317be6fcd-min" src="https://github.com/user-attachments/assets/b93e8de8-35aa-4144-a41d-10ede476a74d">

**👇Automatically scan your python functions as nodes with params typing**

<img width="400" alt="Screenshot 2024-10-19 at 2 50 02 PM" src="https://github.com/user-attachments/assets/b6a2bb36-9d0e-4940-99da-7d40918bbaf1">

**👇Double-click canvas to search any functions in your project and add nodes**

<img width="400" alt="Screenshot 2024-10-19 at 10 42 41 PM" src="https://github.com/user-attachments/assets/f18b4569-ee60-4385-ad95-3fe72a9e5f43">

### Node input types

Nozyio will automatically scan your python functions and convert them to nodes. You can define the input, output types by adding **type annotations** to the function parameters and return type. Params with no type annotation will become "any" type.

| Python Type             | UI Element         | HTML element              |
| ----------------------- | ------------------ | ------------------------- |
| `int`                   | number input box   | `<input type="number">`   |
| `str`                   | text input box     | `<textfield type="text">` |
| `Literal["abc", "xyz"]` | dropdown input box | `<select>`                |
| `PIL.Image.Image`       | image preview      | `<img>`                   |

### Input widgets - file picker

You can also add custom **UI widgets** to the input parameters by adding a `widget` field to the input definition. In below example, we use `server_file_picker` widget to let user select an image file from the files on the server:

```python
from PIL import Image.Image
def load_image(image_path: str) -> Image.Image:
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

<img width="908" alt="Screenshot 2024-10-29 at 2 05 35 AM" src="https://github.com/user-attachments/assets/7c1820df-0078-467d-b3f6-294fec6ffa14">

## Future Plans

- [ ] Visualize your python code to graph flow
- [ ] AI image nodes packages

## Screenshots

👇 Install community pacakges

<img width="935" alt="007 install-community-packages" src="https://github.com/user-attachments/assets/e09ccca0-45b3-46f6-af4f-b263091c5c14">

👇 Switch workflows quickly

![005 workflow_switcher](https://github.com/user-attachments/assets/0cf81e9d-3219-43ac-ba75-bad0bd3f8bdc)


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

This project is inspired by ComfyUI. Lots of code are referenced from ComfyUI (https://github.com/comfyanonymous/ComfyUI) Sincerely thanks to the contributors of ComfyUI!
