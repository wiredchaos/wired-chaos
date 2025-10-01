"""
589-Coded Riddles Generator
Generates WIRED CHAOS lore riddles with 589 encoding
"""

import random
from typing import List, Dict


# 589 encoding mapping (simple cipher for demonstration)
ENCODING_589 = {
    'a': '5', 'b': '8', 'c': '9', 'd': '58', 'e': '89', 'f': '59',
    'g': '85', 'h': '98', 'i': '95', 'j': '589', 'k': '859', 'l': '895',
    'm': '958', 'n': '985', 'o': '595', 'p': '858', 'q': '898',
    'r': '955', 's': '985', 't': '598', 'u': '895', 'v': '958',
    'w': '859', 'x': '589', 'y': '985', 'z': '598'
}


def encode_589(text: str) -> str:
    """
    Encode text using 589 cipher
    
    Args:
        text: Text to encode
    
    Returns:
        589-encoded text
    """
    encoded = []
    for char in text.lower():
        if char in ENCODING_589:
            encoded.append(ENCODING_589[char])
        elif char == ' ':
            encoded.append('-')
        else:
            encoded.append(char)
    return ''.join(encoded)


def decode_589(encoded_text: str) -> str:
    """
    Decode 589-encoded text (reverse mapping)
    
    Args:
        encoded_text: 589-encoded text
    
    Returns:
        Decoded text
    """
    # Create reverse mapping
    reverse_map = {v: k for k, v in ENCODING_589.items()}
    
    # Simple decode (this is a placeholder - actual decode would be more complex)
    decoded = []
    parts = encoded_text.split('-')
    for part in parts:
        if part in reverse_map:
            decoded.append(reverse_map[part])
        else:
            decoded.append('?')
    
    return ' '.join(decoded)


RIDDLE_TEMPLATES = [
    {
        'template': "Where {location} meets {element}, the {artifact} awaits the {seeker}.",
        'answer': "vault33",
        'hint': "Follow the neon path"
    },
    {
        'template': "When {number} {objects} align under {celestial}, {action} the {secret}.",
        'answer': "sangreal",
        'hint': "Look to the stars"
    },
    {
        'template': "The {guardian} guards {treasure} beyond {barrier}, seek {method}.",
        'answer': "merovingian",
        'hint': "Ancient knowledge"
    },
    {
        'template': "{color} {symbol} marks the {place} where {beings} gather.",
        'answer': "ember",
        'hint': "Fire guides"
    },
    {
        'template': "In the {realm} of {concept}, {entity} whispers {message}.",
        'answer': "cipher",
        'hint': "Listen closely"
    }
]


RIDDLE_VOCABULARY = {
    'location': ['crossroads', 'nexus', 'gateway', 'threshold', 'convergence'],
    'element': ['fire', 'void', 'chaos', 'order', 'entropy'],
    'artifact': ['key', 'fragment', 'token', 'sigil', 'relic'],
    'seeker': ['worthy', 'chosen', 'initiated', 'awakened', 'enlightened'],
    'number': ['three', 'five', 'seven', 'nine', 'thirteen'],
    'objects': ['pillars', 'flames', 'stars', 'codes', 'glyphs'],
    'celestial': ['crimson moon', 'void star', 'cyber dawn', 'neon eclipse'],
    'action': ['speak', 'burn', 'merge', 'unlock', 'ignite'],
    'secret': ['password', 'phrase', 'mantra', 'incantation', 'protocol'],
    'guardian': ['Merovingian', 'Gatekeeper', 'Oracle', 'Sentinel', 'Architect'],
    'treasure': ['knowledge', 'power', 'truth', 'wisdom', 'secrets'],
    'barrier': ['firewall', 'veil', 'matrix', 'labyrinth', 'cipher'],
    'method': ['persistence', 'insight', 'courage', 'sacrifice', 'unity'],
    'color': ['Neon', 'Crimson', 'Void', 'Cyber', 'Electric'],
    'symbol': ['triangle', 'circle', 'spiral', 'hex', 'node'],
    'place': ['vault', 'sanctum', 'hub', 'nexus', 'portal'],
    'beings': ['seekers', 'initiates', 'rebels', 'awakened', 'chosen'],
    'realm': ['digital', 'cyber', 'astral', 'quantum', 'liminal'],
    'concept': ['chaos', 'order', 'entropy', 'emergence', 'transcendence'],
    'entity': ['Oracle', 'AI', 'Spirit', 'Guardian', 'Architect'],
    'message': ['prophecy', 'warning', 'blessing', 'challenge', 'invitation']
}


def generate_riddle() -> Dict:
    """
    Generate a single 589-coded riddle
    
    Returns:
        Dictionary with riddle, encoded version, and hint
    """
    # Select random template
    template_data = random.choice(RIDDLE_TEMPLATES)
    template = template_data['template']
    
    # Fill template with random vocabulary
    riddle_text = template
    for key in RIDDLE_VOCABULARY:
        if f'{{{key}}}' in riddle_text:
            word = random.choice(RIDDLE_VOCABULARY[key])
            riddle_text = riddle_text.replace(f'{{{key}}}', word)
    
    # Encode the answer
    encoded_answer = encode_589(template_data['answer'])
    
    return {
        'riddle': riddle_text,
        'encoded_answer': encoded_answer,
        'hint': template_data['hint'],
        'difficulty': random.choice(['Easy', 'Medium', 'Hard', 'Expert'])
    }


def generate_riddle_collection(num_riddles: int = 5) -> List[Dict]:
    """
    Generate a collection of riddles
    
    Args:
        num_riddles: Number of riddles to generate
    
    Returns:
        List of riddle dictionaries
    """
    riddles = []
    for i in range(num_riddles):
        riddle = generate_riddle()
        riddle['id'] = i + 1
        riddles.append(riddle)
    
    return riddles


def format_riddles_markdown(riddles: List[Dict]) -> str:
    """
    Format riddles as markdown
    
    Args:
        riddles: List of riddle dictionaries
    
    Returns:
        Markdown-formatted riddles
    """
    md = "# WIRED CHAOS - 589-Coded Lore Riddles\n\n"
    md += "> Ancient wisdom encrypted in the language of chaos\n\n"
    md += "---\n\n"
    
    for riddle in riddles:
        md += f"## Riddle #{riddle['id']} - {riddle['difficulty']}\n\n"
        md += f"**Riddle:**\n> {riddle['riddle']}\n\n"
        md += f"**589-Encoded Answer:** `{riddle['encoded_answer']}`\n\n"
        md += f"**Hint:** *{riddle['hint']}*\n\n"
        md += "---\n\n"
    
    md += "\n## 589 Cipher Guide\n\n"
    md += "To decode the answers, you must understand the sacred 589 cipher.\n"
    md += "Each sequence of numbers represents a hidden truth.\n\n"
    md += "**Hint:** The numbers 5, 8, and 9 hold the key to unlocking all secrets.\n\n"
    
    return md
