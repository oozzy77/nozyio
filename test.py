# from diffusers.models.autoencoders.autoencoder_kl import AutoencoderKL

# vae = AutoencoderKL.from_pretrained("stabilityai/sdxl-vae")
# print(vae)


import os

os.environ['HF_HOME'] = './models'
os.environ['HF_HUB_OFFLINE'] = 'True'


# from diffusers import StableDiffusionPipeline

# pipe = StableDiffusionPipeline.from_pretrained("CompVis/stable-diffusion-v1-4")


from diffusers import AutoPipelineForText2Image
import torch
from nozyio import device_management

pipeline = AutoPipelineForText2Image.from_pretrained(
	"stable-diffusion-v1-5/stable-diffusion-v1-5", torch_dtype=torch.float16, variant="fp16"
).to(device_management.device)
# generator = torch.Generator(device_management.device).manual_seed(31)
image = pipeline("Astronaut in a jungle, cold color palette, muted colors, detailed, 8k", 
# guidance_scale=0.,
height=512,
width=512,
# num_inference_steps=4,
max_sequence_length=256,).images[0]
image.save("test.png") 
