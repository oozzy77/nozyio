
from typing import Literal
import torch

device: Literal['cpu', 'mps', 'cuda'] = 'cpu'

if torch.cuda.is_available():
    device = 'cuda'
elif torch.backends.mps.is_available():
    device = 'mps'
else:
    device = 'cpu'
