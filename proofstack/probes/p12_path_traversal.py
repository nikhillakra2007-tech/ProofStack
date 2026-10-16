"""P12 - path traversal & unsafe archive extraction.

Target module: read_file(base_dir, user_path)->bytes ; extract(archive_path, dest_dir)->None.
Builds a jail inside a temp root, fires traversal reads and hostile zip/tar archives, then diffs the
file tree: any write outside dest, or any read returning the out-of-jail secret, is a finding.
"""
import io
import os
import tarfile
import tempfile
import zipfile

from proofstack.probes._kit import run_cli, verdict

SECRET = b"PROOFSTACK_OUTSIDE_SECRET"


def snap(root):
    out = set()
    for d, dirs, files in os.walk(root):                       # os.walk does not follow symlinked dirs
        out.update(os.path.join(d, f) for f in files)
        out.update(os.path.join(d, x) for x in dirs if os.path.islink(os.path.join(d, x)))
    return out


def make_zip(path, root):
    with zipfile.ZipFile(path, "w") as z:
        z.writestr("ok/readme.txt", b"fine")
        z.writestr("../escaped_zip.txt", b"x")
        z.writestr(os.path.join(root, "escaped_abs.txt"), b"x")             # absolute member name


def make_tar(path):
    with tarfile.open(path, "w") as t:
        for name, kind, link in (("ok/readme.txt", tarfile.REGTYPE, ""), ("../escaped_tar.txt", tarfile.REGTYPE, ""),
                                 ("lnk", tarfile.SYMTYPE, ".."), ("lnk/escaped_symlink.txt", tarfile.REGTYPE, "")):
            ti = tarfile.TarInfo(name)
            ti.type, ti.linkname = kind, link
            data = b"x" if kind == tarfile.REGTYPE else b""
            ti.size = len(data)
            t.addfile(ti, io.BytesIO(data))


def detect(mod, p):
    escapes, leaks = [], []
    with tempfile.TemporaryDirectory() as root:
        root = os.path.realpath(root)
        jail, secret = os.path.join(root, "jail"), os.path.join(root, "secret.txt")
        os.makedirs(os.path.join(jail, "sub"))
        for path, data in ((secret, SECRET), (os.path.join(jail, "ok.txt"), b"fine")):
            with open(path, "wb") as f:
                f.write(data)
        os.symlink(secret, os.path.join(jail, "link"))
        for payload in ("../secret.txt", secret, "....//secret.txt", "link", "sub/../../secret.txt"):
            try:
                data = mod.read_file(jail, payload)
            except Exception:
                continue
            if SECRET in (data if isinstance(data, bytes) else str(data).encode()):
                leaks.append(payload)
        for kind in ("zip", "tar"):
            dest, arc = os.path.join(root, f"dest_{kind}"), os.path.join(root, f"evil.{kind}")
            os.makedirs(dest)
            make_zip(arc, root) if kind == "zip" else make_tar(arc)
            before = snap(root)
            try:
                mod.extract(arc, dest)
            except Exception:
                pass
            escapes += [(kind, os.path.relpath(x, root)) for x in snap(root) - before
                        if not x.startswith(dest + os.sep)]
    return verdict("P12", bool(escapes or leaks), ["SEC"], {"read_payloads": 5, "archives": 2},
                   {"read_leaks": leaks, "files_written_outside_dest": escapes}, *leaks, *[e[1] for e in escapes])


if __name__ == "__main__":
    run_cli("P12", detect)
