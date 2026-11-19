# Ayne em duas luzes

Site feito pelo Gustavo pra Ayne, com as nossas fotos.

## O conceito

Quase toda foto daqui está sob uma de duas luzes: a **âmbar** das noites (poste,
luz de teto do carro, tela do celular) e a **cobalto** de um dia de praia. Medindo
as fotos, as da noite são quentes e escuras; as da praia, frias e claras. A
**flor amarela**, que aparece em quatro fotos, é a ponte entre as duas: a cor dela
(`#e6b42c`, medida nos pixels) é o acento do site inteiro.

A página atravessa as duas luzes enquanto ela rola, como um dia passando:
noite → céu azul → noite de novo, com crepúsculos e amanheceres no meio.

| Token | Cor | De onde veio |
|---|---|---|
| noite | `#0d0a08` | o preto quente do carro e do cinema |
| âmbar | `#e9a85a` | a luz de teto do carro |
| flor | `#e6b42c` | a flor amarela |
| céu | `#2f66b8` | o céu do mirante |
| papel | `#f4efe6` | a carta |
| tinta | `#0f1620` | o azul-marinho das sombras do retrovisor |

Tipografia: **Instrument Serif** (títulos), **Hanken Grotesk** (texto) e
**DM Mono** (numeração). As três ficam em `assets/fonts/`, com licença OFL.

## O que tem

1. **Abertura:** uma luz no escuro; ao tocar em *Abrir*, ela vira uma íris e revela o céu.
2. **Hero:** ela no mirante; no computador, o fundo continua o céu da foto.
3. **Prólogo e sumário**, no crepúsculo.
4. **I · Luz de poste**, **II · Flor amarela** (o zoom que começa na flor),
   **III · Céu azul** e **IV · Do seu jeito** (com o vídeo da dança).
5. **Momentos:** cartões que mostram um detalhe; ao tocar, a foto inteira em tela cheia.
6. **Uma carta:** envelope com selo de cera, papel com dobras, texto que aparece aos poucos.
7. **Pequeno inventário:** detalhes recortados das fotos que viram e mostram uma mensagem.
8. **Arquivo:** todas as fotos, com visor em tela cheia (setas, teclado, deslizar o dedo).
9. **Epílogo:** os dois no mesmo mirante do começo; depois a noite cai e sobra a luz.
10. **Segredos** espalhados pelo site (veja `segredos` em `js/content.js`).

## Personalizar

**Tudo o que está escrito mora em `js/content.js`:** nome, datas, frases, legendas,
a carta, as mensagens, a música e os segredos. Não precisa mexer em mais nada.

- `{nome}` e `{de}` viram os nomes; `*palavra*` fica em itálico.
- Para trocar uma foto, mude o campo `arquivo` em `fotos`.
- A ordem das fotos de cada capítulo está em `capitulos.*.fotos`.

## Fotos e vídeo

As fotos ficam em `assets/fotos/` e vão junto no repositório, que por isso
precisa ficar **privado**. Nomes usados:

```
praia-mirante.jpg  carro-noite.jpg  hamburguer-1.jpg  hamburguer-2.jpg  chamada.jpg
flor-na-mao.jpg  flor-no-braco.jpg  flor-no-cabelo.jpg  praia-mar.jpg  praia-trilha.jpg
praia-gustavo.jpg  look-1.jpg  look-2.jpg  danca.mp4  cinema.jpg  uno.jpg  drinks.jpg
sinuca.jpg  espelho.jpg  escada-rolante.jpg  praia-nos-dois.jpg  selfie.jpg
```

Depois de colocar ou trocar fotos, gere as versões leves (WebP em dois tamanhos,
miniatura borrada para o carregamento e o vídeo comprimido):

```bash
python3 tools/otimizar_fotos.py
```

Precisa do Pillow (`pip install pillow`); o `ffmpeg` é opcional, só para o vídeo.
Sem rodar o script o site funciona do mesmo jeito, só que mais pesado.

## Música

1. Coloque o arquivo em `assets/music/` (por exemplo `nossa-musica.mp3`).
2. Em `js/content.js`, preencha `musica.arquivo` com `'assets/music/nossa-musica.mp3'`.

A música só começa depois que ela tocar em *Abrir* com o som ligado, com volume
suave e um botão discreto no canto para pausar. Quando o vídeo toca com som, a
música espera.

## Publicar com um link

O repositório é privado, e no plano gratuito o GitHub Pages só publica
repositório público. O caminho grátis é o **Cloudflare Pages**, que aceita
repositório privado:

1. Em dash.cloudflare.com, abra **Workers & Pages → Create → Pages** e conecte
   o GitHub, dando acesso a este repositório.
2. Configure:
   - **Production branch:** o branch onde está o site novo
     (`claude/relaxed-brahmagupta-qoaib2`; o padrão do repositório ainda é o do
     site antigo)
   - **Framework preset:** None
   - **Build command:** `exit 0`
   - **Build output directory:** em branco
3. **Save and Deploy.** O endereço fica parecido com `nome-do-projeto.pages.dev`.

O site abre para quem tiver o link e não aparece no Google (por causa do
`noindex`). As fotos continuam privadas no GitHub.

## Ver no computador

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Técnico

HTML, CSS e JavaScript puros, sem dependências.

```
index.html
css/style.css
js/content.js        conteúdo editável
js/main.js           fotos, abertura, topo, sumário, música, contador
js/animations.js     rolagem, revelações, paralaxe, zoom da flor, cursor
js/gallery.js        visor em tela cheia, momentos e arquivo
js/interactions.js   carta, inventário, vídeo e segredos
tools/otimizar_fotos.py
assets/fotos/  assets/music/  assets/fonts/
```

Respeita a opção do sistema de reduzir movimento, funciona só com teclado e tem
textos alternativos em todas as fotos. A página tem `noindex` para não aparecer
no Google; se quiser que apareça, apague a linha `robots` no `index.html`.
