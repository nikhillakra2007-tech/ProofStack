import os
import tarfile
import zipfile


def _inside(base, path):
    base, real = os.path.realpath(base), os.path.realpath(path)    # resolves .., symlinks, absolute joins
    return os.path.commonpath([base, real]) == base


def read_file(base_dir, user_path):
    path = os.path.join(base_dir, user_path)
    if not _inside(base_dir, path):
        raise PermissionError("outside base directory")
    with open(path, "rb") as f:
        return f.read()


def extract(archive_path, dest_dir):
    if archive_path.endswith(".zip"):
        with zipfile.ZipFile(archive_path) as z:
            for info in z.infolist():                              # validate every member before writing any
                if not _inside(dest_dir, os.path.join(dest_dir, info.filename)):
                    raise ValueError(f"blocked member {info.filename!r}")
            z.extractall(dest_dir)
    else:
        with tarfile.open(archive_path) as t:
            t.extractall(dest_dir, filter="data")                  # PEP 706 'data' filter
