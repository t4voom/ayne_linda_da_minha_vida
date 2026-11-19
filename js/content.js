/* ==========================================================================
   CONTEÚDO DO SITE — edite aqui
   --------------------------------------------------------------------------
   Tudo o que aparece escrito no site mora neste arquivo: nome, datas, frases,
   legendas, a carta, a música e os segredos. Não precisa mexer em mais nada.

   Pequenos truques nos textos:
     {nome}   vira o nome dela        {de}     vira o seu nome
     {dias}   vira os dias desde a data de início
     *assim*  deixa a palavra em itálico
     \n       quebra a linha

   Para trocar uma foto: coloque o arquivo em assets/fotos/ e mude o campo
   "arquivo" lá embaixo, em FOTOS. Para deixar o site mais leve, rode depois:
     python3 tools/otimizar_fotos.py
   ========================================================================== */

window.CONTEUDO = {

  nome: 'Ayne',
  de: 'Gustavo',

  /* Data de início. Use null nos dois campos para esconder o contador. */
  inicio: {
    data: '2026-11-11',            // ano-mês-dia
    texto: '11 · 11 · 2026'
  },

  /* ---------- 3.1 Abertura ---------- */
  abertura: {
    saudacoes: {                   // muda conforme a hora em que ela abrir
      madrugada: 'Ainda acordada, {nome}?',
      manha: 'Bom dia, {nome}',
      tarde: 'Boa tarde, {nome}',
      noite: 'Boa noite, {nome}'
    },
    frase: 'Toda fotografia é um pouco de luz guardada.',
    complemento: 'Estas guardaram *você*.',
    botao: 'Abrir',
    comSom: 'com som',
    semSom: 'sem som',
    carregando: 'acendendo a luz'
  },

  /* ---------- 3.2 Hero ---------- */
  hero: {
    foto: 'praia-mirante',
    rotulo: 'Para {nome}, de {de}',
    subtitulo: 'em duas *luzes*',
    rolar: 'role devagar'
  },

  /* ---------- Prólogo + sumário ---------- */
  prologo: {
    rotulo: 'Prólogo',
    texto: 'Juntei aqui as nossas fotos. Umas de noite, com luz de poste e luz de teto de carro. Outras de dia, com o céu inteiro *azul*.',
    sumario: 'Sumário'
  },

  /* ---------- 3.3 Uma história em fotografias ----------
     "fotos" usa os nomes da lista FOTOS lá embaixo. A ordem importa:
     cada posição tem um lugar pensado no layout. */
  capitulos: {
    luz: {
      numero: 'I',
      rotulo: 'Capítulo um',
      titulo: 'Luz de *poste*',
      texto: 'Lanche no banco do carro, a luz de teto acesa, a cidade quieta do lado de fora.',
      citacao: 'E quando não dá pra estar junto, a noite acontece por *chamada de vídeo*.',
      fotos: ['carro-noite', 'hamburguer-1', 'hamburguer-2', 'chamada']
    },
    flor: {
      numero: 'II',
      rotulo: 'Capítulo dois',
      titulo: 'Flor *amarela*',
      texto: 'Pequena, de um amarelo quase laranja no meio.',
      zoom1: 'Uma flor amarela',
      zoom2: 'aparece em *quatro* destas fotografias.',
      nota: 'Na mão, entre os dedos, no cabelo e no caminho da trilha.',
      fotos: ['flor-na-mao', 'flor-no-braco', 'flor-no-cabelo']
    },
    ceu: {
      numero: 'III',
      rotulo: 'Capítulo três',
      passagem: 'e então, o dia',
      titulo: 'Céu *azul*',
      texto: 'Um dia de mirante, de trilha e de mar aberto.',
      citacao: 'Lá de cima, a praia inteira cabia numa *foto só*.',
      fotos: ['praia-mar', 'praia-trilha', 'praia-gustavo']
    },
    jeito: {
      numero: 'IV',
      rotulo: 'Capítulo quatro',
      passagem: 'e a noite de novo',
      titulo: 'Do seu *jeito*',
      texto: 'Óculos escuros, canga, meia verde e uma pose de quem sabe exatamente o que está fazendo.',
      ouvir: 'ouvir',
      silenciar: 'silenciar',
      fotos: ['look-2', 'look-1', 'danca']
    }
  },

  /* ---------- 3.4 Momentos especiais ----------
     foco = ponto da foto mostrado no cartão (horizontal vertical)
     zoom = quanto o cartão aproxima esse ponto (1 = foto inteira) */
  momentos: {
    rotulo: 'Por aí',
    titulo: '*Momentos*',
    texto: 'Seis cenas de rolê, vistas de perto. Toque em uma pra ver inteira.',
    itens: [
      { foto: 'cinema',         titulo: 'A sessão',        foco: '45% 49%', zoom: 1.7 },
      { foto: 'uno',            titulo: 'O +4',            foco: '74% 55%', zoom: 2.3 },
      { foto: 'drinks',         titulo: 'O brinde',        foco: '24% 41%', zoom: 1.9 },
      { foto: 'sinuca',         titulo: 'A mesa vermelha', foco: '30% 76%', zoom: 1.6 },
      { foto: 'espelho',        titulo: 'O espelho',       foco: '33% 58%', zoom: 1.8 },
      { foto: 'escada-rolante', titulo: 'As flores',       foco: '40% 52%', zoom: 2.4 }
    ]
  },

  /* ---------- 3.5 A carta ----------
     Escreva do jeito que quiser. Linhas em branco separam os parágrafos. */
  carta: {
    rotulo: 'Para ler com calma',
    titulo: 'Uma *carta*',
    envelope: 'Para {nome}',
    instrucao: 'toque no selo para abrir',
    data: 'novembro de 2026',
    texto: `{nome},

estou gostando muito de você, e só quero que saiba disso.

Gosto de sair com você, de ficar com você.

Tenha certeza que eu vou fazer de tudo pra dar certo com você.`,
    assinatura: 'com carinho, {de}',
    reler: 'ler de novo'
  },

  /* ---------- 3.6 Detalhes que fazem a diferença ---------- */
  inventario: {
    rotulo: 'Detalhes',
    titulo: 'Pequeno *inventário*',
    texto: 'Coisas que me fazem lembrar de você. Toque em cada uma.',
    itens: [
      { foto: 'flor-na-mao',   foco: '42% 46%', zoom: 4.2, nome: 'A flor amarela',        mensagem: 'Está em quatro fotos deste site. Repara.' },
      { foto: 'flor-na-mao',   foco: '36% 83%', zoom: 3.2, nome: 'A pulseira de miçangas', mensagem: 'Colorida, com uma conchinha no meio.' },
      { foto: 'flor-na-mao',   foco: '85% 19%', zoom: 3.0, nome: 'A luz de poste',         mensagem: 'A primeira luz deste site.' },
      { foto: 'hamburguer-1',  foco: '56% 69%', zoom: 2.6, nome: 'O lanche no carro',      mensagem: 'Melhor restaurante: banco do carro.' },
      { foto: 'look-2',        foco: '41% 14%', zoom: 3.4, nome: 'Os óculos escuros',      mensagem: 'Acessório oficial das poses.' },
      { foto: 'look-2',        foco: '53% 87%', zoom: 3.0, nome: 'A meia verde',           mensagem: 'A de um olho só. Ninguém usaria tão bem.' },
      { foto: 'drinks',        foco: '24% 40%', zoom: 2.6, nome: 'O drink rosa',           mensagem: 'Taça, gelo e uma rodela de limão.' },
      { foto: 'praia-mirante', foco: '55% 16%', zoom: 2.0, nome: 'O azul do mirante',      mensagem: 'E a segunda luz.' }
    ]
  },

  /* ---------- 3.7 Galeria (arquivo) ----------
     {fotos} e {videos} são contados automaticamente. */
  arquivo: {
    rotulo: 'Todas as fotos',
    titulo: '*Arquivo*',
    texto: '{fotos} fotografias e {videos} vídeo. Toque em qualquer uma para ver em tela cheia.',
    nota: 'Faltou uma. Ela está escondida em algum lugar deste site.',
    ordem: [
      'praia-mirante', 'carro-noite', 'hamburguer-1', 'hamburguer-2', 'chamada',
      'flor-na-mao', 'flor-no-braco', 'flor-no-cabelo', 'praia-mar', 'praia-trilha',
      'praia-gustavo', 'look-2', 'look-1', 'danca', 'cinema', 'uno', 'drinks',
      'sinuca', 'espelho', 'escada-rolante', 'praia-nos-dois'
    ]
  },

  /* ---------- 3.9 Encerramento ---------- */
  fim: {
    foto: 'praia-nos-dois',
    frase: 'Isso é só o *começo*.',
    assinatura: '{de}',
    dicaLuz: 'toque na luz',
    ps: 'P.S.: não é data especial nenhuma. Fiz isso só porque sim.',
    creditos: 'Feito à mão por {de}, para {nome}. Novembro de 2026.',
    voltar: 'voltar ao começo'
  },

  /* ---------- 5. Música ----------
     1. Coloque o arquivo em assets/music/ (por exemplo nossa-musica.mp3)
     2. Escreva o caminho em "arquivo":  arquivo: 'assets/music/nossa-musica.mp3'
     A música só toca depois que ela tocar em "Abrir" com o som ligado.
     Com "arquivo" vazio, o botão de som simplesmente não aparece. */
  musica: {
    arquivo: '',
    titulo: 'Pra Sempre Com Você',
    artista: 'Jorge & Mateus',
    rotulo: 'a nossa música',
    volume: 0.5,                   // de 0 a 1
    links: [
      { nome: 'Spotify', url: 'https://open.spotify.com/search/Pra%20Sempre%20Com%20Voc%C3%AA%20Jorge%20e%20Mateus' },
      { nome: 'YouTube Music', url: 'https://music.youtube.com/search?q=Pra+Sempre+Com+Voc%C3%AA+Ao+Vivo+Jorge+e+Mateus' }
    ]
  },

  /* ---------- 3.8 Segredos ---------- */
  segredos: {
    flores: {
      achou: 'Uma flor escondida. Faltam {faltam}.',
      todas: 'As três flores. Esta foto estava guardada pra você.',
      foto: 'selfie',
      legenda: 'A foto escondida. A única que não está no arquivo.'
    },
    coracao: 'Achou. Esse coraçãozinho é seu.',
    digitar: {
      palavra: 'ayne',             // digitar isso no teclado faz chover flor
      mensagem: 'Você digitou o próprio nome. Choveu flor.'
    },
    toqueLongo: 'Segurou no nome? Choveu flor.',   // no celular: segurar o dedo no nome
    console: 'Oi, curiosa. Tem três flores escondidas neste site.'
  },

  /* ---------- Opções ---------- */
  opcoes: {
    rolagemSuave: true             // rolagem com inércia no computador
  },

  /* ==========================================================================
     FOTOS
     arquivo  = caminho do arquivo
     alt      = descrição para leitores de tela
     legenda  = texto que aparece embaixo da foto
     foco     = ponto que nunca pode ser cortado (horizontal vertical)
     ========================================================================== */
  fotos: {
    'praia-mirante':  { arquivo: 'assets/fotos/praia-mirante.jpg',  foco: '72% 60%', alt: '{nome} de costas no mirante de madeira, olhando a enseada e o morro sob um céu muito azul.', legenda: 'O mirante. Céu azul de ponta a ponta.' },
    'carro-noite':    { arquivo: 'assets/fotos/carro-noite.jpg',    foco: '50% 45%', alt: 'Dentro do carro, à noite, com a luz de teto acesa e a rua arborizada pelo para-brisa.', legenda: 'Luz de teto acesa, a rua quieta lá fora.' },
    'hamburguer-1':   { arquivo: 'assets/fotos/hamburguer-1.jpg',   foco: '56% 66%', alt: 'Mão segurando um hambúrguer com gergelim dentro do carro, com o painel aceso.', legenda: 'Jantar no banco do carro.' },
    'hamburguer-2':   { arquivo: 'assets/fotos/hamburguer-2.jpg',   foco: '42% 66%', alt: 'O mesmo hambúrguer de outro ângulo, com o volante e a rua iluminada ao fundo.', legenda: 'Segunda mordida, mesma noite.' },
    'chamada':        { arquivo: 'assets/fotos/chamada.jpg',        foco: '55% 55%', alt: 'Chamada de vídeo no escuro: {nome} deitada mexendo no cabelo e {de} no quadradinho do canto.', legenda: 'Chamada de vídeo, luz apagada.' },
    'flor-na-mao':    { arquivo: 'assets/fotos/flor-na-mao.jpg',    foco: '42% 46%', alt: 'Mão com unhas rosadas e pulseira de miçangas segurando uma florzinha amarela num parque, à noite.', legenda: 'Uma flor amarela, à noite.' },
    'flor-no-braco':  { arquivo: 'assets/fotos/flor-no-braco.jpg',  foco: '50% 30%', alt: 'Braço estendido com a flor amarela entre os dedos, visto de cima, sobre o asfalto molhado com pétalas caídas.', legenda: 'A mesma flor, vista de cima.' },
    'flor-no-cabelo': { arquivo: 'assets/fotos/flor-no-cabelo.jpg', foco: '75% 45%', alt: '{nome} refletida no retrovisor do carro, tirando uma selfie, com uma flor amarela no cabelo.', legenda: 'Retrovisor, selfie e flor no cabelo.' },
    'praia-mar':      { arquivo: 'assets/fotos/praia-mar.jpg',      foco: '35% 62%', alt: '{nome} de costas no fim de uma trilha, de frente para o mar aberto entre dois morros.', legenda: 'O fim da trilha: o mar inteiro.' },
    'praia-trilha':   { arquivo: 'assets/fotos/praia-trilha.jpg',   foco: '70% 62%', alt: '{nome} na trilha, no meio do mato, olhando a enseada e a cidade lá embaixo.', legenda: 'No meio do mato, a enseada inteira.' },
    'praia-gustavo':  { arquivo: 'assets/fotos/praia-gustavo.jpg',  foco: '38% 62%', alt: '{de} de costas no mirante de madeira, olhando o mar e o morro.', legenda: 'Agora quem olha o mar sou eu.' },
    'look-2':         { arquivo: 'assets/fotos/look-2.jpg',         foco: '45% 40%', alt: '{nome} fazendo pose com as mãos na cintura, de óculos escuros, blusa branca, canga estampada e meias verdes.', legenda: 'A pose.' },
    'look-1':         { arquivo: 'assets/fotos/look-1.jpg',         foco: '48% 55%', alt: 'A mesma pose vista de longe, no quarto de parede verde.', legenda: 'A mesma pose, com o quarto inteiro.' },
    'danca':          { arquivo: 'assets/fotos/danca.mp4', tipo: 'video', foco: '50% 45%', alt: 'Vídeo de {nome} dançando numa festa, com balões coloridos ao fundo.', legenda: 'Oito segundos de pista.' },
    'cinema':         { arquivo: 'assets/fotos/cinema.jpg',         foco: '45% 49%', alt: 'Sala de cinema escura com uma cena do filme na tela grande.', legenda: 'Sala escura, tela grande.' },
    'uno':            { arquivo: 'assets/fotos/uno.jpg',            foco: '70% 55%', alt: 'Mão segurando cartas de UNO em leque, com um +4 e um +2.', legenda: 'Um +4 guardado na mão.' },
    'drinks':         { arquivo: 'assets/fotos/drinks.jpg',         foco: '45% 55%', alt: 'Dois drinks numa mesa de madeira: um rosa, de taça, e um escuro, com gelo.', legenda: 'Um rosa, de taça. Um escuro, com gelo.' },
    'sinuca':         { arquivo: 'assets/fotos/sinuca.jpg',         foco: '45% 60%', alt: 'Salão de sinuca com mesas de feltro vermelho e gente jogando.', legenda: 'Mesas vermelhas, bola amarela.' },
    'espelho':        { arquivo: 'assets/fotos/espelho.jpg',        foco: '35% 58%', alt: '{nome} e {de} refletidos no espelho de um banheiro de parede vermelha.', legenda: 'Nós dois no espelho vermelho.' },
    'escada-rolante': { arquivo: 'assets/fotos/escada-rolante.jpg', foco: '42% 52%', alt: 'Reflexo num espelho comprido: {de} com um buquê de flores na escada rolante, ao lado de um amigo.', legenda: 'Flores subindo a escada rolante.' },
    'praia-nos-dois': { arquivo: 'assets/fotos/praia-nos-dois.jpg', foco: '65% 70%', alt: '{nome} e {de} de costas, lado a lado no mirante, olhando o mar e o morro sob um céu muito azul.', legenda: 'Nós dois, o mesmo horizonte.' },
    'selfie':         { arquivo: 'assets/fotos/selfie.jpg',         foco: '50% 80%', alt: 'Selfie bem de perto dos olhos de {nome}, com uma luz dourada entrando pelo canto.', legenda: 'A foto escondida.' }
  }
};
