"""Tiny JSON-Schema (2020-12 subset) validator used only to test that schemas and live outputs agree."""
import re

TYPES = {"string": str, "integer": int, "number": (int, float), "boolean": bool, "array": list, "object": dict, "null": type(None)}


def _is(v, t):
    if t in ("integer", "number") and isinstance(v, bool):
        return False
    return isinstance(v, TYPES[t])


def validate(inst, schema, root=None, path="$"):
    root, errs = root or schema, []
    if "$ref" in schema:
        node = root
        for part in schema["$ref"].lstrip("#/").split("/"):
            node = node[part]
        return validate(inst, node, root, path)
    t = schema.get("type")
    if t is not None and not any(_is(inst, x) for x in (t if isinstance(t, list) else [t])):
        return [f"{path}: expected {t}, got {type(inst).__name__}"]
    if "const" in schema and inst != schema["const"]:
        errs.append(f"{path}: const {schema['const']!r}")
    if "enum" in schema and inst not in schema["enum"]:
        errs.append(f"{path}: {inst!r} not in enum")
    if isinstance(inst, str):
        if "pattern" in schema and not re.search(schema["pattern"], inst):
            errs.append(f"{path}: {inst!r} !~ {schema['pattern']}")
        if len(inst) < schema.get("minLength", 0) or len(inst) > schema.get("maxLength", 10**9):
            errs.append(f"{path}: length")
        if schema.get("format") == "date-time" and not re.match(r"^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d", inst):
            errs.append(f"{path}: date-time")
    if isinstance(inst, (int, float)) and not isinstance(inst, bool):
        if inst < schema.get("minimum", -float("inf")) or inst > schema.get("maximum", float("inf")):
            errs.append(f"{path}: {inst} out of range")
    if isinstance(inst, list):
        if len(inst) < schema.get("minItems", 0) or len(inst) > schema.get("maxItems", 10**9):
            errs.append(f"{path}: item count")
        if schema.get("uniqueItems") and len({repr(x) for x in inst}) != len(inst):
            errs.append(f"{path}: not unique")
        for i, x in enumerate(inst):
            if "items" in schema:
                errs += validate(x, schema["items"], root, f"{path}[{i}]")
    if isinstance(inst, dict):
        for k in schema.get("required", []):
            if k not in inst:
                errs.append(f"{path}: missing {k}")
        props, ap = schema.get("properties", {}), schema.get("additionalProperties", True)
        for k, v in inst.items():
            if "propertyNames" in schema and not re.search(schema["propertyNames"]["pattern"], k):
                errs.append(f"{path}: bad key {k!r}")
            if k in props:
                errs += validate(v, props[k], root, f"{path}.{k}")
            elif ap is False:
                errs.append(f"{path}: unexpected {k}")
            elif isinstance(ap, dict):
                errs += validate(v, ap, root, f"{path}.{k}")
    return errs
