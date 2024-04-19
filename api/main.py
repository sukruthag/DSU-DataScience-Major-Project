import os
from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from diffusers import StableDiffusionPipeline
from fastapi.responses import StreamingResponse
import matplotlib.pyplot as plt
import torch
import io
import json

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

torch.set_num_threads(16)
# model_id = "dreamlike-art/dreamlike-diffusion-1.0"
model_id = "dream-textures/texture-diffusion"
pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float32)
pipe = pipe.to("cpu")
pipe.enable_attention_slicing()
num_inference_steps = 15
progress_percentage = 0
number_images = 0
number_images_complete = 0
generating = ''

def update_progress(a, b, c, **kwargs):
    global progress_percentage
    progress_percentage = a + 1

def list_files_in_folder_tree(folder_path):
    files = []
    for root, directories, filenames in os.walk(folder_path):
        for filename in filenames:
            files.append(os.path.join(root, filename).replace('\\', '/'))
    return files


@app.get("/")
def root():
    return {
        "api working"
    }

@app.get("/tree")
def tree():
    files_in_folder_tree = list_files_in_folder_tree('image')
    return files_in_folder_tree


@app.get("/progress")
def progress():
    file_num = number_images_complete + 1
    progress = int((progress_percentage / num_inference_steps) * 100)
    return {
        'file_progress': file_num,
        'total_files': number_images,
        'progress': progress
    }

@app.get("/run")
def run(prompt: str, number: int):
    global progress_percentage
    global number_images 
    global number_images_complete
    global generating
    generating = prompt
    number_images = number
    number_images_complete = 0
    try:
        os.mkdir(f'image/{prompt}')
    except:
        pass
    for i in range(number):
        progress_percentage = 0
        image = pipe(prompt, height=512, width=512, callback=update_progress, callback_steps=1, num_inference_steps=num_inference_steps).images[0]
        image.save(f"image/{prompt}/{i}.png")
        number_images_complete = i + 1
    
    generating = ''
    return True

@app.get('/generating')
def generating():
    global generating
    if (generating == '') :
        return False
    return generating