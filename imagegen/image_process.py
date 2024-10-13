import os
from rembg import remove
from typing import Union
from PIL.Image import Image as PILImage
import numpy as np
from PIL import Image
import requests
from io import BytesIO

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