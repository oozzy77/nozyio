from diffusers import AutoPipelineForText2Image
import torch
from nozyio import device_management

def text_to_image(prompt):
    pipeline = AutoPipelineForText2Image.from_pretrained(
        "stable-diffusion-v1-5/stable-diffusion-v1-5", torch_dtype=torch.float16, variant="fp16"
    ).to(device_management.device)
    generator = torch.Generator(device_management.device).manual_seed(31)
    image = pipeline("Astronaut in a jungle, cold color palette, muted colors, detailed, 8k", generator=generator).images[0]


# import torch
# from transformers import pipeline

# pipe = pipeline(model="facebook/opt-1.3b", torch_dtype=torch.bfloat16, device_map="auto")
# output = pipe("This is a cool example!", do_sample=True, top_p=0.95)