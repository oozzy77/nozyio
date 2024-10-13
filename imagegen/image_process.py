import os
# from rembg import remove
from typing import Union
from PIL.Image import Image as PILImage
import numpy as np

def remove_background(
    data: Union[bytes, PILImage, np.ndarray],
    alpha_matting: bool = False,
    alpha_matting_foreground_threshold: int = 240,
    alpha_matting_background_threshold: int = 10,
    alpha_matting_erode_size: int = 10,
) -> Union[bytes, PILImage, np.ndarray]:
    return  None
    # return remove(data, alpha_matting=alpha_matting, alpha_matting_foreground_threshold=alpha_matting_foreground_threshold, alpha_matting_background_threshold=alpha_matting_background_threshold, alpha_matting_erode_size=alpha_matting_erode_size)


remove_background.NOZY_NODE_DEF = {
    "name": "Remove Background REMBG",
    "description": "Remove background from image",
    "inputs": [
        {"name": "image", "type": "image", "description": "Input image"}
    ],
    "outputs": [
        {"name": "image", "type": "image", "description": "Output image"}
    ]
}

# if __name__ == "__main__":
#     print("Removing background from image...")
#     print(remove_background("input.png"))