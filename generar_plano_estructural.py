import ezdxf
from ezdxf import colors
import math
import matplotlib.pyplot as plt
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend

def crear_plano_estructural():
    doc = ezdxf.new("R2018", setup=True)
    msp = doc.modelspace()

    # Configurar unidades en milimetros (4 = mm)
    doc.header['$INSUNITS'] = 4
    doc.header['$MEASUREMENT'] = 1

    # Definir capas normalizadas de ingeniería
    layers_config = [
        ("E-BORDE", 7, 0.70),          # Blanco / Borde lámina
        ("E-CAJETIN", 7, 0.35),        # Blanco / Cajetín
        ("E-EJES", 1, 0.18),           # Rojo / Ejes de replanteo
        ("E-EJES-BURBUJA", 7, 0.25),   # Blanco / Burbujas de ejes
        ("E-CIMENT-ZAPATAS", 4, 0.50), # Cian / Zapatas
        ("E-CIMENT-RIOSTRAS", 3, 0.35),# Verde / Vigas riostras
        ("E-PILARES", 2, 0.50),        # Amarillo / Pilares hormigón
        ("E-ARMADURA-LONG", 6, 0.50),  # Magenta / Barras longitudinales
        ("E-ARMADURA-ESTRIBO", 5, 0.25),# Azul / Estribos
        ("E-HORMIGON-LIMPIEZA", 8, 0.18),# Gris / Hormigón limpieza
        ("E-MUROS-GUIA", 9, 0.13),     # Gris claro / Muros arquitectónicos
        ("E-COTAS", 7, 0.18),          # Blanco / Cotas
        ("E-TEXTOS", 7, 0.25),         # Blanco / Textos
        ("E-TITULOS", 4, 0.50),        # Cian / Títulos de vistas
        ("E-TABLAS", 7, 0.25),         # Blanco / Tablas técnicas
    ]

    for name, color, lw in layers_config:
        doc.layers.add(name, color=color, lineweight=int(lw * 100))

    # ==========================================
    # UTILIDADES DE DIBUJO
    # ==========================================
    def rect(x, y, w, h, layer="0"):
        msp.add_lwpolyline([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], close=True, dxfattribs={"layer": layer})

    def circle(cx, cy, r, layer="0"):
        msp.add_circle((cx, cy), r, dxfattribs={"layer": layer})

    def line(p1, p2, layer="0"):
        msp.add_line(p1, p2, dxfattribs={"layer": layer})

    def text(t, pt, height=200, layer="E-TEXTOS", align="LEFT"):
        t_entity = msp.add_text(t, dxfattribs={"layer": layer, "height": height})
        if align == "CENTER":
            t_entity.set_placement(pt, align=ezdxf.enums.TextEntityAlignment.MIDDLE_CENTER)
        elif align == "RIGHT":
            t_entity.set_placement(pt, align=ezdxf.enums.TextEntityAlignment.MIDDLE_RIGHT)
        else:
            t_entity.set_placement(pt, align=ezdxf.enums.TextEntityAlignment.BOTTOM_LEFT)

    def dimension_h(p1, p2, y_dim, val_text, layer="E-COTAS"):
        # Línea de cota horizontal con testigos
        x1, x2 = min(p1[0], p2[0]), max(p1[0], p2[0])
        # Líneas de referencia
        line((x1, p1[1]), (x1, y_dim + (100 if y_dim > p1[1] else -100)), layer=layer)
        line((x2, p2[1]), (x2, y_dim + (100 if y_dim > p2[1] else -100)), layer=layer)
        # Línea de cota
        line((x1, y_dim), (x2, y_dim), layer=layer)
        # Ticks a 45 grados
        line((x1 - 80, y_dim - 80), (x1 + 80, y_dim + 80), layer=layer)
        line((x2 - 80, y_dim - 80), (x2 + 80, y_dim + 80), layer=layer)
        # Texto
        text(val_text, ((x1 + x2) / 2, y_dim + 60), height=140, layer=layer, align="CENTER")

    def dimension_v(p1, p2, x_dim, val_text, layer="E-COTAS"):
        # Línea de cota vertical con testigos
        y1, y2 = min(p1[1], p2[1]), max(p1[1], p2[1])
        # Líneas de referencia
        line((p1[0], y1), (x_dim + (100 if x_dim > p1[0] else -100), y1), layer=layer)
        line((p2[0], y2), (x_dim + (100 if x_dim > p2[0] else -100), y2), layer=layer)
        # Línea de cota
        line((x_dim, y1), (x_dim, y2), layer=layer)
        # Ticks a 45 grados
        line((x_dim - 80, y1 - 80), (x_dim + 80, y1 + 80), layer=layer)
        line((x_dim - 80, y2 - 80), (x_dim + 80, y2 + 80), layer=layer)
        # Texto
        text(val_text, (x_dim - 60, (y1 + y2) / 2), height=140, layer=layer, align="RIGHT")

    # ==========================================
    # 1. PLANTA DE CIMENTACIÓN Y REPLANTEO DE EJES
    # ==========================================
    # Origen de la planta
    OX = 2500
    OY = 10500

    # Coordenadas exactas de los ejes del plano arquitectónico (mm)
    # Horizontal: 3.60, 1.20, 1.20, 2.75, 3.00 -> Total = 11.75 m = 11750 mm
    # Vertical: 3.50, 3.50 -> Total = 7.00 m = 7000 mm
    axes_x = [
        ("1", 0),
        ("2", 3600),
        ("3", 4800),
        ("4", 6000),
        ("5", 8750),
        ("6", 11750)
    ]
    axes_y = [
        ("A", 0),
        ("B", 3500),
        ("C", 7000)
    ]

    title_y = OY + 8800
    text("1. PLANTA DE CIMENTACIÓN Y REPLANTEO DE EJES (ESC 1:50)", (OX, title_y), height=280, layer="E-TITULOS")
    text("COTA SUPERIOR SOLERA: +0.00 m | FONDO EXCAVACIÓN: -0.90 m", (OX, title_y - 350), height=150, layer="E-TEXTOS")

    # Dibujar muros arquitectónicos de fondo (referencia semitransparente/fina)
    # Contorno exterior vivienda
    rect(OX, OY, 11750, 7000, layer="E-MUROS-GUIA")
    # Muros interiores
    line((OX, OY + 3500), (OX + 11750, OY + 3500), layer="E-MUROS-GUIA") # Muro central Eje B
    line((OX + 3600, OY + 3500), (OX + 3600, OY + 7000), layer="E-MUROS-GUIA") # Dormitorio 1 / Baño
    line((OX + 4800, OY + 3500), (OX + 4800, OY + 7000), layer="E-MUROS-GUIA") # Baño 1 / Baño 2
    line((OX + 6000, OY + 3500), (OX + 6000, OY + 7000), layer="E-MUROS-GUIA") # Baño 2 / Dormitorio 2
    line((OX + 8750, OY + 3500), (OX + 8750, OY + 7000), layer="E-MUROS-GUIA") # Dormitorio 2 / Dormitorio 3
    line((OX + 8750, OY), (OX + 8750, OY + 3500), layer="E-MUROS-GUIA") # Cocina / Living
    line((OX + 10250, OY), (OX + 10250, OY + 3500), layer="E-MUROS-GUIA") # Cocina / Dirty Kitchen
    line((OX + 1200, OY), (OX + 1200, OY + 3500), layer="E-MUROS-GUIA") # Porche / Living

    # Etiquetas de estancias de referencia
    text("BEDROOM 1", (OX + 1800, OY + 5200), height=150, layer="E-MUROS-GUIA", align="CENTER")
    text("T&B", (OX + 4200, OY + 5200), height=130, layer="E-MUROS-GUIA", align="CENTER")
    text("T&B", (OX + 5400, OY + 5200), height=130, layer="E-MUROS-GUIA", align="CENTER")
    text("BEDROOM 2", (OX + 7375, OY + 5200), height=150, layer="E-MUROS-GUIA", align="CENTER")
    text("BEDROOM 3", (OX + 10250, OY + 5200), height=150, layer="E-MUROS-GUIA", align="CENTER")
    text("PORCH", (OX + 600, OY + 1750), height=150, layer="E-MUROS-GUIA", align="CENTER")
    text("LIVING & DINING AREA", (OX + 5000, OY + 1750), height=160, layer="E-MUROS-GUIA", align="CENTER")
    text("KITCHEN", (OX + 9500, OY + 2200), height=140, layer="E-MUROS-GUIA", align="CENTER")
    text("DIRTY KITCHEN", (OX + 11000, OY + 1200), height=130, layer="E-MUROS-GUIA", align="CENTER")

    # Malla de Ejes estructurales principales (líneas discontinuas)
    ext_axis = 1400
    for name, x in axes_x:
        gx = OX + x
        line((gx, OY - ext_axis), (gx, OY + 7000 + ext_axis), layer="E-EJES")
        # Burbujas inferior y superior
        for by in [OY - ext_axis, OY + 7000 + ext_axis]:
            circle(gx, by, 320, layer="E-EJES-BURBUJA")
            text(name, (gx, by), height=220, layer="E-EJES-BURBUJA", align="CENTER")

    for name, y in axes_y:
        gy = OY + y
        line((OX - ext_axis, gy), (OX + 11750 + ext_axis, gy), layer="E-EJES")
        # Burbujas izquierda y derecha
        for bx in [OX - ext_axis, OX + 11750 + ext_axis]:
            circle(bx, gy, 320, layer="E-EJES-BURBUJA")
            text(name, (bx, gy), height=220, layer="E-EJES-BURBUJA", align="CENTER")

    # Cotas de Ejes Superiores e Inferiores
    for i in range(len(axes_x) - 1):
        x1 = OX + axes_x[i][1]
        x2 = OX + axes_x[i+1][1]
        val = (axes_x[i+1][1] - axes_x[i][1]) / 1000.0
        dimension_h((x1, OY + 7000 + ext_axis), (x2, OY + 7000 + ext_axis), OY + 7000 + ext_axis + 500, f"{val:.2f}")
    # Cota total superior
    dimension_h((OX, OY + 7000 + ext_axis), (OX + 11750, OY + 7000 + ext_axis), OY + 7000 + ext_axis + 1000, "11.75 m")

    # Cotas de Ejes Laterales
    for j in range(len(axes_y) - 1):
        y1 = OY + axes_y[j][1]
        y2 = OY + axes_y[j+1][1]
        val = (axes_y[j+1][1] - axes_y[j][1]) / 1000.0
        dimension_v((OX - ext_axis, y1), (OX - ext_axis, y2), OX - ext_axis - 500, f"{val:.2f}")
    # Cota total lateral
    dimension_v((OX - ext_axis, OY), (OX - ext_axis, OY + 7000), OX - ext_axis - 1000, "7.00 m")

    # Columnas y Zapatas en los nudos estructurales
    # Ejes x para columnas: 0, 3600, 6000, 8750, 11750 (5 ejes x 3 ejes Y = 15 pilares)
    col_x_indices = [0, 1, 3, 4, 5] # Ejes 1, 2, 4, 5, 6
    col_coords = []
    for xi in col_x_indices:
        cx_val = axes_x[xi][1]
        for y_name, cy_val in axes_y:
            col_coords.append((cx_val, cy_val, axes_x[xi][0], y_name))

    # Vigas Riostras / Vigas de Cimentación VR-1 (250x350 mm)
    # Riostras horizontales en Eje A, B, C
    b_rio = 250
    for y_name, cy_val in axes_y:
        gy = OY + cy_val
        rect(OX, gy - b_rio/2, 11750, b_rio, layer="E-CIMENT-RIOSTRAS")
        text("VR-1 (25x35)", (OX + 1800, gy + 150), height=110, layer="E-CIMENT-RIOSTRAS", align="CENTER")
        text("VR-1 (25x35)", (OX + 7375, gy + 150), height=110, layer="E-CIMENT-RIOSTRAS", align="CENTER")
        text("VR-1 (25x35)", (OX + 10250, gy + 150), height=110, layer="E-CIMENT-RIOSTRAS", align="CENTER")

    # Riostras verticales en Ejes 1, 2, 4, 5, 6
    for xi in col_x_indices:
        gx = OX + axes_x[xi][1]
        rect(gx - b_rio/2, OY, b_rio, 7000, layer="E-CIMENT-RIOSTRAS")
        text("VR-1", (gx + 150, OY + 1750), height=110, layer="E-CIMENT-RIOSTRAS", align="LEFT")
        text("VR-1", (gx + 150, OY + 5250), height=110, layer="E-CIMENT-RIOSTRAS", align="LEFT")

    # Zapatas y Pilares
    for cx_val, cy_val, ax_name, ay_name in col_coords:
        gx = OX + cx_val
        gy = OY + cy_val

        # Determinar tipo de zapata según posición
        # Interiores: Eje B y x en (3600, 6000, 8750) -> Z-1 (1400x1400)
        # Esquinas: (0,0), (0,7000), (11750,0), (11750,7000) -> Z-3 (1000x1000)
        # Medianeras/perimetrales: Z-2 (1200x1200)
        is_corner = (cx_val in [0, 11750]) and (cy_val in [0, 7000])
        is_interior = (cy_val == 3500) and (cx_val in [3600, 6000, 8750])

        if is_interior:
            z_w, z_h = 1400, 1400
            z_tag = "Z-1"
            z_dim_txt = "1.40x1.40"
        elif is_corner:
            z_w, z_h = 1000, 1000
            z_tag = "Z-3"
            z_dim_txt = "1.00x1.00"
        else:
            z_w, z_h = 1200, 1200
            z_tag = "Z-2"
            z_dim_txt = "1.20x1.20"

        # Zapata (centrada en el eje)
        rect(gx - z_w/2, gy - z_h/2, z_w, z_h, layer="E-CIMENT-ZAPATAS")
        # Trazo diagonal ligero en zapata
        line((gx - z_w/2, gy - z_h/2), (gx + z_w/2, gy + z_h/2), layer="E-CIMENT-ZAPATAS")
        line((gx - z_w/2, gy + z_h/2), (gx + z_w/2, gy - z_h/2), layer="E-CIMENT-ZAPATAS")

        # Pilar C-1 (250x250)
        cp_w, cp_h = 250, 250
        rect(gx - cp_w/2, gy - cp_h/2, cp_w, cp_h, layer="E-PILARES")
        # Sombreado solido pilar (dos diagonales gruesas)
        line((gx - cp_w/2, gy - cp_h/2), (gx + cp_w/2, gy + cp_h/2), layer="E-PILARES")
        line((gx - cp_w/2, gy + cp_h/2), (gx + cp_w/2, gy - cp_h/2), layer="E-PILARES")

        # Etiqueta de Pilar y Zapata
        text(f"P-{ax_name}{ay_name}", (gx + cp_w/2 + 60, gy + 120), height=100, layer="E-TEXTOS")
        text(f"C-1 (25x25)", (gx + cp_w/2 + 60, gy), height=85, layer="E-TEXTOS")
        text(f"{z_tag} ({z_dim_txt})", (gx + cp_w/2 + 60, gy - 120), height=85, layer="E-CIMENT-ZAPATAS")

    # ==========================================
    # 2. DETALLE CONSTRUCTIVO D-01: SECCIÓN DE ZAPATA AISLADA Z-1
    # ==========================================
    DX1 = 17500
    DY1 = 12000

    text("DETALLE D-01: SECCIÓN EN ALZADO ZAPATA AISLADA Z-1 (ESC 1:20)", (DX1, DY1 + 3800), height=240, layer="E-TITULOS")
    text("ENCUENTRO PILAR C-1 (25x25) CON ZAPATA Z-1 (140x140x45) Y RIOSTRA VR-1", (DX1, DY1 + 3500), height=140, layer="E-TEXTOS")

    # Niveles
    line((DX1 - 600, DY1 + 2200), (DX1 + 3200, DY1 + 2200), layer="E-EJES") # Nivel Terreno / Solera +0.00
    text("N.T. +0.00 m (Nivel Solera)", (DX1 + 2400, DY1 + 2260), height=130, layer="E-TEXTOS")

    # Solera (150 mm) y Encachado (150 mm)
    rect(DX1 - 500, DY1 + 2050, 1300, 150, layer="E-MUROS-GUIA")
    text("Solera HA e=15 cm con Mallazo #15x15 d=6", (DX1 - 480, DY1 + 2100), height=100, layer="E-TEXTOS")
    rect(DX1 - 500, DY1 + 1900, 1300, 150, layer="E-HORMIGON-LIMPIEZA")
    text("Encachado grava e=15 cm", (DX1 - 480, DY1 + 1950), height=100, layer="E-HORMIGON-LIMPIEZA")

    rect(DX1 + 1550, DY1 + 2050, 1500, 150, layer="E-MUROS-GUIA")
    rect(DX1 + 1550, DY1 + 1900, 1500, 150, layer="E-HORMIGON-LIMPIEZA")

    # Hormigón de limpieza zapata (100 mm espesor, ancho 1600 mm)
    z_ancho = 1400
    z_canto = 450
    hl_esp = 100
    hl_ancho = z_ancho + 200 # 1600 mm
    hl_x = DX1 + 500 - 100
    hl_y = DY1 + 400
    rect(hl_x, hl_y, hl_ancho, hl_esp, layer="E-HORMIGON-LIMPIEZA")
    text("Hormigón de Limpieza HL-150 e=10 cm", (hl_x + 100, hl_y + 30), height=90, layer="E-HORMIGON-LIMPIEZA")

    # Zapata de hormigón armado (1400x450 mm)
    z_x = DX1 + 500
    z_y = hl_y + hl_esp # DY1 + 500
    rect(z_x, z_y, z_ancho, z_canto, layer="E-CIMENT-ZAPATAS")

    # Pilar que arranca desde la zapata (250 mm ancho)
    p_ancho = 250
    p_x = z_x + (z_ancho - p_ancho)/2 # DX1 + 1075
    p_y_bot = z_y + z_canto
    p_alto = 1800 # hasta salir sobre nivel solera
    rect(p_x, p_y_bot, p_ancho, p_alto, layer="E-PILARES")

    # Viga riostra VR-1 lateral que conecta al pilar (250x350 mm)
    r_ancho = 350
    r_h = 350
    rect(DX1 - 300, p_y_bot, p_x - (DX1 - 300), r_h, layer="E-CIMENT-RIOSTRAS")
    text("Viga Riostra VR-1 (25x35)", (DX1 - 250, p_y_bot + 120), height=110, layer="E-CIMENT-RIOSTRAS")

    # Eje vertical del pilar
    line((p_x + p_ancho/2, DY1 + 200), (p_x + p_ancho/2, DY1 + 3000), layer="E-EJES")

    # ARMADURAS DE LA ZAPATA:
    rec_z = 50 # recubrimiento 5 cm
    # Parrilla inferior longitudinal: Barra horizontal con patillas verticales de 15 cm
    parr_y = z_y + rec_z
    p_x1 = z_x + rec_z
    p_x2 = z_x + z_ancho - rec_z
    patilla_h = 150
    msp.add_lwpolyline([(p_x1, parr_y + patilla_h), (p_x1, parr_y), (p_x2, parr_y), (p_x2, parr_y + patilla_h)],
                       close=False, dxfattribs={"layer": "E-ARMADURA-LONG"})
    # Puntos que representan la armadura transversal (redondos Ø12 cada 15 cm)
    for px in range(int(p_x1 + 60), int(p_x2), 150):
        circle(px, parr_y + 15, 12, layer="E-ARMADURA-LONG")

    # ARMADURAS DEL PILAR (ESPERAS Y ARRANQUE):
    rec_p = 35
    bar_left_x = p_x + rec_p
    bar_right_x = p_x + p_ancho - rec_p
    patilla_anclaje = 300 # patilla horizontal en zapata

    # Barra izquierda con patilla horizontal hacia afuera
    msp.add_lwpolyline([(bar_left_x - patilla_anclaje, parr_y + 30),
                        (bar_left_x, parr_y + 30),
                        (bar_left_x, p_y_bot + p_alto)],
                       close=False, dxfattribs={"layer": "E-ARMADURA-LONG"})
    # Barra derecha con patilla horizontal hacia afuera
    msp.add_lwpolyline([(bar_right_x + patilla_anclaje, parr_y + 30),
                        (bar_right_x, parr_y + 30),
                        (bar_right_x, p_y_bot + p_alto)],
                       close=False, dxfattribs={"layer": "E-ARMADURA-LONG"})

    # Estribos en cuello y pilar:
    # 3 estribos en interior zapata (zona de anclaje)
    for ey in [parr_y + 120, parr_y + 240, parr_y + 360]:
        line((p_x + 15, ey), (p_x + p_ancho - 15, ey), layer="E-ARMADURA-ESTRIBO")
    # Estribos en fuste pilar cada 10 cm (zona confinada) y cada 15 cm
    for ey in range(int(p_y_bot + 100), int(p_y_bot + p_alto), 150):
        line((p_x + 15, ey), (p_x + p_ancho - 15, ey), layer="E-ARMADURA-ESTRIBO")

    # Cotas de detalle D-01
    dimension_h((z_x, z_y), (z_x + z_ancho, z_y), z_y - 250, "1.40 m")
    dimension_h((p_x, p_y_bot + p_alto), (p_x + p_ancho, p_y_bot + p_alto), p_y_bot + p_alto + 200, "0.25 m")
    dimension_v((z_x + z_ancho, z_y), (z_x + z_ancho, z_y + z_canto), z_x + z_ancho + 250, "0.45 m")
    dimension_v((hl_x + hl_ancho, hl_y), (hl_x + hl_ancho, hl_y + hl_esp), hl_x + hl_ancho + 250, "0.10 m")

    # Textos de llamada técnica con flechas indicadoras
    line((z_x + 200, parr_y), (z_x - 300, parr_y - 150), layer="E-TEXTOS")
    text("Parrilla inferior bidireccional Ø12 @ 15 cm B500S (patillas 15 cm)", (z_x - 1400, parr_y - 200), height=110, layer="E-TEXTOS")

    line((bar_right_x, p_y_bot + 800), (bar_right_x + 500, p_y_bot + 1000), layer="E-TEXTOS")
    text("Esperas y armadura longitudinal 4Ø16 B500S", (bar_right_x + 550, p_y_bot + 1000), height=110, layer="E-TEXTOS")

    line((p_x + p_ancho - 15, p_y_bot + 400), (bar_right_x + 500, p_y_bot + 500), layer="E-TEXTOS")
    text("Estribos de atado Ø8 @ 10 cm (arranque)", (bar_right_x + 550, p_y_bot + 500), height=110, layer="E-TEXTOS")

    line((p_x + p_ancho/2, DY1 + 150), (p_x + p_ancho/2 - 400, DY1 + 50), layer="E-TEXTOS")
    text("Fondo de excavación cota -0.90 m | Capacidad terreno s_adm = 1.50 kg/cm²", (p_x - 800, DY1 - 20), height=110, layer="E-TEXTOS")

    # ==========================================
    # 3. DETALLE CONSTRUCTIVO D-02: SECCIÓN TRANSVERSAL PILAR C-1
    # ==========================================
    DX2 = 17500
    DY2 = 6500

    text("DETALLE D-02: SECCIÓN DE PILAR C-1 (ESC 1:10)", (DX2, DY2 + 2200), height=220, layer="E-TITULOS")
    text("PILAR 25x25 cm - HORMIGÓN HA-25 / ACERO B500S", (DX2, DY2 + 1950), height=130, layer="E-TEXTOS")

    # Sección de hormigón (250x250 mm escalada visualmente para claridad x3 = 750 mm)
    sc2 = 3.0 # Factor de escala gráfica para detalle
    sec_w = 250 * sc2 # 750 mm
    sec_h = 250 * sc2
    rect(DX2, DY2 + 500, sec_w, sec_h, layer="E-PILARES")

    # Estribo perimetral (recubrimiento 30 mm * sc2 = 90 mm)
    rec_col = 30 * sc2
    est_x = DX2 + rec_col
    est_y = DY2 + 500 + rec_col
    est_w = sec_w - 2 * rec_col
    est_h = sec_h - 2 * rec_col
    rect(est_x, est_y, est_w, est_h, layer="E-ARMADURA-ESTRIBO")

    # Ganchos sísmicos a 135 grados del estribo en esquina superior izquierda
    line((est_x, est_y + est_h), (est_x + 70, est_y + est_h - 70), layer="E-ARMADURA-ESTRIBO")
    line((est_x + 70, est_y + est_h), (est_x, est_y + est_h - 70), layer="E-ARMADURA-ESTRIBO")

    # 4 Barras de acero Ø16 en esquinas
    r_bar = 16 * sc2 / 2 # radio escalado
    corners = [
        (est_x + r_bar + 10, est_y + r_bar + 10),
        (est_x + est_w - r_bar - 10, est_y + r_bar + 10),
        (est_x + est_w - r_bar - 10, est_y + est_h - r_bar - 10),
        (est_x + r_bar + 10, est_y + est_h - r_bar - 10),
    ]
    for bx, by in corners:
        circle(bx, by, r_bar, layer="E-ARMADURA-LONG")
        # Relleno visual
        circle(bx, by, r_bar/2, layer="E-ARMADURA-LONG")

    # Cotas del pilar C-1
    dimension_h((DX2, DY2 + 500), (DX2 + sec_w, DY2 + 500), DY2 + 350, "250 mm")
    dimension_v((DX2, DY2 + 500), (DX2, DY2 + 500 + sec_h), DX2 - 150, "250 mm")

    # Textos explicativos D-02
    line((corners[2][0], corners[2][1]), (DX2 + sec_w + 300, DY2 + 500 + sec_h + 100), layer="E-TEXTOS")
    text("4 Ø 16 mm B500S (1 en cada esquina)", (DX2 + sec_w + 350, DY2 + 500 + sec_h + 80), height=110, layer="E-TEXTOS")

    line((est_x + est_w, est_y + est_h/2), (DX2 + sec_w + 300, DY2 + 500 + sec_h/2), layer="E-TEXTOS")
    text("Estribo cerrado Ø 8 mm @ 15 cm", (DX2 + sec_w + 350, DY2 + 500 + sec_h/2 - 20), height=110, layer="E-TEXTOS")
    text("(Confinamiento en extremos @ 10 cm)", (DX2 + sec_w + 350, DY2 + 500 + sec_h/2 - 140), height=95, layer="E-TEXTOS")
    text("Recubrimiento nominal r = 30 mm", (DX2 + sec_w + 350, DY2 + 500 + sec_h/2 - 260), height=95, layer="E-TEXTOS")

    # ==========================================
    # 4. DETALLE CONSTRUCTIVO D-03: SECCIÓN DE VIGA RIOSTRA VR-1
    # ==========================================
    DX3 = 22500
    DY3 = 6500

    text("DETALLE D-03: SECCIÓN RIOSTRA VR-1 (ESC 1:15)", (DX3, DY3 + 2200), height=220, layer="E-TITULOS")
    text("VIGA DE ATADO 25x35 cm - CONTROL SÍSMICO Y ASENTAMIENTOS", (DX3, DY3 + 1950), height=130, layer="E-TEXTOS")

    # Sección riostra (250x350 mm escalada x3 = 750x1050 mm)
    vr_w = 250 * sc2
    vr_h = 350 * sc2
    # Hormigón de limpieza base
    rect(DX3 - 50, DY3 + 400, vr_w + 100, 100, layer="E-HORMIGON-LIMPIEZA")
    text("Hormigón limpieza e=10 cm", (DX3 + 50, DY3 + 430), height=75, layer="E-HORMIGON-LIMPIEZA")

    rect(DX3, DY3 + 500, vr_w, vr_h, layer="E-CIMENT-RIOSTRAS")

    # Estribo riostra (recubrimiento 35 mm * sc2 = 105 mm)
    rec_vr = 35 * sc2
    e_vr_x = DX3 + rec_vr
    e_vr_y = DY3 + 500 + rec_vr
    e_vr_w = vr_w - 2 * rec_vr
    e_vr_h = vr_h - 2 * rec_vr
    rect(e_vr_x, e_vr_y, e_vr_w, e_vr_h, layer="E-ARMADURA-ESTRIBO")

    # Armadura longitudinal riostra:
    # 2 Ø12 superior, 2 Ø12 inferior, 2 Ø10 piel
    r12 = 12 * sc2 / 2
    r10 = 10 * sc2 / 2
    # Inferiores
    circle(e_vr_x + r12 + 10, e_vr_y + r12 + 10, r12, layer="E-ARMADURA-LONG")
    circle(e_vr_x + e_vr_w - r12 - 10, e_vr_y + r12 + 10, r12, layer="E-ARMADURA-LONG")
    # Superiores
    circle(e_vr_x + r12 + 10, e_vr_y + e_vr_h - r12 - 10, r12, layer="E-ARMADURA-LONG")
    circle(e_vr_x + e_vr_w - r12 - 10, e_vr_y + e_vr_h - r12 - 10, r12, layer="E-ARMADURA-LONG")
    # Piel a media altura
    circle(e_vr_x + r10 + 10, e_vr_y + e_vr_h/2, r10, layer="E-ARMADURA-LONG")
    circle(e_vr_x + e_vr_w - r10 - 10, e_vr_y + e_vr_h/2, r10, layer="E-ARMADURA-LONG")

    # Cotas riostra
    dimension_h((DX3, DY3 + 500), (DX3 + vr_w, DY3 + 500), DY3 + 350, "250 mm")
    dimension_v((DX3 + vr_w, DY3 + 500), (DX3 + vr_w, DY3 + 500 + vr_h), DX3 + vr_w + 150, "350 mm")

    # Textos explicativos D-03
    line((e_vr_x + e_vr_w - r12, e_vr_y + e_vr_h - r12), (DX3 + vr_w + 400, DY3 + 500 + vr_h - 50), layer="E-TEXTOS")
    text("Arm. Superior: 2 Ø 12 mm B500S", (DX3 + vr_w + 450, DY3 + 500 + vr_h - 70), height=110, layer="E-TEXTOS")

    line((e_vr_x + e_vr_w - r10, e_vr_y + e_vr_h/2), (DX3 + vr_w + 400, DY3 + 500 + vr_h/2), layer="E-TEXTOS")
    text("Arm. Piel: 2 Ø 10 mm B500S", (DX3 + vr_w + 450, DY3 + 500 + vr_h/2 - 20), height=110, layer="E-TEXTOS")

    line((e_vr_x + e_vr_w - r12, e_vr_y + r12), (DX3 + vr_w + 400, DY3 + 500 + 100), layer="E-TEXTOS")
    text("Arm. Inferior: 2 Ø 12 mm B500S", (DX3 + vr_w + 450, DY3 + 500 + 80), height=110, layer="E-TEXTOS")

    line((e_vr_x + e_vr_w/2, e_vr_y), (DX3 + vr_w + 400, DY3 + 350), layer="E-TEXTOS")
    text("Estribos: Ø 8 mm @ 15 cm", (DX3 + vr_w + 450, DY3 + 330), height=110, layer="E-TEXTOS")

    # ==========================================
    # 5. TABLAS TÉCNICAS (CUADROS ESTRUCTURALES)
    # ==========================================
    TX = 2500
    TY = 1500

    text("CUADROS TÉCNICOS DE ESPECIFICACIONES ESTRUCTURALES", (TX, TY + 5200), height=240, layer="E-TITULOS")

    # TABLA 1: CUADRO DE ZAPATAS
    t1_y = TY + 3400
    text("CUADRO DE ZAPATAS AISLADAS", (TX, t1_y + 1400), height=180, layer="E-TITULOS")
    # Marco de tabla 1 (Ancho 6800, Alto 1200)
    rect(TX, t1_y, 6800, 1200, layer="E-TABLAS")
    # Filas
    line((TX, t1_y + 800), (TX + 6800, t1_y + 800), layer="E-TABLAS")
    line((TX, t1_y + 550), (TX + 6800, t1_y + 550), layer="E-TABLAS")
    line((TX, t1_y + 300), (TX + 6800, t1_y + 300), layer="E-TABLAS")
    # Columnas
    cols1 = [0, 1200, 2400, 3400, 5100, 6800]
    for c in cols1[1:-1]:
        line((TX + c, t1_y), (TX + c, t1_y + 1200), layer="E-TABLAS")

    # Encabezados
    headers1 = ["TIPO", "DIMENSIÓN (m)", "CANTO (m)", "PARRILLA INF. (X)", "PARRILLA INF. (Y)"]
    for i, h in enumerate(headers1):
        cx = TX + (cols1[i] + cols1[i+1])/2
        text(h, (cx, t1_y + 950), height=110, layer="E-TABLAS", align="CENTER")

    # Fila Z-1
    row_z1 = ["Z-1 (Central)", "1.40 x 1.40", "0.45", "Ø 12 @ 15 cm B500S", "Ø 12 @ 15 cm B500S"]
    for i, val in enumerate(row_z1):
        cx = TX + (cols1[i] + cols1[i+1])/2
        text(val, (cx, t1_y + 650), height=100, layer="E-TEXTOS", align="CENTER")

    # Fila Z-2
    row_z2 = ["Z-2 (Perímetro)", "1.20 x 1.20", "0.40", "Ø 12 @ 15 cm B500S", "Ø 12 @ 15 cm B500S"]
    for i, val in enumerate(row_z2):
        cx = TX + (cols1[i] + cols1[i+1])/2
        text(val, (cx, t1_y + 400), height=100, layer="E-TEXTOS", align="CENTER")

    # Fila Z-3
    row_z3 = ["Z-3 (Esquinas)", "1.00 x 1.00", "0.35", "Ø 10 @ 15 cm B500S", "Ø 10 @ 15 cm B500S"]
    for i, val in enumerate(row_z3):
        cx = TX + (cols1[i] + cols1[i+1])/2
        text(val, (cx, t1_y + 120), height=100, layer="E-TEXTOS", align="CENTER")

    # TABLA 2: CUADRO DE PILARES Y RIOSTRAS
    t2_y = TY + 1400
    text("CUADRO DE ELEMENTOS ESTRUCTURALES", (TX, t2_y + 1400), height=180, layer="E-TITULOS")
    rect(TX, t2_y, 6800, 1200, layer="E-TABLAS")
    line((TX, t2_y + 800), (TX + 6800, t2_y + 800), layer="E-TABLAS")
    line((TX, t2_y + 400), (TX + 6800, t2_y + 400), layer="E-TABLAS")
    cols2 = [0, 1200, 2400, 4600, 6800]
    for c in cols2[1:-1]:
        line((TX + c, t2_y), (TX + c, t2_y + 1200), layer="E-TABLAS")

    headers2 = ["ELEMENTO", "SECCIÓN", "ARMADURA PRINCIPAL", "ARMADURA TRANSVERSAL"]
    for i, h in enumerate(headers2):
        cx = TX + (cols2[i] + cols2[i+1])/2
        text(h, (cx, t2_y + 950), height=110, layer="E-TABLAS", align="CENTER")

    row_c1 = ["Pilar C-1", "25 x 25 cm", "4 Ø 16 mm B500S (Esquinas)", "Cercos Ø 8 @ 15 cm (Conf. @ 10 cm)"]
    for i, val in enumerate(row_c1):
        cx = TX + (cols2[i] + cols2[i+1])/2
        text(val, (cx, t2_y + 550), height=100, layer="E-TEXTOS", align="CENTER")

    row_vr1 = ["Riostra VR-1", "25 x 35 cm", "2Ø12 sup + 2Ø12 inf + 2Ø10 piel", "Estribos cerrados Ø 8 @ 15 cm"]
    for i, val in enumerate(row_vr1):
        cx = TX + (cols2[i] + cols2[i+1])/2
        text(val, (cx, t2_y + 150), height=100, layer="E-TEXTOS", align="CENTER")

    # TABLA 3: MATERIALES Y CONDICIONES GEOTÉCNICAS
    t3_x = TX + 7400
    t3_y = TY + 1400
    text("BASES DE CÁLCULO Y ESPECIFICACIONES DE MATERIALES", (t3_x, t3_y + 3400), height=180, layer="E-TITULOS")
    rect(t3_x, t3_y, 6500, 3200, layer="E-TABLAS")
    line((t3_x, t3_y + 2700), (t3_x + 6500, t3_y + 2700), layer="E-TABLAS")
    text("PARÁMETRO", (t3_x + 1500, t3_y + 2850), height=120, layer="E-TABLAS", align="CENTER")
    text("VALOR ADOPTADO / NORMATIVA", (t3_x + 4500, t3_y + 2850), height=120, layer="E-TABLAS", align="CENTER")
    line((t3_x + 3000, t3_y), (t3_x + 3000, t3_y + 3200), layer="E-TABLAS")

    mat_rows = [
        ("Hormigón Estructural (Cimentación)", "HA-25 / f'c = 210 kg/cm² (21 MPa)"),
        ("Hormigón en Pilares y Riostras", "HA-25 / f'c = 210 kg/cm² (21 MPa)"),
        ("Hormigón de Limpieza (Base)", "HL-150 / f'c = 100 kg/cm² (e = 10 cm)"),
        ("Acero en Barras Corrugadas", "B500S / Grado 60 (fy = 5000 kg/cm²)"),
        ("Mallazo Electrosoldado (Solera)", "ME 15x15 d=6 mm B500T (Solera e=15 cm)"),
        ("Tensión Admisible del Terreno", "s_adm = 1.50 kg/cm² (0.15 MPa)"),
        ("Profundidad Mínima Cimentación", "-0.90 m respecto a cota solera (+0.00)"),
        ("Recubrimiento Cimentación", "r_nom = 50 mm (contacto terreno)"),
        ("Recubrimiento Pilares y Riostras", "r_nom = 30 mm"),
        ("Normativa de Diseño Sísmico", "CTE-DB-SE-C / EHE-08 / ACI 318-19"),
    ]

    for idx, (param, val) in enumerate(mat_rows):
        ry = t3_y + 2700 - (idx + 1) * 270
        line((t3_x, ry), (t3_x + 6500, ry), layer="E-TABLAS")
        text(param, (t3_x + 120, ry + 70), height=95, layer="E-TEXTOS")
        text(val, (t3_x + 3120, ry + 70), height=95, layer="E-TEXTOS")

    # ==========================================
    # 6. CAJETÍN / CARÁTULA OFICIAL DE PROYECTO
    # ==========================================
    CX = 17500
    CY = 1400
    CW = 9500
    CH = 3800

    rect(CX, CY, CW, CH, layer="E-CAJETIN")
    # Divisiones cajetín
    line((CX, CY + 2600), (CX + CW, CY + 2600), layer="E-CAJETIN")
    line((CX, CY + 1400), (CX + CW, CY + 1400), layer="E-CAJETIN")
    line((CX + 5500, CY), (CX + 5500, CY + 2600), layer="E-CAJETIN")

    # Bloque 1: Título Proyecto
    text("PROYECTO DE ESTRUCTURAS - EDIFICACIÓN RESIDENCIAL", (CX + 300, CY + 3300), height=180, layer="E-TITULOS")
    text("VIVIENDA UNIFAMILIAR AISLADA DE 1 PLANTA (11.75 x 7.00 m)", (CX + 300, CY + 2950), height=140, layer="E-TEXTOS")
    text("PROGRAMA: 3 DORMITORIOS, 2 BAÑOS, SALÓN-COMEDOR, COCINA, PORCHE Y DIRTY KITCHEN", (CX + 300, CY + 2700), height=95, layer="E-TEXTOS")

    # Bloque 2: Nombre del Plano
    text("PLANO:", (CX + 300, CY + 2250), height=110, layer="E-TEXTOS")
    text("REPLANTEO DE EJES, PLANTA DE CIMENTACIÓN,", (CX + 300, CY + 1950), height=160, layer="E-TITULOS")
    text("CUADRO DE PILARES Y DETALLES DE ARMADURAS 2D", (CX + 300, CY + 1650), height=160, layer="E-TITULOS")

    # Bloque 3: Datos Técnicos
    text("ESCALAS: 1:50 (Planta) | 1:20 / 1:15 / 1:10 (Detalles)", (CX + 300, CY + 1050), height=110, layer="E-TEXTOS")
    text("FORMATO ORIGINAL: DWG / DXF R2018 (AutoCAD Compatible)", (CX + 300, CY + 750), height=100, layer="E-TEXTOS")
    text("UNIDADES: Milímetros (mm) | SISTEMA: Métrico", (CX + 300, CY + 450), height=100, layer="E-TEXTOS")
    text("FECHA: 22/11/2026", (CX + 300, CY + 150), height=100, layer="E-TEXTOS")

    # Bloque 4: Número de Plano y Estado
    text("Nº DE PLANO:", (CX + 5800, CY + 2150), height=120, layer="E-TEXTOS")
    text("EST-01", (CX + 7500, CY + 1750), height=380, layer="E-TITULOS", align="CENTER")
    line((CX + 5500, CY + 1200), (CX + CW, CY + 1200), layer="E-CAJETIN")
    text("ESTADO: DEFINITIVO PARA CONSTRUCCIÓN", (CX + 5800, CY + 750), height=120, layer="E-TEXTOS")
    text("APROBADO PARA EJECUCIÓN", (CX + 5800, CY + 350), height=110, layer="E-TITULOS")

    # ==========================================
    # 7. MARCO GENERAL DE LA LÁMINA (A0 EXPANDIDO)
    # ==========================================
    LX = 1000
    LY = 500
    LW = 26500
    LH = 20000
    # Marco exterior
    rect(LX, LY, LW, LH, layer="E-BORDE")
    # Marco interior (margen 200 mm)
    rect(LX + 200, LY + 200, LW - 400, LH - 400, layer="E-BORDE")

    # Guardar DXF
    dxf_path = "cad-output/plano_estructural_2d.dxf"
    doc.saveas(dxf_path)
    print(f"DXF guardado correctamente en: {dxf_path}")

    # ==========================================
    # 8. RENDERIZADO GRÁFICO PREVIEW (PNG)
    # ==========================================
    png_path = "cad-output/plano_estructural_2d_preview.png"
    fig = plt.figure(figsize=(24, 16), dpi=180)
    ax = fig.add_axes([0, 0, 1, 1])
    ctx = RenderContext(doc)
    out = MatplotlibBackend(ax)
    Frontend(ctx, out).draw_layout(msp, finalize=True)
    fig.savefig(png_path, facecolor="#1e1e1e", edgecolor="none")
    plt.close(fig)
    print(f"Preview PNG renderizado correctamente en: {png_path}")

if __name__ == "__main__":
    crear_plano_estructural()
