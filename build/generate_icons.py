#!/usr/bin/env python3
"""Generate 4 app icon variations for ClawControlRSM using Google Imagen 4."""

import os
import base64
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# 4 different icon concepts
prompts = [
    # 1: Stylized R monogram
    (
        "A premium app icon for a desktop application, 1024x1024 pixels. "
        "A sleek stylized letter 'R' monogram rendered in glowing teal (#08cdbf) and emerald (#17a192) gradients "
        "on a very dark background (#0a0d12). The R has subtle geometric facets and clean sharp edges, "
        "with a faint teal glow emanating from it. Minimal, modern, tech-forward aesthetic. "
        "The icon has slightly rounded square corners like a macOS app icon. "
        "No text other than the R. Ultra clean, vector-like quality, professional."
    ),
    # 2: Abstract data/CRM network
    (
        "A premium app icon for a desktop application, 1024x1024 pixels. "
        "An abstract network/constellation design representing CRM data connections. "
        "Glowing teal (#08cdbf) and emerald (#17a192) nodes connected by thin luminous lines "
        "forming an elegant geometric pattern on a very dark background (#0a0d12). "
        "The nodes vary in size, suggesting a data hierarchy. Slightly rounded square shape like a macOS app icon. "
        "Premium, dark-mode native, tech-forward. Minimal and clean, suitable for small sizes. Professional app icon."
    ),
    # 3: Shield/diamond shape
    (
        "A premium app icon for a desktop application, 1024x1024 pixels. "
        "A modern shield or diamond shape with teal (#08cdbf) and emerald (#17a192) gradient edges "
        "on a very dark background (#0a0d12). Inside the shield, a subtle abstract 'R' letterform "
        "or geometric CRM symbol. Faint glow effects on the edges. "
        "Slightly rounded square shape like a macOS app icon. "
        "Ultra premium, dark-mode native, tech-forward consulting brand aesthetic. Clean vector-like quality."
    ),
    # 4: Hexagonal/geometric R
    (
        "A premium app icon for a desktop application, 1024x1024 pixels. "
        "A hexagonal or octagonal frame in teal (#08cdbf) and emerald (#17a192) containing "
        "a bold modern 'R' lettermark on a very dark background (#0a0d12). "
        "The frame has subtle depth with gradient edges and a soft teal glow. "
        "Slightly rounded square shape like a macOS app icon. "
        "Minimalist, geometric, premium feel. Suitable as a professional desktop app icon. "
        "Clean enough to be recognizable at 16x16 pixels. No extra text or decoration."
    ),
]

build_dir = "/home/riktanius/.openclaw/workspace/projects/ClawControl/build"

for i, prompt in enumerate(prompts, 1):
    print(f"\n--- Generating variation {i}/4 ---")
    try:
        response = client.models.generate_images(
            model="imagen-4.0-generate-001",
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1",
                output_mime_type="image/png",
            ),
        )
        if response.generated_images:
            img_data = response.generated_images[0].image.image_bytes
            path = os.path.join(build_dir, f"icon-new-{i}.png")
            with open(path, "wb") as f:
                f.write(img_data)
            print(f"  Saved: {path} ({len(img_data)} bytes)")
        else:
            print(f"  WARNING: No image returned for variation {i}")
    except Exception as e:
        print(f"  ERROR generating variation {i}: {e}")

print("\nDone! Now review the 4 variations.")
