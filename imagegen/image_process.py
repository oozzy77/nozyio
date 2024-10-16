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
    "node_title": "Save Image",
    "description": "Save image to path",
    "inputs": [
        {"name": "image", "type": "Image", "description": "Image to save"}
    ],
    "outputs": [{"name": "image", "type": "Image", "description": "Saved image"}]
}

def remove_background_rembg(
    image: Union[bytes, PILImage, np.ndarray],
    alpha_matting: bool = False,
    alpha_matting_foreground_threshold: int = 240,
    alpha_matting_background_threshold: int = 10,
    alpha_matting_erode_size: int = 10,
) -> Union[bytes, PILImage, np.ndarray]:
    return remove(image, alpha_matting=alpha_matting, alpha_matting_foreground_threshold=alpha_matting_foreground_threshold, alpha_matting_background_threshold=alpha_matting_background_threshold, alpha_matting_erode_size=alpha_matting_erode_size)
remove_background_rembg.NOZY_NODE_DEF = {
    "node_title": "Remove Background REMBG",
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

from typing import Literal
from PIL import Image, ImageOps

def make_color_image(
    width: int,
    height: int,
    color: str = "#FFFF",
) -> Image.Image:
    return Image.new("RGB", (width, height), color)

def stack_images(
    top: Image.Image,
    bottom: Image.Image,
    position: Literal["center", "top", "bottom"] = "center",
) -> Image.Image:
    top = top.convert("RGBA")
    bottom = bottom.convert("RGBA")

    # Create a new image with the size of the bottom image
    combined = Image.new("RGBA", bottom.size)

    # Paste the bottom image onto the combined image
    combined.paste(bottom, (0, 0))

    # Calculate the position for the top image
    if position == "center":
        x = (bottom.width - top.width) // 2
        y = (bottom.height - top.height) // 2
    elif position == "top":
        x = (bottom.width - top.width) // 2
        y = 0
    elif position == "bottom":
        x = (bottom.width - top.width) // 2
        y = bottom.height - top.height

    # Paste the top image onto the combined image
    combined.paste(top, (x, y), top)  # The third argument is the mask

    return combined.convert("RGB")

def grid_4_image(
    top_left: Image.Image,
    top_right: Image.Image,
    bottom_left: Image.Image,
    bottom_right: Image.Image,
) -> Image.Image:
    return Image.new("RGB", (top_left.width + top_right.width, top_left.height + bottom_left.height + bottom_right.height), (255, 255, 255))
    

def resize_image(
    image: Image.Image, 
    width: int, 
    height: int, 
    method: Literal["stretch", "fit", "crop", "resize to width", "resize to height"] = "stretch", 
    interpolation: Literal["nearest", "bilinear", "bicubic", "area", "nearest-exact"] = "nearest"
) -> Image.Image:
    # Map the interpolation methods to PIL's constants
    interpolation_map = {
        "nearest": Image.NEAREST,
        "bilinear": Image.BILINEAR,
        "bicubic": Image.BICUBIC,
        "area": Image.BOX,
        "nearest-exact": Image.NEAREST
    }
    interp_method = interpolation_map[interpolation]

    if method == "stretch":
        # Stretch the image to the specified width and height
        return image.resize((width, height), interp_method)

    elif method == "fit":
        # Resize while keeping aspect ratio
        image.thumbnail((width, height), interp_method)
        return image

    elif method == "crop":
        # Resize and then crop the center to fit the exact dimensions
        img_ratio = image.width / image.height
        target_ratio = width / height

        if img_ratio > target_ratio:
            # Image is wider than target ratio, resize by height
            new_height = height
            new_width = int(img_ratio * new_height)
        else:
            # Image is taller than target ratio, resize by width
            new_width = width
            new_height = int(new_width / img_ratio)

        resized_image = image.resize((new_width, new_height), interp_method)
        return ImageOps.fit(resized_image, (width, height), method=interp_method)
    elif method == "resize to width":
        target_height = int(width / image.width * image.height)
        return image.resize((width, target_height), interp_method)
    elif method == "resize to height":
        target_width = int(height / image.height * image.width)
        return image.resize((target_width, height), interp_method)


# if __name__ == "__main__":
#     print("Removing background from image...")
#     print(remove_background("input.png"))