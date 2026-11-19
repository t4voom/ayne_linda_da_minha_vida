/* ==========================================================================
   main.js — núcleo
   Leva o conteúdo de content.js para a página, monta as fotos (com as
   versões otimizadas, quando existem), cuida da abertura, do topo, do
   sumário, da música e do contador. Os outros arquivos se registram aqui
   com SITE.registrar({ montar, iniciar }).
   ========================================================================== */
(() => {
  'use strict';

  const C = window.CONTEUDO || {};
  const OTIM = window.FOTOS_OTIMIZADAS || {};
  const doc = document;
  const raiz = doc.documentElement;
  const mqReduzir = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFino = matchMedia('(hover: hover) and (pointer: fine)');

  const $ = (s, el = doc) => el.querySelector(s);
  const $$ = (s, el = doc) => Array.from(el.querySelectorAll(s));
  const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
  const espera = ms => new Promise(r => setTimeout(r, ms));

  /* ---------------------------------------------------------------------
     Textos
     --------------------------------------------------------------------- */
  function pegar(caminho) {
    if (!caminho) return undefined;
    return caminho.split('.').reduce((o, k) => (o == null ? undefined : o[k]), C);
  }

  const inicio = (() => {
    const d = C.inicio && C.inicio.data ? new Date(C.inicio.data + 'T00:00:00') : null;
    return d && !isNaN(d) ? d : null;
  })();
  const dias = () => (inicio ? Math.max(0, Math.floor((Date.now() - inicio) / 864e5)) : '');

  function preencher(texto, extra) {
    const fichas = Object.assign({ nome: C.nome || '', de: C.de || '', dias: dias() }, extra);
    return String(texto).replace(/\{(\w+)\}/g, (m, k) => (k in fichas ? fichas[k] : m));
  }
  function escapar(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  /* *itálico* e quebras de linha; o resto é texto puro */
  function formatar(texto, extra) {
    return escapar(preencher(texto, extra))
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
  function textoPuro(texto, extra) {
    return preencher(texto == null ? '' : texto, extra).replace(/\*([^*\n]+)\*/g, '$1');
  }

  /* ---------------------------------------------------------------------
     Fotos
     --------------------------------------------------------------------- */
  const ORDEM = ((C.arquivo && C.arquivo.ordem) || []).filter(id => C.fotos && C.fotos[id]);

  function foto(id) {
    const f = C.fotos && C.fotos[id];
    if (!f || !f.arquivo) return null;
    const o = OTIM[f.arquivo] || null;
    const video = f.tipo === 'video' || /\.(mp4|mov|m4v|webm)$/i.test(f.arquivo);
    const pos = ORDEM.indexOf(id);
    return {
      id, video, o,
      arquivo: f.arquivo,
      foco: f.foco || '50% 50%',
      w: o ? o.w : 0,
      h: o ? o.h : 0,
      cor: o ? o.cor : '',
      fundo: o ? o.fundo : '',
      lqip: o ? o.lqip : '',
      alt: textoPuro(f.alt || ''),
      legenda: f.legenda ? textoPuro(f.legenda) : '',
      numero: pos >= 0 ? 'Nº ' + String(pos + 1).padStart(2, '0') : ''
    };
  }
  const maiorSrc = d => (d.o && d.o.src && d.o.src.length ? d.o.src[d.o.src.length - 1][0] : d.arquivo);
  const capaSrc = d => (d.o && d.o.capa) || '';
  const videoSrc = d => (d.o && d.o.video) || d.arquivo;

  function marcarCarregada(img) {
    const ok = () => img.classList.add('carregada');
    if (img.complete && img.naturalWidth) ok();
    else {
      img.addEventListener('load', ok, { once: true });
      img.addEventListener('error', () => img.classList.add('erro'), { once: true });
    }
  }

  /* <img> responsiva: srcset das versões otimizadas, lazy por padrão */
  function criarImg(d, opcoes = {}) {
    const { sizes = '100vw', prioridade = false, maior = false, src = null } = opcoes;
    const img = doc.createElement('img');
    img.alt = d.alt;
    img.decoding = 'async';
    if (prioridade) img.setAttribute('fetchpriority', 'high');
    else img.loading = 'lazy';
    if (d.w && d.h) { img.width = d.w; img.height = d.h; }
    if (src) img.src = src;
    else if (!maior && d.o && d.o.src && d.o.src.length > 1) {
      img.srcset = d.o.src.map(([s, w]) => `${s} ${w}w`).join(', ');
      img.sizes = sizes;
      img.src = maiorSrc(d);
    } else img.src = maiorSrc(d);
    marcarCarregada(img);
    return img;
  }

  function aplicarCores(el, d) {
    if (d.cor) el.style.setProperty('--cor', d.cor);
    if (d.lqip) el.style.setProperty('--lqip', `url("${d.lqip}")`);
    if (d.w && d.h) el.style.setProperty('--ar', `${d.w} / ${d.h}`);
  }

  /* Monta um <figure data-foto="caminho.no.conteudo"> */
  function montarFigura(fig) {
    const id = pegar(fig.dataset.foto);
    const d = typeof id === 'string' ? foto(id) : null;
    if (!d) { fig.hidden = true; return; }
    fig.classList.add('foto');
    fig.dataset.id = d.id;
    if (d.video) fig.classList.add('foto--video');

    const estatica = fig.hasAttribute('data-estatica');
    const tag = estatica || d.video ? 'div' : 'button';
    const moldura = doc.createElement(tag);
    moldura.className = 'foto__moldura';
    aplicarCores(moldura, d);
    const px = doc.createElement('span');
    px.className = 'foto__px';

    if (d.video) {
      const v = doc.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.preload = 'none';
      v.dataset.src = videoSrc(d);
      if (capaSrc(d)) v.poster = capaSrc(d);
      v.setAttribute('aria-label', d.alt);
      v.style.setProperty('--foco', d.foco);
      px.appendChild(v);
      moldura.appendChild(px);
      const abrir = doc.createElement('button');
      abrir.type = 'button'; abrir.className = 'video__abrir';
      abrir.dataset.cursor = 'ver';
      abrir.setAttribute('aria-label', 'Ver o vídeo em tela cheia, com som');
      abrir.addEventListener('click', () => SITE.visor && SITE.visor.abrirArquivo(d.id, moldura));
      const som = doc.createElement('button');
      som.type = 'button'; som.className = 'video__som';
      som.setAttribute('aria-pressed', 'false');
      som.innerHTML = '<i aria-hidden="true"><b></b><b></b><b></b></i><span></span>';
      moldura.append(abrir, som);
    } else {
      const img = criarImg(d, {
        sizes: fig.dataset.sizes || '(min-width: 900px) 45vw, 100vw',
        prioridade: fig.hasAttribute('data-prioridade'),
        maior: fig.hasAttribute('data-maior')
      });
      img.style.setProperty('--foco', d.foco);
      px.appendChild(img);
      moldura.appendChild(px);
      if (tag === 'button') {
        moldura.type = 'button';
        moldura.dataset.cursor = 'ver';
        moldura.setAttribute('aria-label', 'Ver em tela cheia: ' + (d.legenda || d.alt));
        moldura.addEventListener('click', () => SITE.visor && SITE.visor.abrirArquivo(d.id, moldura));
      }
    }
    fig.appendChild(moldura);

    if (!fig.hasAttribute('data-sem-legenda') && (d.legenda || d.numero)) {
      const cap = doc.createElement('figcaption');
      cap.className = 'foto__legenda';
      cap.innerHTML = (d.numero ? `<span class="foto__num">${d.numero}</span>` : '') + `<span>${escapar(d.legenda)}</span>`;
      fig.appendChild(cap);
    }
    if (!estatica) fig.setAttribute('data-revelar', 'foto');
  }

  /* ---------------------------------------------------------------------
     Sumário (prólogo e menu)
     --------------------------------------------------------------------- */
  function contar(ids) {
    const lista = (ids || []).map(foto).filter(Boolean);
    const f = lista.filter(d => !d.video).length;
    const v = lista.length - f;
    const partes = [];
    if (f) partes.push(f + (f === 1 ? ' foto' : ' fotos'));
    if (v) partes.push(v + (v === 1 ? ' vídeo' : ' vídeos'));
    return partes.join(' · ');
  }

  function secoes() {
    const cap = C.capitulos || {};
    const capitulo = (id, c) => c && { id, num: c.numero || '', nome: c.titulo || '', qtd: contar(c.fotos) };
    return [
      capitulo('luz-de-poste', cap.luz),
      capitulo('flor-amarela', cap.flor),
      capitulo('ceu-azul', cap.ceu),
      capitulo('do-seu-jeito', cap.jeito),
      C.momentos && { id: 'momentos', num: '', nome: C.momentos.titulo, qtd: contar((C.momentos.itens || []).map(i => i.foto)) },
      C.carta && { id: 'carta', num: '', nome: C.carta.titulo, qtd: '1 carta' },
      C.inventario && { id: 'inventario', num: '', nome: C.inventario.titulo, qtd: (C.inventario.itens || []).length + ' detalhes' },
      C.arquivo && { id: 'arquivo', num: '', nome: C.arquivo.titulo, qtd: contar(ORDEM) },
      { id: 'fim', num: '', nome: 'Epílogo', qtd: '' }
    ].filter(s => s && s.nome && doc.getElementById(s.id));
  }

  function montarSumario() {
    const itens = secoes();
    const html = itens.map((s, i) => `<li><a href="#${s.id}" style="--i:${i}">` +
      `<span class="num">${escapar(s.num || String(i + 1).padStart(2, '0'))}</span>` +
      `<span class="nome">${formatar(s.nome)}</span>` +
      `<span class="qtd">${escapar(s.qtd)}</span></a></li>`).join('');
    ['#sumarioLista', '#menuLista'].forEach(sel => { const ol = $(sel); if (ol) ol.innerHTML = html; });
  }

  /* rótulo da seção atual no topo */
  function rotuloSecao(sec) {
    const chave = sec.dataset.secao;
    if (chave === 'inicio') return '';
    if (chave === 'prologo') return textoPuro(C.prologo && C.prologo.rotulo);
    if (chave === 'fim') return 'Epílogo';
    const c = pegar(chave);
    if (!c) return '';
    return (c.numero ? c.numero + ' · ' : '') + textoPuro(c.titulo);
  }

  /* ---------------------------------------------------------------------
     Rolagem: um despachante só, um quadro por vez
     --------------------------------------------------------------------- */
  const ouvintes = [];
  let agendado = false;
  function despachar() {
    agendado = false;
    const y = window.scrollY;
    for (const fn of ouvintes) fn(y);
  }
  const agendar = () => { if (!agendado) { agendado = true; requestAnimationFrame(despachar); } };
  addEventListener('scroll', agendar, { passive: true });
  addEventListener('resize', agendar);

  /* ---------------------------------------------------------------------
     SITE: o que os outros arquivos usam
     --------------------------------------------------------------------- */
  const modulos = [];
  const eventos = new EventTarget();
  const SITE = window.SITE = {
    C, $, $$, limitar, espera, pegar, preencher, formatar, textoPuro, escapar,
    foto, criarImg, maiorSrc, capaSrc, videoSrc, aplicarCores, ORDEM,
    reduzir: () => mqReduzir.matches,
    fino: () => mqFino.matches,
    registrar: m => modulos.push(m),
    emitir: (nome, detalhe) => eventos.dispatchEvent(new CustomEvent(nome, { detail: detalhe })),
    ouvir: (nome, fn) => eventos.addEventListener(nome, e => fn(e.detail)),
    aoRolar: fn => { ouvintes.push(fn); },
    atualizarRolagem: despachar,
    travarRolagem(v) { raiz.classList.toggle('travado', v); SITE.emitir('travar', v); },
    inerte(v) { ['#conteudo', '#topo', '#som', '.pular'].forEach(s => { const el = $(s); if (el) el.inert = v; }); },
    irPara(alvo) {
      const el = typeof alvo === 'string' ? doc.getElementById(alvo.replace(/^#/, '')) : alvo;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: mqReduzir.matches ? 'auto' : 'smooth' });
      el.focus && el.focus({ preventScroll: true });
    }
  };

  /* ---------------------------------------------------------------------
     Música: só toca depois de um toque, com volume suave
     --------------------------------------------------------------------- */
  const Musica = SITE.musica = (() => {
    const cfg = C.musica || {};
    const botao = $('#som');
    const rotulo = $('#somRotulo');
    const volume = limitar(Number(cfg.volume == null ? .5 : cfg.volume), 0, 1);
    let audio = null, disponivel = false, tocando = false, quer = false, silenciado = false, quadro = 0;
    let resolver;
    const pronto = new Promise(r => { resolver = r; });

    function preparar() {
      if (!cfg.arquivo || !botao) { resolver(false); return; }
      audio = new Audio();
      audio.loop = true;
      audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', () => { disponivel = true; resolver(true); }, { once: true });
      audio.addEventListener('error', () => { disponivel = false; resolver(false); }, { once: true });
      audio.src = cfg.arquivo;
      setTimeout(() => resolver(disponivel), 5000);
      rotulo.textContent = [cfg.titulo, cfg.artista].filter(Boolean).join(' · ');
      botao.setAttribute('aria-label', 'Música: ' + (rotulo.textContent || 'tocar'));
      botao.addEventListener('click', () => (tocando ? pausar(true) : tocar(true)));
    }
    function fade(alvo, ms, depois) {
      cancelAnimationFrame(quadro);
      const v0 = audio.volume, t0 = performance.now();
      const passo = t => {
        const k = limitar((t - t0) / ms, 0, 1);
        audio.volume = limitar(v0 + (alvo - v0) * k, 0, 1);
        if (k < 1) quadro = requestAnimationFrame(passo);
        else if (depois) depois();
      };
      quadro = requestAnimationFrame(passo);
    }
    function ui() {
      botao.classList.toggle('tocando', tocando);
      botao.setAttribute('aria-pressed', String(tocando));
    }
    function tocar(manual) {
      if (!disponivel) return;
      quer = true;
      if (silenciado) return;
      audio.volume = 0;
      const p = audio.play();
      Promise.resolve(p).then(() => {
        tocando = true; ui(); fade(volume, 2200);
        if (manual !== false) { botao.classList.add('falando'); setTimeout(() => botao.classList.remove('falando'), 3600); }
      }).catch(() => { tocando = false; ui(); });
    }
    function pausar(manual) {
      if (!audio) return;
      if (manual) quer = false;
      tocando = false; ui();
      fade(0, 700, () => audio.pause());
    }
    /* o vídeo com som pede silêncio; depois devolve */
    function silenciar(s) {
      silenciado = s;
      if (!audio) return;
      if (s && tocando) { tocando = false; ui(); fade(0, 500, () => audio.pause()); }
      else if (!s && quer && !tocando) tocar(false);
    }
    function mostrar() {
      if (!disponivel || !botao) return;
      botao.hidden = false;
      requestAnimationFrame(() => botao.classList.add('visivel'));
    }
    return { preparar, tocar, pausar, silenciar, mostrar, pronto, get disponivel() { return disponivel; } };
  })();

  /* ---------------------------------------------------------------------
     Abertura: luz, frase, botão e a íris
     --------------------------------------------------------------------- */
  function abertura() {
    const el = $('#abertura');
    if (!el) { SITE.emitir('abrindo'); SITE.emitir('aberto'); return; }

    raiz.classList.add('travado');
    SITE.inerte(true);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const h = new Date().getHours();
    const s = (C.abertura && C.abertura.saudacoes) || {};
    const chave = h < 5 ? 'madrugada' : h < 12 ? 'manha' : h < 18 ? 'tarde' : 'noite';
    $('#aberturaSaudacao').innerHTML = formatar(s[chave] || '');

    /* som: ligado por padrão quando existe música; ela pode desligar */
    const somB = $('#aberturaSom'), somT = $('#aberturaSomTexto');
    let comSom = true;
    const textoSom = () => { somT.textContent = textoPuro(comSom ? C.abertura.comSom : C.abertura.semSom); somB.setAttribute('aria-pressed', String(comSom)); };
    Musica.pronto.then(ok => { if (ok) { somB.hidden = false; textoSom(); } });
    somB.addEventListener('click', () => { comSom = !comSom; textoSom(); });

    /* progresso: fontes + foto do hero, com tempo mínimo para respirar */
    const pct = $('#aberturaPct');
    let alvo = 8, atual = 0, terminou = false, foi = false;
    const imgHero = $('.hero img');
    const esperarImg = img => (!img || (img.complete && img.naturalWidth)) ? Promise.resolve() :
      new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
    const fontes = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
    fontes.then(() => { alvo = Math.max(alvo, 48); });
    esperarImg(imgHero).then(() => { alvo = Math.max(alvo, 78); });
    const minimo = mqReduzir.matches ? 300 : 1500;
    Promise.race([Promise.all([fontes, esperarImg(imgHero), espera(minimo)]), espera(8000)])
      .then(() => { alvo = 100; terminou = true; });

    const passo = () => {
      atual += (alvo - atual) * .075;
      if (terminou && alvo - atual < .6) atual = 100;
      pct.textContent = String(Math.round(atual)).padStart(2, '0');
      if (atual < 100) requestAnimationFrame(passo); else pronta();
    };
    requestAnimationFrame(passo);

    const botao = $('#aberturaBotao');
    function pronta() {
      el.classList.add('pronta');
    }

    botao.addEventListener('click', abrir);
    function abrir() {
      if (foi) return;
      foi = true;
      if (comSom && Musica.disponivel) Musica.tocar(true);
      el.classList.add('abrindo');
      SITE.emitir('abrindo');
      if (mqReduzir.matches) {
        el.style.transition = 'opacity .5s';
        el.style.opacity = '0';
        setTimeout(fim, 520);
        return;
      }
      const luz = $('.abertura__luz', el).getBoundingClientRect();
      const cx = luz.left + luz.width / 2, cy = luz.top + luz.height / 2;
      const suave = 90;
      const raio = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + suave;
      const dur = 1800;
      let t0 = 0;
      const ease = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      const quadro = t => {
        if (!t0) t0 = t;
        const k = limitar((t - t0) / dur, 0, 1);
        const r = ease(k) * (raio + suave) - suave;
        const m = `radial-gradient(circle at ${cx}px ${cy}px, transparent ${Math.max(0, r)}px, #000 ${Math.max(0, r) + suave}px)`;
        el.style.webkitMaskImage = m;
        el.style.maskImage = m;
        if (k < 1) requestAnimationFrame(quadro); else fim();
      };
      setTimeout(() => requestAnimationFrame(quadro), 380);
    }
    function fim() {
      el.remove();
      raiz.classList.remove('travado');
      SITE.inerte(false);
      Musica.mostrar();
      SITE.emitir('aberto');
      const destino = location.hash && doc.getElementById(location.hash.slice(1));
      if (destino && destino.id !== 'inicio') setTimeout(() => SITE.irPara(destino), 300);
    }
  }

  /* ---------------------------------------------------------------------
     Topo: some ao descer, volta ao subir; progresso e seção atual
     --------------------------------------------------------------------- */
  function iniciarTopo() {
    const topo = $('#topo'), prog = $('#progresso'), rotulo = $('#topoSecao');
    const metaCor = $('meta[name="theme-color"]');
    let ultimo = window.scrollY;
    SITE.aoRolar(y => {
      const max = raiz.scrollHeight - innerHeight;
      prog.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
      if (y < 120) topo.classList.remove('escondido');
      else if (y > ultimo + 4) topo.classList.add('escondido');
      else if (y < ultimo - 4) topo.classList.remove('escondido');
      ultimo = y;
    });
    const todas = $$('[data-secao]');
    if (!('IntersectionObserver' in window)) return;
    let atual = null;
    const io = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (!e.isIntersecting || e.target === atual) return;
        atual = e.target;
        const texto = rotuloSecao(atual);
        rotulo.classList.add('trocando');
        setTimeout(() => { rotulo.textContent = texto; rotulo.classList.remove('trocando'); }, 220);
        if (metaCor && atual.dataset.cor) metaCor.setAttribute('content', atual.dataset.cor);
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    todas.forEach(s => io.observe(s));
  }

  /* ---------------------------------------------------------------------
     Menu (sumário em tela cheia)
     --------------------------------------------------------------------- */
  function iniciarMenu() {
    const menu = $('#menu'), abrirB = $('#menuAbrir'), fecharB = $('#menuFechar');
    if (!menu || !abrirB) return;
    let aberto = false, timer = 0;
    function abrir() {
      if (aberto) return;
      aberto = true;
      clearTimeout(timer);
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('aberto')));
      abrirB.setAttribute('aria-expanded', 'true');
      SITE.travarRolagem(true);
      $('#conteudo').inert = true;
      setTimeout(() => fecharB.focus({ preventScroll: true }), 60);
    }
    function fechar(devolverFoco = true) {
      if (!aberto) return;
      aberto = false;
      menu.classList.remove('aberto');
      abrirB.setAttribute('aria-expanded', 'false');
      SITE.travarRolagem(false);
      $('#conteudo').inert = false;
      timer = setTimeout(() => { menu.hidden = true; }, 560);
      if (devolverFoco) abrirB.focus({ preventScroll: true });
    }
    abrirB.addEventListener('click', abrir);
    fecharB.addEventListener('click', () => fechar());
    menu.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      fechar(false);
      setTimeout(() => SITE.irPara(a.getAttribute('href')), 80);
    });
    doc.addEventListener('keydown', e => {
      if (!aberto) return;
      if (e.key === 'Escape') fechar();
      if (e.key === 'Tab') {
        const foco = $$('button, a[href]', menu);
        const i = foco.indexOf(doc.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); foco[foco.length - 1].focus(); }
        else if (!e.shiftKey && i === foco.length - 1) { e.preventDefault(); foco[0].focus(); }
      }
    });
  }

  /* ---------------------------------------------------------------------
     Contador: toque para trocar dias → horas → minutos → segundos
     --------------------------------------------------------------------- */
  function iniciarContador() {
    const b = $('#contador');
    if (!b) return;
    if (!inicio) { const m = $('#heroMeta'); if (m) m.hidden = true; return; }
    const unidades = [['dia', 'dias', 864e5], ['hora', 'horas', 36e5], ['minuto', 'minutos', 6e4], ['segundo', 'segundos', 1e3]];
    let u = 0;
    const fmt = n => n.toLocaleString('pt-BR');
    function atualizar() {
      const n = Math.max(0, Math.floor((Date.now() - inicio) / unidades[u][2]));
      b.textContent = `há ${fmt(n)} ${n === 1 ? unidades[u][0] : unidades[u][1]}`;
    }
    b.addEventListener('click', () => { u = (u + 1) % unidades.length; atualizar(); });
    atualizar();
    setInterval(atualizar, 1000);
  }

  /* ---------------------------------------------------------------------
     Partida
     --------------------------------------------------------------------- */
  function aplicarTextos() {
    $$('[data-c]').forEach(el => {
      const v = pegar(el.dataset.c);
      if (v == null || v === '') { el.hidden = true; return; }
      el.innerHTML = formatar(v);
    });
    doc.title = textoPuro('{nome} em duas luzes');
  }

  function iniciar() {
    raiz.lang = 'pt-BR';
    aplicarTextos();
    $$('[data-foto]').forEach(montarFigura);
    const placa = $('#heroPlaca'), dHero = foto(C.hero && C.hero.foto);
    if (placa && dHero) placa.textContent = [dHero.numero, dHero.legenda.replace(/\..*$/, '')].filter(Boolean).join(' · ');
    montarSumario();
    modulos.forEach(m => m.montar && m.montar(SITE));
    modulos.forEach(m => m.iniciar && m.iniciar(SITE));
    iniciarTopo();
    iniciarMenu();
    iniciarContador();
    Musica.preparar();
    abertura();
    despachar();
    if (C.segredos && C.segredos.console) {
      console.log('%c' + textoPuro(C.segredos.console), 'font: italic 15px Georgia, serif; color: #e6b42c; padding: 6px 0;');
    }
  }

  if (doc.readyState === 'complete') setTimeout(iniciar, 0);
  else doc.addEventListener('DOMContentLoaded', iniciar);
})();
