from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
import base64
from pathlib import Path
from typing import Tuple


def generate_rsa_keypair(key_size: int = 2048) -> Tuple[bytes, bytes]:
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=key_size, backend=default_backend())
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )

    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    return private_pem, public_pem


def save_key(path: str, data: bytes) -> None:
    p = Path(path)
    p.write_bytes(data)


def load_public_key(pem_bytes: bytes):
    return serialization.load_pem_public_key(pem_bytes, backend=default_backend())


def load_private_key(pem_bytes: bytes):
    return serialization.load_pem_private_key(pem_bytes, password=None, backend=default_backend())


def encrypt_vote(public_pem: bytes, plaintext: bytes) -> str:
    pub = load_public_key(public_pem)
    ciphertext = pub.encrypt(
        plaintext,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
    )
    return base64.b64encode(ciphertext).decode("utf-8")


def decrypt_vote(private_pem: bytes, b64_ciphertext: str) -> bytes:
    priv = load_private_key(private_pem)
    ciphertext = base64.b64decode(b64_ciphertext.encode("utf-8"))
    plaintext = priv.decrypt(
        ciphertext,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
    )
    return plaintext
