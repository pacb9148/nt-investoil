import os
from PIL import Image

src_path = os.path.join(os.path.dirname(__file__), '..', 'nextjs-opc-webapp', 'public', 'images', 'branding', 'oil-drop-logo.png')
public_dir = os.path.join(os.path.dirname(__file__), '..', 'nextjs-opc-webapp', 'public')
branding_dir = os.path.join(public_dir, 'images', 'branding')

os.makedirs(branding_dir, exist_ok=True)

if os.path.exists(src_path):
    img = Image.open(src_path)
    
    # 1. Favicon PNG (32x32)
    fav_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    fav_32.save(os.path.join(branding_dir, 'favicon.png'), format='PNG')
    
    # 2. Icon 192 y 512
    fav_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    fav_192.save(os.path.join(branding_dir, 'icon-192.png'), format='PNG')
    
    fav_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    fav_512.save(os.path.join(branding_dir, 'icon-512.png'), format='PNG')
    
    # 3. Favicon ICO multi-tamaño
    img.save(
        os.path.join(public_dir, 'favicon.ico'),
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )
    print("Favicons generados con éxito con el logo de la gota de petróleo.")
else:
    print(f"Error: {src_path} no encontrado.")
