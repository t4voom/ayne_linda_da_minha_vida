#!/usr/bin/env python3
"""
Otimiza as fotos e vídeos de assets/fotos/ para o site.

Uso (na raiz do projeto):
    python3 tools/otimizar_fotos.py

O que faz:
  - Para cada .jpg/.jpeg/.png/.webp em assets/fotos/:
      * gera assets/fotos/otimizadas/<nome>-480.webp e <nome>-<largura>.webp
        (a maior versão nunca passa da largura original)
      * calcula a cor média e um tom escuro para o fundo da galeria
      * cria uma miniatura borrada (LQIP) para o carregamento progressivo
  - Para cada .mp4/.mov em assets/fotos/ (precisa do ffmpeg instalado):
      * gera um .mp4 menor, pronto para streaming, e uma capa .webp
  - Escreve tudo em assets/fotos/otimizadas/manifesto.js

O site funciona mesmo sem rodar este script (usa os arquivos originais),
mas fica mais leve e carrega mais bonito com ele.

Requer: Pillow (pip install pillow). O ffmpeg é opcional (só para vídeos).
"""
import base64
import colorsys
import io
import json
import shutil
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image, ImageFilter, ImageOps
except ImportError:
    sys.exit("Instale o Pillow primeiro:  pip install pillow")

RAIZ = Path(__file__).resolve().parent.parent
PASTA = RAIZ / "assets" / "fotos"
SAIDA = PASTA / "otimizadas"
LARGURAS = (480, 960)
QUALIDADE = 82
IMAGENS = {".jpg", ".jpeg", ".png", ".webp"}
VIDEOS = {".mp4", ".mov", ".m4v"}


def hexa(rgb):
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(c))) for c in rgb)


def cores(img):
    """Cor média da foto e um tom bem escuro da mesma família (fundo da galeria)."""
    dados = img.convert("RGB").resize((32, 32), Image.LANCZOS).tobytes()
    n = len(dados) // 3
    media = [sum(dados[i::3]) / n for i in range(3)]
    h, l, s = colorsys.rgb_to_hls(*(c / 255 for c in media))
    r, g, b = colorsys.hls_to_rgb(h, 0.085, min(s, 0.42))
    return hexa(media), hexa((r * 255, g * 255, b * 255))


def lqip(img):
    mini = img.convert("RGB").copy()
    mini.thumbnail((24, 24), Image.LANCZOS)
    mini = mini.filter(ImageFilter.GaussianBlur(0.6))
    buf = io.BytesIO()
    mini.save(buf, "WEBP", quality=45, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


def otimizar_imagem(arq):
    img = ImageOps.exif_transpose(Image.open(arq)).convert("RGB")
    w, h = img.size
    fontes = []
    larguras = sorted({min(l, w) for l in LARGURAS})
    for lw in larguras:
        destino = SAIDA / f"{arq.stem}-{lw}.webp"
        copia = img if lw == w else img.resize((lw, round(h * lw / w)), Image.LANCZOS)
        copia.save(destino, "WEBP", quality=QUALIDADE, method=6)  # salva sem metadados
        fontes.append([destino.relative_to(RAIZ).as_posix(), lw])
    cor, fundo = cores(img)
    return {"w": w, "h": h, "cor": cor, "fundo": fundo, "lqip": lqip(img), "src": fontes}


def otimizar_video(arq):
    if not shutil.which("ffmpeg"):
        print(f"  (ffmpeg não encontrado: {arq.name} fica como está)")
        return None
    destino = SAIDA / f"{arq.stem}.mp4"
    capa = SAIDA / f"{arq.stem}-capa.jpg"
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", str(arq),
        "-map_metadata", "-1",
        "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", str(destino),
    ], check=True)
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-ss", "2", "-i", str(arq),
        "-frames:v", "1", "-q:v", "3", str(capa),
    ], check=True)
    img = Image.open(capa).convert("RGB")
    w, h = img.size
    capa_webp = SAIDA / f"{arq.stem}-capa.webp"
    img.save(capa_webp, "WEBP", quality=QUALIDADE, method=6)
    capa.unlink()
    cor, fundo = cores(img)
    return {
        "w": w, "h": h, "cor": cor, "fundo": fundo, "lqip": lqip(img),
        "video": destino.relative_to(RAIZ).as_posix(),
        "capa": capa_webp.relative_to(RAIZ).as_posix(),
    }


def main():
    if not PASTA.exists():
        sys.exit(f"Pasta não encontrada: {PASTA}")
    SAIDA.mkdir(exist_ok=True)
    manifesto = {}
    for arq in sorted(PASTA.iterdir()):
        ext = arq.suffix.lower()
        chave = arq.relative_to(RAIZ).as_posix()
        if ext in IMAGENS:
            manifesto[chave] = otimizar_imagem(arq)
            print(f"  foto   {arq.name}")
        elif ext in VIDEOS:
            dados = otimizar_video(arq)
            if dados:
                manifesto[chave] = dados
                print(f"  vídeo  {arq.name}")
    js = (
        "/* Gerado por tools/otimizar_fotos.py — não edite à mão. */\n"
        "window.FOTOS_OTIMIZADAS = "
        + json.dumps(manifesto, ensure_ascii=False, indent=1)
        + ";\n"
    )
    (SAIDA / "manifesto.js").write_text(js, encoding="utf-8")
    total = sum(f.stat().st_size for f in SAIDA.iterdir())
    print(f"\n{len(manifesto)} arquivos otimizados · {total / 1024 / 1024:.1f} MB em {SAIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
