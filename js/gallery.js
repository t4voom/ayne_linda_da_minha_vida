/* ==========================================================================
   gallery.js — visor em tela cheia, Momentos e Arquivo
   A foto "voa" do recorte até a tela inteira (e volta ao fechar), com o
   corte animado: o detalhe do cartão vira a foto completa.
   Setas, teclado, deslizar o dedo e deslizar para baixo para fechar.
   ========================================================================== */
(() => {
  'use strict';
  const S = window.SITE;
  if (!S) return;
  const { C, $, limitar, formatar, escapar, foto, criarImg, aplicarCores, ORDEM } = S;
  const EASE_CENA = 'cubic-bezier(.76, 0, .24, 1)';
  const EASE = 'cubic-bezier(.16, 1, .3, 1)';

  /* ---------------------------------------------------------------------
     Visor
     --------------------------------------------------------------------- */
  const Visor = (() => {
    const el = $('#visor');
    if (!el) return null;
    const palco = $('#visorPalco'), fundo = $('.visor__fundo', el);
    const titulo = $('#visorTitulo'), texto = $('#visorTexto'), contagem = $('#visorContagem');
    const ant = $('#visorAnt'), prox = $('#visorProx'), fecharB = $('#visorFechar');
    let lista = [], i = 0, aberto = false, ocupado = false, atual = null, focoAntes = null, escondido = null;

    const barra = $('.visor__barra', el), caixaLegenda = $('.visor__legenda', el);
    /* espaço livre entre a barra de cima e a legenda (respeita o notch) */
    function area() {
      const vw = innerWidth, vh = innerHeight, desk = vw >= 900;
      const topo = barra.getBoundingClientRect().bottom + 6;
      const base = Math.min(vh - 120, caixaLegenda.getBoundingClientRect().top - (desk ? 22 : 18));
      const lado = desk ? 112 : 0;
      return { x: lado, y: topo, w: vw - lado * 2, h: Math.max(160, base - topo) };
    }
    function encaixe(d, m) {
      const a = area();
      const nw = d.w || (m && (m.naturalWidth || m.videoWidth)) || 3;
      const nh = d.h || (m && (m.naturalHeight || m.videoHeight)) || 4;
      const ar = nw / nh;
      let w = a.w, h = w / ar;
      if (h > a.h) { h = a.h; w = h * ar; }
      return { left: a.x + (a.w - w) / 2, top: a.y + (a.h - h) / 2, width: w, height: h };
    }
    function posicionar(m, r) {
      m.style.left = r.left + 'px'; m.style.top = r.top + 'px';
      m.style.width = r.width + 'px'; m.style.height = r.height + 'px';
    }
    function criarMidia(d) {
      let m;
      if (d.video) {
        m = document.createElement('video');
        m.src = S.videoSrc(d);
        if (S.capaSrc(d)) m.poster = S.capaSrc(d);
        m.controls = true; m.playsInline = true; m.setAttribute('playsinline', '');
        m.preload = 'auto';
        m.setAttribute('aria-label', d.alt);
        m.addEventListener('play', () => S.musica && S.musica.silenciar(true));
        m.addEventListener('pause', () => S.musica && S.musica.silenciar(false));
      } else {
        m = document.createElement('img');
        m.alt = d.alt;
        m.decoding = 'async';
        m.src = S.maiorSrc(d);
        m.draggable = false;
        if (d.lqip) { m.style.backgroundImage = `url("${d.lqip}")`; m.style.backgroundSize = 'cover'; }
      }
      m.className = 'visor__midia';
      return m;
    }

    /* Onde a foto inteira está na tela, a partir do recorte de origem */
    function geometria(origem, r, d) {
      const o = origem.getBoundingClientRect();
      const midia = origem.querySelector('img, video');
      let cont = null;
      if (midia) {
        const ri = midia.getBoundingClientRect();
        const st = getComputedStyle(midia);
        const nw = d.w || midia.naturalWidth || midia.videoWidth || r.width;
        const nh = d.h || midia.naturalHeight || midia.videoHeight || r.height;
        const c = Math.max(ri.width / nw, ri.height / nh);
        const cw = nw * c, ch = nh * c;
        const [px, py] = st.objectPosition.split(' ').map(v => (v.endsWith('%') ? parseFloat(v) / 100 : .5));
        cont = { left: ri.left + (ri.width - cw) * px, top: ri.top + (ri.height - ch) * py, width: cw, height: ch };
      }
      if (!cont) {
        const s = Math.max(o.width / r.width, o.height / r.height);
        cont = { left: o.left + (o.width - r.width * s) / 2, top: o.top + (o.height - r.height * s) / 2, width: r.width * s, height: r.height * s };
      }
      const s = cont.width / r.width;
      const corte = [
        Math.max(0, (o.top - cont.top) / s),
        Math.max(0, (cont.left + cont.width - (o.left + o.width)) / s),
        Math.max(0, (cont.top + cont.height - (o.top + o.height)) / s),
        Math.max(0, (o.left - cont.left) / s)
      ];
      const raio = parseFloat(getComputedStyle(origem).borderTopLeftRadius) || 0;
      return {
        transform: `translate(${(cont.left - r.left).toFixed(2)}px, ${(cont.top - r.top).toFixed(2)}px) scale(${s.toFixed(5)})`,
        clip: `inset(${corte.map(v => v.toFixed(2) + 'px').join(' ')} round ${(raio / s).toFixed(2)}px)`
      };
    }
    const visivel = elx => {
      if (!elx || !elx.isConnected) return false;
      const r = elx.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    };

    function legenda(item) {
      titulo.innerHTML = item.titulo ? formatar(item.titulo) : escapar(item.d.legenda || item.d.alt);
      texto.textContent = item.texto || '';
      contagem.textContent = lista.length > 1 ? `${String(i + 1).padStart(2, '0')} / ${String(lista.length).padStart(2, '0')}` : '';
      el.style.setProperty('--visor-cor', item.d.fundo || '#0d0a08');
    }
    function preCarregar(j) {
      const item = lista[(j + lista.length) % lista.length];
      if (item && !item.d.video) { const im = new Image(); im.decoding = 'async'; im.src = S.maiorSrc(item.d); }
    }

    function abrir(itens, indice = 0, origem = null) {
      if (aberto || !itens || !itens.length) return;
      lista = itens; i = limitar(indice, 0, itens.length - 1);
      if (origem) lista[i] = Object.assign({}, lista[i], { origem });
      aberto = true; ocupado = true;
      focoAntes = document.activeElement;
      el.hidden = false;
      el.classList.toggle('unico', lista.length < 2);
      S.travarRolagem(true);
      S.inerte(true);
      const item = lista[i];
      legenda(item);
      const m = criarMidia(item.d);
      const r = encaixe(item.d, m);
      posicionar(m, r);
      palco.appendChild(m);
      atual = { m, item };
      if (m.tagName === 'VIDEO') m.play().catch(() => {});
      const de = item.origem && visivel(item.origem) && !S.reduzir() ? item.origem : null;
      if (de) {
        const g = geometria(de, r, item.d);
        m.style.transform = g.transform;
        m.style.clipPath = g.clip;
        escondido = de; de.style.visibility = 'hidden';
      } else m.style.opacity = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.classList.add('aberto');
        let anim;
        if (de) {
          anim = m.animate([
            { transform: m.style.transform, clipPath: m.style.clipPath },
            { transform: 'translate(0px, 0px) scale(1)', clipPath: 'inset(0px 0px 0px 0px round 0px)' }
          ], { duration: 950, easing: EASE_CENA });
          m.style.transform = ''; m.style.clipPath = '';
        } else {
          m.style.opacity = '';
          anim = m.animate([{ opacity: 0, transform: 'translate(0, 18px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: EASE });
        }
        anim.finished.then(() => { ocupado = false; }, () => { ocupado = false; });
      }));
      fecharB.focus({ preventScroll: true });
      if (lista.length > 1) { preCarregar(i + 1); preCarregar(i - 1); }
      document.addEventListener('keydown', teclas);
    }

    function fechar(opcoes = {}) {
      if (!aberto || ocupado) return;
      ocupado = true;
      const { m, item } = atual;
      if (m.tagName === 'VIDEO') m.pause();
      const r = { left: parseFloat(m.style.left), top: parseFloat(m.style.top), width: parseFloat(m.style.width), height: parseFloat(m.style.height) };
      const para = !opcoes.deslizou && item.origem && visivel(item.origem) && !S.reduzir() ? item.origem : null;
      el.classList.remove('aberto');
      let anim;
      if (opcoes.deslizou) {
        const t = m.style.transform || 'none';
        anim = m.animate([{ opacity: 1, transform: t }, { opacity: 0, transform: t + ' translate(0, 60px)' }], { duration: 360, easing: EASE, fill: 'forwards' });
      } else if (para) {
        m.style.transformOrigin = '0 0';
        m.style.transform = '';
        if (escondido && escondido !== para) escondido.style.visibility = '';
        escondido = para;
        para.style.visibility = 'hidden';
        const g = geometria(para, r, item.d);
        anim = m.animate([
          { transform: 'translate(0px, 0px) scale(1)', clipPath: 'inset(0px 0px 0px 0px round 0px)' },
          { transform: g.transform, clipPath: g.clip }
        ], { duration: 800, easing: EASE_CENA, fill: 'forwards' });
      } else {
        anim = m.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate(0, 14px)' }], { duration: 380, easing: EASE, fill: 'forwards' });
      }
      const terminar = () => {
        palco.innerHTML = '';
        if (escondido) { escondido.style.visibility = ''; escondido = null; }
        el.hidden = true;
        aberto = false; ocupado = false; atual = null;
        S.travarRolagem(false);
        S.inerte(false);
        S.musica && S.musica.silenciar(false);
        document.removeEventListener('keydown', teclas);
        if (focoAntes && focoAntes.focus) focoAntes.focus({ preventScroll: true });
      };
      anim.finished.then(terminar, terminar);
    }

    function ir(delta) {
      if (!aberto || ocupado || lista.length < 2) return;
      ocupado = true;
      const velho = atual;
      if (velho.m.tagName === 'VIDEO') velho.m.pause();
      i = (i + delta + lista.length) % lista.length;
      const item = lista[i];
      const m = criarMidia(item.d);
      posicionar(m, encaixe(item.d, m));
      m.style.transformOrigin = '50% 50%';
      palco.appendChild(m);
      atual = { m, item };
      legenda(item);
      if (escondido) { escondido.style.visibility = ''; escondido = null; }
      const dx = Math.min(innerWidth * .14, 140) * delta;
      velho.m.style.transformOrigin = '50% 50%';
      const deslize = velho.m.style.transform;
      velho.m.animate([{ opacity: 1, transform: deslize || 'none' }, { opacity: 0, transform: `translate(${-dx}px, 0) scale(.97)` }], { duration: 480, easing: 'cubic-bezier(.33, 1, .68, 1)', fill: 'forwards' })
        .finished.then(() => velho.m.remove(), () => velho.m.remove());
      m.animate([{ opacity: 0, transform: `translate(${dx}px, 0) scale(1.02)` }, { opacity: 1, transform: 'none' }], { duration: 720, easing: EASE })
        .finished.then(() => { ocupado = false; }, () => { ocupado = false; });
      preCarregar(i + delta);
    }

    function teclas(e) {
      if (!aberto) return;
      if (e.key === 'Escape') { e.preventDefault(); fechar(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); ir(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); ir(-1); }
      else if (e.key === 'Tab') {
        const foco = [fecharB, ant, prox, atual && atual.m.tagName === 'VIDEO' ? atual.m : null].filter(b => b && !b.hidden && b.offsetParent !== null);
        const k = foco.indexOf(document.activeElement);
        if (e.shiftKey && k <= 0) { e.preventDefault(); foco[foco.length - 1].focus(); }
        else if (!e.shiftKey && k === foco.length - 1) { e.preventDefault(); foco[0].focus(); }
      }
    }

    /* toque: deslizar para os lados troca, para baixo fecha */
    let toque = null;
    palco.addEventListener('pointerdown', e => {
      if (!aberto || ocupado || e.pointerType === 'mouse' || (e.target.tagName === 'VIDEO' && e.clientY > innerHeight - 160)) return;
      toque = { x: e.clientX, y: e.clientY, t: performance.now(), eixo: null };
    });
    palco.addEventListener('pointermove', e => {
      if (!toque || !atual) return;
      const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
      if (!toque.eixo && Math.hypot(dx, dy) > 8) toque.eixo = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      atual.m.style.transformOrigin = '50% 50%';
      if (toque.eixo === 'x' && lista.length > 1) atual.m.style.transform = `translate(${dx * .7}px, 0)`;
      else if (toque.eixo === 'y' && dy > 0) {
        atual.m.style.transform = `translate(0, ${dy * .7}px) scale(${1 - Math.min(dy / 1800, .12)})`;
        fundo.style.opacity = String(Math.max(.35, .985 - dy / 500));
      }
    });
    const soltar = e => {
      if (!toque || !atual) return;
      const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
      const rapido = performance.now() - toque.t < 280;
      const eixo = toque.eixo;
      toque = null;
      fundo.style.opacity = '';
      if (eixo === 'x' && lista.length > 1 && (Math.abs(dx) > 70 || (rapido && Math.abs(dx) > 30))) { ir(dx < 0 ? 1 : -1); return; }
      if (eixo === 'y' && (dy > 120 || (rapido && dy > 50))) { fechar({ deslizou: true }); return; }
      const m = atual.m, t = m.style.transform;
      m.style.transform = '';
      if (t) m.animate([{ transform: t }, { transform: 'none' }], { duration: 420, easing: EASE });
      m.style.transformOrigin = '0 0';
    };
    palco.addEventListener('pointerup', soltar);
    palco.addEventListener('pointercancel', soltar);
    palco.addEventListener('click', e => { if (e.target === palco) fechar(); });

    fecharB.addEventListener('click', fechar);
    ant.addEventListener('click', () => ir(-1));
    prox.addEventListener('click', () => ir(1));
    addEventListener('resize', () => {
      if (!aberto || !atual) return;
      posicionar(atual.m, encaixe(atual.item.d, atual.m));
    });

    return { abrir, fechar };
  })();

  /* ---------------------------------------------------------------------
     Lista do arquivo (usada pelas fotos da história também)
     --------------------------------------------------------------------- */
  const itensArquivo = [];
  function listaArquivo() { return itensArquivo.map(x => Object.assign({}, x)); }

  S.visor = {
    abrir: (itens, indice, origem) => Visor && Visor.abrir(itens, indice, origem),
    fechar: () => Visor && Visor.fechar(),
    abrirArquivo(id, origem) {
      const lista = listaArquivo();
      let k = lista.findIndex(x => x.d.id === id);
      if (k < 0) {
        const d = foto(id);
        if (!d) return;
        Visor && Visor.abrir([{ d, titulo: d.legenda, texto: d.numero }], 0, origem);
        return;
      }
      Visor && Visor.abrir(lista, k, origem);
    }
  };

  /* ---------------------------------------------------------------------
     Arquivo: grade editorial com numeração
     --------------------------------------------------------------------- */
  function montarArquivo() {
    const grade = $('#arquivoGrade');
    if (!grade) return;
    const itens = ORDEM.map(foto).filter(Boolean);
    const nFotos = itens.filter(d => !d.video).length, nVideos = itens.length - nFotos;
    const txt = $('#arquivoTexto');
    if (txt && C.arquivo && C.arquivo.texto) {
      let t = C.arquivo.texto;
      if (nVideos !== 1) t = t.replace('{videos} vídeo', '{videos} vídeos');
      if (!nVideos) t = t.replace(/ e \{videos\} vídeos?/, '');
      txt.innerHTML = formatar(t, { fotos: nFotos, videos: nVideos });
    }
    itens.forEach((d, k) => {
      const li = document.createElement('li');
      li.className = 'peca';
      const fig = document.createElement('figure');
      fig.className = 'foto';
      fig.setAttribute('data-revelar', 'foto');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'foto__moldura';
      b.dataset.cursor = 'ver';
      b.setAttribute('aria-label', `${d.numero}: ${d.legenda || d.alt}. Ver em tela cheia.`);
      aplicarCores(b, d);
      const px = document.createElement('span');
      px.className = 'foto__px';
      const img = d.video
        ? criarImg(d, { src: S.capaSrc(d) || '' })
        : criarImg(d, { sizes: '(min-width: 900px) 34vw, 92vw' });
      img.alt = d.video ? d.alt + ' (capa do vídeo)' : d.alt;
      img.style.setProperty('--foco', d.foco);
      px.appendChild(img);
      b.appendChild(px);
      if (d.video) {
        const marca = document.createElement('span');
        marca.className = 'video__marca';
        marca.innerHTML = '<svg aria-hidden="true"><use href="#i-play"/></svg>vídeo';
        b.appendChild(marca);
      }
      const cap = document.createElement('figcaption');
      cap.className = 'foto__legenda';
      cap.innerHTML = `<span class="foto__num">${d.numero}</span><span>${escapar(d.legenda)}</span>`;
      fig.append(b, cap);
      li.appendChild(fig);
      grade.appendChild(li);
      itensArquivo.push({ d, origem: b, titulo: d.legenda, texto: d.numero });
      b.addEventListener('click', () => Visor && Visor.abrir(listaArquivo(), k, b));
    });
  }

  /* ---------------------------------------------------------------------
     Momentos: o cartão mostra um detalhe; o visor, a foto inteira
     --------------------------------------------------------------------- */
  function montarMomentos() {
    const ul = $('#momentosLista');
    if (!ul || !C.momentos) return;
    const lista = [];
    (C.momentos.itens || []).forEach(m => {
      const d = foto(m.foto);
      if (!d || d.video) return;
      const k = lista.length;
      const li = document.createElement('li');
      li.className = 'momento';
      li.setAttribute('data-revelar', '');
      li.style.setProperty('--atraso', `${(k % 3) * .08}s`);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'momento__botao';
      b.dataset.cursor = 'abrir';
      b.setAttribute('aria-label', `${S.textoPuro(m.titulo)}. Ver a foto inteira.`);
      const moldura = document.createElement('span');
      moldura.className = 'momento__moldura';
      aplicarCores(moldura, d);
      moldura.style.setProperty('--foco', m.foco || d.foco);
      moldura.style.setProperty('--zoom', String(m.zoom || 1.6));
      const img = criarImg(d, { maior: true });
      moldura.appendChild(img);
      const info = document.createElement('span');
      info.className = 'momento__info';
      info.innerHTML = `<span class="rotulo">${d.numero || String(k + 1).padStart(2, '0')}</span>` +
        `<span class="momento__titulo">${formatar(m.titulo)}</span>` +
        '<span class="momento__mais" aria-hidden="true"><svg><use href="#i-mais"/></svg></span>';
      b.append(moldura, info);
      li.appendChild(b);
      ul.appendChild(li);
      lista.push({ d, origem: moldura, titulo: m.titulo, texto: [d.numero, d.legenda].filter(Boolean).join(' · ') });
      b.addEventListener('click', () => Visor && Visor.abrir(lista.map(x => Object.assign({}, x)), k, moldura));
    });
  }

  S.registrar({
    montar() {
      montarMomentos();
      montarArquivo();
    }
  });
})();
