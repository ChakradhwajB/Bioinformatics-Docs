import re

MAX_DP_SEQUENCE_LENGTH = 50
MAX_LINEAR_SEQUENCE_LENGTH = 1000

def validate_sequence(seq: str):
    if not re.match(r"^[ACGTNacgtnUu]*$", seq):
        raise ValueError("Invalid characters in sequence")
