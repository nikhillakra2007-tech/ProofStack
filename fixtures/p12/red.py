import os
import tarfile
import zipfile


def read_file(base_dir, user_path):
    with open(os.path.join(base_dir, user_path), "rb") as f:     # no canonicalisation
        return f.read()


def extract(archive_path, dest_dir):
    if archive_path.endswith(".zip"):
        with zipfile.ZipFile(archive_path) as z:
            for name in z.namelist():                            # member names trusted
                target = os.path.join(dest_dir, name)
                os.makedirs(os.path.dirname(target), exist_ok=True)
                with open(target, "wb") as f:
                    f.write(z.read(name))
    else:
        with tarfile.open(archive_path) as t:
            t.extractall(dest_dir, filter="fully_trusted")
