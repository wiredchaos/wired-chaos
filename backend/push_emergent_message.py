import requests

# WIRED CHAOS Emergent LLM push message automation
API_URL = "http://localhost:8080/api/ask"  # Change if backend runs elsewhere

payload = {
    "message": "This is a live test message from the WIRED CHAOS NSA-level automation swarm. Confirm channel receipt and log this event.",
    "section": "hub",
    "user": "emergent",
}

response = requests.post(API_URL, json=payload)
print("Emergent LLM channel response:", response.json())
