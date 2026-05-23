"""
Small CLI utilities for key generation and example encrypt/decrypt operations.

Usage examples:
  python security_cli.py gen-keys --private keys/private.pem --public keys/public.pem
  python security_cli.py encrypt --public keys/public.pem --message "{\"candidate_id\": 2}"
  python security_cli.py decrypt --private keys/private.pem --cipher "<base64>"
"""
import argparse
from pathlib import Path
import json

from encryption import generate_rsa_keypair, save_key, encrypt_vote, decrypt_vote


def cmd_gen_keys(args):
    priv, pub = generate_rsa_keypair()
    Path(args.private).parent.mkdir(parents=True, exist_ok=True)
    save_key(args.private, priv)
    save_key(args.public, pub)
    print(f"Wrote private key to {args.private} and public key to {args.public}")


def cmd_encrypt(args):
    pub = Path(args.public).read_bytes()
    message = args.message.encode("utf-8")
    cipher = encrypt_vote(pub, message)
    print(cipher)


def cmd_decrypt(args):
    priv = Path(args.private).read_bytes()
    plain = decrypt_vote(priv, args.cipher)
    try:
        # pretty-print JSON if possible
        obj = json.loads(plain.decode("utf-8"))
        print(json.dumps(obj, indent=2))
    except Exception:
        print(plain.decode("utf-8"))


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(required=True)

    g = sub.add_parser("gen-keys")
    g.add_argument("--private", required=True)
    g.add_argument("--public", required=True)
    g.set_defaults(func=cmd_gen_keys)

    e = sub.add_parser("encrypt")
    e.add_argument("--public", required=True)
    e.add_argument("--message", required=True)
    e.set_defaults(func=cmd_encrypt)

    d = sub.add_parser("decrypt")
    d.add_argument("--private", required=True)
    d.add_argument("--cipher", required=True)
    d.set_defaults(func=cmd_decrypt)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
