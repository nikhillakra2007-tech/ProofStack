import ast
import json
import subprocess

import yaml


def load_config(blob):
    return json.loads(blob)


def load_yaml(text):
    return yaml.safe_load(text)


def run_tool(name):
    return subprocess.run(["echo", name], capture_output=True, shell=False)


def calc(expr):
    return ast.literal_eval(expr)
