import json

def python_obj_from_json(json: str) -> any:
    return json.loads(json)

python_obj_from_json.NOZY_NODE_DEF = {
    "name": "Python Object from JSON",
    "description": "Converts a JSON string to a Python object"
}


def for_loop(items: list) -> list:
    return [item for item in items]

for_loop.NOZY_NODE_DEF = {
    "name": "For...in Loop",
    "description": "Loops over a list of items",
}