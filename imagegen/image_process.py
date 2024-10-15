import os
from rembg import remove
from typing import Union
from PIL.Image import Image as PILImage
import numpy as np
from PIL import Image
import requests
from io import BytesIO
from nozyio.config_utils import config, get_root_dir

def load_image(image_path: str) -> Union[bytes, PILImage, np.ndarray]:
    if image_path.startswith('http://') or image_path.startswith('https://'):
        response = requests.get(image_path)
        response.raise_for_status()  # Raises an error for bad responses
        image_data = BytesIO(response.content)
        return Image.open(image_data)
    else:
        return Image.open(image_path)
load_image.NOZY_NODE_DEF = {
    "display_name": "Load Image",
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
            "description": "Path to image"
        }
    },
    "outputs": [{"name": "image", "type": "Image", "description": "Loaded image"}]
}

def save_image(image: PILImage, image_name:str = 'nozy_img') -> str:
    output_path = os.path.join(config['output_path'], image_name + '.png')
    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    count = 1
    while os.path.exists(output_path):
        output_path = os.path.join(config['output_path'], image_name + f"_{count}.png")
        count += 1
    try:
        image.save(output_path)
        return os.path.relpath(output_path, get_root_dir())
    except Exception as e:
        print(f"Error saving image: {e}")
        return None
save_image.NOZY_NODE_DEF = {
    "display_name": "Save Image",
    "description": "Save image to path",
    "inputs": [
        {"name": "image", "type": "Image", "description": "Image to save"}
    ],
    "outputs": [{"name": "image", "type": "Image", "description": "Saved image"}]
}

def remove_background(
    image: Union[bytes, PILImage, np.ndarray],
    alpha_matting: bool = False,
    alpha_matting_foreground_threshold: int = 240,
    alpha_matting_background_threshold: int = 10,
    alpha_matting_erode_size: int = 10,
) -> Union[bytes, PILImage, np.ndarray]:
    return remove(image, alpha_matting=alpha_matting, alpha_matting_foreground_threshold=alpha_matting_foreground_threshold, alpha_matting_background_threshold=alpha_matting_background_threshold, alpha_matting_erode_size=alpha_matting_erode_size)
remove_background.NOZY_NODE_DEF = {
    "display_name": "Remove Background REMBG",
    "description": "Remove background from image using rembg",
    "inputs": [
        {
            "name": "image",
            "type": "Image",
            "description": "Input image to remove bg"
        }
    ],
    "outputs": [
        {"name": "image", "type": "Image", "description": "Output image"}
    ]
}

# if __name__ == "__main__":
#     print("Removing background from image...")
#     print(remove_background("input.png"))