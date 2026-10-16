import pickle
import subprocess

import yaml


def load_config(blob):
    return pickle.loads(blob)                              # arbitrary code execution


def load_yaml(text):
    return yaml.load(text, Loader=yaml.Loader)             # unsafe loader


def run_tool(name):
    return subprocess.run(f"echo {name}", shell=True, capture_output=True)    # shell injection


def calc(expr):
    return eval(expr)                                      # code injection
