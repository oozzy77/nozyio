import datetime
from typing import Union, Tuple


def greeting(name: Union[str, int]):
    print(f"Hello, {name}!")

def get_iso_and_timestamp(tz: str = "UTC") -> Tuple[str, int]:
    return datetime.datetime.now().isoformat(), int(datetime.datetime.now().timestamp())

get_iso_and_timestamp.NOZY_NODE_DEF = {
    "name": "Get iso time",
    "desc": "Get the current ISO timestamp string and timestamp integer",
    "input":  {
        "tz": {
            "type": "str",
            "default": "UTC",
            "desc": "The timezone to use"
        }
    },
    "output": [
        {
            "type": "str",
            "desc": "The ISO timestamp string"
        },
        "int",
    ]
}