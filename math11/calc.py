import random
import string
import time


def add(a: int, b: int) -> int:
    return a + b

def calc_4way(a: int, b: int):
    return a + b, a - b, a * b, a / b
calc_4way.NOZY_NODE_DEF = {
    "name": "calc_4way",
    "description": "Calculates the sum, difference, product, and quotient of two numbers.",
    "input": {
        "a": {
            "type": "float",
            "description": "The first number to add.",
            "min": -10.0, "max": 10.0, "step": 0.01
        },
        "b": {
            "type": "float",
            "description": "The second number to add.",
            "min": -10.0, "max": 10.0, "step": 0.01
        }
    },
    "output": ["float", "float", "float", "float"],
}

def random_string(length: int = 10) -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))

def random_int(max = 100) -> int:
    return random.randint(0, max)

def slow_function(delay: int = 3) -> int:
    time.sleep(delay)
    return random_int()

def string_concat(a: str, b: str) -> str:
    return a + b