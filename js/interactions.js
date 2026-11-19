/* ==========================================================================
   interactions.js — a carta, o inventário, o vídeo e os segredos
   Segredos: três flores escondidas (liberam a foto guardada), um coração
   no arquivo, chuva de flores ao digitar o nome dela (ou segurar o dedo
   no nome, no celular) e a luz acesa no final.
   ========================================================================== */
(() => {
  'use strict';
  const S = window.SITE;
  if (!S) return;
  const { C, $, $$, limitar, formatar, textoPuro, preencher, escapar, foto, criarImg, aplicarCores } = S;
  const SEG = C.segredos || {};

  /* ---------------------------------------------------------------------
     Aviso (aparece embaixo e some sozinho)
     --------------------------------------------------------------------- */
  let tAviso = 0;
  S.ouvir('travar', v => { if (v) { clearTimeout(tAviso); const a = $('#aviso'); if (a) a.classList.remove('visivel'); } });
  S.avisar = (html, ms = 4200) => {
    const a = $('#aviso');
    if (!a || !html) return;
    a.innerHTML = html;
    a.classList.add('visivel');
    clearTimeout(tAviso);
    tAviso = setTimeout(() => a.classList.remove('visivel'), ms);
  };

  /* ---------------------------------------------------------------------
     Flores: chuva e estouro
     --------------------------------------------------------------------- */
  const NS = 'http://www.w3.org/2000/svg';
  function florSvg() {
    const s = document.createElementNS(NS, 'svg');
    const u = document.createElementNS(NS, 'use');
    u.setAttribute('href', '#i-flor');
    s.appendChild(u);
    return s;
  }
  S.chuva = (qtd = 34) => {
    const box = $('#chuva');
    if (!box || S.reduzir()) return;
    for (let k = 0; k < qtd; k++) {
      const s = florSvg();
      const r = Math.random;
      s.style.left = (r() * 100) + 'vw';
      s.style.setProperty('--s', (10 + r() * 16).toFixed(0) + 'px');
      s.style.setProperty('--d', (3.6 + r() * 3).toFixed(2) + 's');
      s.style.setProperty('--dx', ((r() - .5) * 30).toFixed(1) + 'vw');
      s.style.setProperty('--r', ((r() > .5 ? 1 : -1) * (180 + r() * 540)).toFixed(0) + 'deg');
      s.style.setProperty('--atraso', (r() * 1.4).toFixed(2) + 's');
      s.addEventListener('animationend', () => s.remove(), { once: true });
      box.appendChild(s);
    }
  };
  function estouro(el, qtd = 9) {
    if (S.reduzir()) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let k = 0; k < qtd; k++) {
      const s = florSvg();
      s.classList.add('estouro');
      const ang = (k / qtd) * Math.PI * 2 + Math.random() * .5, dist = 40 + Math.random() * 50;
      s.style.left = (cx - 6) + 'px';
      s.style.top = (cy - 6) + 'px';
      s.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
      s.style.setProperty('--dy', (Math.sin(ang) * dist).toFixed(1) + 'px');
      s.style.setProperty('--r', (Math.random() * 360).toFixed(0) + 'deg');
      s.addEventListener('animationend', () => s.remove(), { once: true });
      document.body.appendChild(s);
    }
  }

  /* ---------------------------------------------------------------------
     3.5 A carta
     --------------------------------------------------------------------- */
  function montarCarta() {
    const corpo = $('#folhaTexto');
    if (!corpo || !C.carta) return;
    const paragrafos = preencher(C.carta.texto || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    let atraso = 500;
    const passo = 82, pausa = 520;
    corpo.innerHTML = paragrafos.map(p => {
      const partes = [];
      let italico = false;
      p.split(/(\*|\n)/).forEach(seg => {
        if (seg === '*') { italico = !italico; return; }
        if (seg === '\n') { partes.push('<br>'); return; }
        seg.split(/\s+/).filter(Boolean).forEach(w => {
          atraso += passo;
          const t = escapar(w);
          partes.push(`<span class="palavra" style="--d:${atraso}ms">${italico ? `<em>${t}</em>` : t}</span>`);
        });
      });
      atraso += pausa;
      return `<p>${partes.join(' ').replace(/ <br> /g, '<br>')}</p>`;
    }).join('');
    /* a mesma carta, inteira, para leitores de tela */
    const leitor = document.createElement('div');
    leitor.className = 'sr';
    leitor.innerHTML = paragrafos.map(p => `<p>${formatar(p)}</p>`).join('');
    Array.from(corpo.children).forEach(p => p.setAttribute('aria-hidden', 'true'));
    corpo.prepend(leitor);
    $('#folha').style.setProperty('--d-fim', `${atraso + 200}ms`);
  }

  function iniciarCarta() {
    const env = $('#envelope'), botao = $('#cartaAbrir'), folha = $('#folha'), instr = $('.carta__instrucao'), reler = $('#cartaReler');
    if (!env || !botao || !folha) return;
    let aberta = false;
    function escrever() {
      folha.classList.remove('escrevendo', 'pronta');
      void folha.offsetWidth;
      requestAnimationFrame(() => folha.classList.add('escrevendo'));
    }
    function mostrarFolha() {
      env.closest('.carta__envelope').hidden = true;
      if (instr) instr.hidden = true;
      folha.hidden = false;
      requestAnimationFrame(() => {
        folha.classList.add('visivel');
        if (S.reduzir()) folha.classList.add('escrevendo', 'pronta'); else escrever();
        const r = folha.getBoundingClientRect();
        if (r.top < 60 || r.top > innerHeight * .4) S.irPara(folha);
        else folha.focus({ preventScroll: true });
      });
    }
    botao.addEventListener('click', () => {
      if (aberta) return;
      aberta = true;
      botao.setAttribute('aria-expanded', 'true');
      env.classList.add('abrindo');
      if (S.reduzir()) { setTimeout(mostrarFolha, 250); return; }
      setTimeout(() => env.classList.add('aba-atras'), 640);
      setTimeout(() => env.classList.add('puxando'), 760);
      setTimeout(() => env.classList.add('saindo'), 1750);
      setTimeout(mostrarFolha, 2350);
    });
    /* tocar na folha enquanto escreve mostra tudo de uma vez */
    folha.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      if (folha.classList.contains('escrevendo')) folha.classList.add('pronta');
    });
    if (reler) reler.addEventListener('click', escrever);
  }

  /* ---------------------------------------------------------------------
     3.6 Inventário: cada disco vira e mostra a mensagem
     --------------------------------------------------------------------- */
  function montarInventario() {
    const ul = $('#inventarioLista');
    if (!ul || !C.inventario) return;
    (C.inventario.itens || []).forEach((it, k) => {
      const d = foto(it.foto);
      if (!d || d.video) return;
      const li = document.createElement('li');
      li.className = 'disco';
      li.setAttribute('data-revelar', '');
      li.style.setProperty('--atraso', `${(k % 4) * .07}s`);
      const nome = textoPuro(it.nome), msg = textoPuro(it.mensagem);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'disco__botao';
      b.dataset.cursor = 'virar';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', `${nome}. Toque para ler.`);
      const giro = document.createElement('span');
      giro.className = 'disco__giro';
      const frente = document.createElement('span');
      frente.className = 'disco__frente';
      frente.setAttribute('aria-hidden', 'true');
      aplicarCores(frente, d);
      frente.style.setProperty('--foco', it.foco || d.foco);
      frente.style.setProperty('--zoom', String(it.zoom || 2));
      frente.appendChild(criarImg(d, { maior: true }));
      const verso = document.createElement('span');
      verso.className = 'disco__verso';
      verso.setAttribute('aria-hidden', 'true');
      verso.innerHTML = formatar(it.mensagem);
      giro.append(frente, verso);
      b.appendChild(giro);
      const p = document.createElement('p');
      p.className = 'disco__nome';
      p.innerHTML = `<span class="rotulo">${String(k + 1).padStart(2, '0')}</span><span>${formatar(it.nome)}</span>`;
      li.append(b, p);
      ul.appendChild(li);
      b.addEventListener('click', () => {
        const virado = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(virado));
        b.setAttribute('aria-label', virado ? `${nome}: ${msg}` : `${nome}. Toque para ler.`);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Vídeo da dança: toca sem som quando aparece; o botão liga o som
     --------------------------------------------------------------------- */
  function iniciarVideos() {
    const ouvir = textoPuro((C.capitulos && C.capitulos.jeito && C.capitulos.jeito.ouvir) || 'ouvir');
    const silenciar = textoPuro((C.capitulos && C.capitulos.jeito && C.capitulos.jeito.silenciar) || 'sem som');
    $$('.foto--video').forEach(fig => {
      const v = fig.querySelector('video'), som = fig.querySelector('.video__som');
      if (!v || !som) return;
      const rotulo = som.querySelector('span');
      const ui = () => {
        const ligado = !v.muted && !v.paused;
        som.setAttribute('aria-pressed', String(ligado));
        rotulo.textContent = ligado ? silenciar : ouvir;
        som.setAttribute('aria-label', ligado ? 'Desligar o som do vídeo' : 'Ouvir o vídeo com som');
      };
      const carregar = () => { if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src; };
      ui();
      let visivel = false;
      new IntersectionObserver(([e]) => {
        visivel = e.isIntersecting && e.intersectionRatio >= .4;
        if (visivel) {
          carregar();
          if (!S.reduzir() || !v.muted) v.play().catch(() => {});
        } else {
          v.pause();
          if (!v.muted) { v.muted = true; S.musica && S.musica.silenciar(false); }
        }
        ui();
      }, { threshold: [0, .4, .75] }).observe(fig);
      som.addEventListener('click', e => {
        e.stopPropagation();
        carregar();
        if (v.muted || v.paused) {
          v.muted = false;
          v.play().catch(() => {});
          S.musica && S.musica.silenciar(true);
        } else {
          v.muted = true;
          S.musica && S.musica.silenciar(false);
        }
        ui();
      });
      v.addEventListener('play', ui);
      v.addEventListener('pause', ui);
    });
  }

  /* ---------------------------------------------------------------------
     3.8 Segredos
     --------------------------------------------------------------------- */
  function iniciarFlores() {
    const botoes = $$('.flor-secreta');
    const total = botoes.length;
    if (!total) return;
    const cfg = SEG.flores || {};
    const achadas = new Set();
    botoes.forEach(b => {
      b.dataset.cursor = '?';
      b.addEventListener('click', () => {
        const id = b.dataset.flor || String(botoes.indexOf(b));
        if (achadas.has(id)) return;
        achadas.add(id);
        estouro(b);
        b.classList.add('achada');
        b.setAttribute('aria-hidden', 'true');
        b.tabIndex = -1;
        const faltam = total - achadas.size;
        if (faltam > 0) {
          S.avisar(formatar(cfg.achou || 'Uma flor escondida. Faltam {faltam}.', { faltam }));
          return;
        }
        /* a legenda do visor já diz tudo: sem aviso repetido por cima da foto */
        const d = foto(cfg.foto);
        setTimeout(() => {
          S.chuva(40);
          if (d) S.visor.abrir([{ d, titulo: cfg.todas, texto: textoPuro(cfg.legenda || d.legenda) }], 0, null);
          else S.avisar(formatar(cfg.todas || ''));
        }, 750);
      });
    });
  }

  function iniciarCoracao() {
    const b = $('#coracao');
    if (!b) return;
    b.dataset.cursor = '?';
    b.addEventListener('click', () => {
      b.classList.add('aceso');
      estouro(b, 7);
      S.avisar(formatar(SEG.coracao || ''));
    });
  }

  /* digitar o nome dela no teclado faz chover flor */
  function iniciarDigitar() {
    const palavra = ((SEG.digitar && SEG.digitar.palavra) || '').toLowerCase();
    if (!palavra) return;
    let buffer = '';
    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      const alvo = e.target;
      if (alvo && (alvo.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName))) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-palavra.length);
      if (buffer === palavra) {
        buffer = '';
        S.chuva(46);
        S.avisar(formatar(SEG.digitar.mensagem || ''));
      }
    });
  }

  /* no celular: segurar o dedo no nome */
  function iniciarToqueLongo() {
    const nome = $('.hero__nome');
    if (!nome || !SEG.toqueLongo) return;
    let t = 0, x = 0, y = 0;
    const cancelar = () => clearTimeout(t);
    nome.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      x = e.clientX; y = e.clientY;
      cancelar();
      t = setTimeout(() => { S.chuva(40); S.avisar(formatar(SEG.toqueLongo)); }, 650);
    });
    nome.addEventListener('pointermove', e => { if (Math.hypot(e.clientX - x, e.clientY - y) > 10) cancelar(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => nome.addEventListener(ev, cancelar));
    nome.addEventListener('contextmenu', e => e.preventDefault());
  }

  /* a luz que sobra no fim */
  function iniciarLuzFinal() {
    const luz = $('#fimLuz'), ps = $('#fimPs');
    if (!luz || !ps) return;
    luz.addEventListener('click', () => {
      const acesa = !luz.classList.contains('acesa');
      luz.classList.toggle('acesa', acesa);
      luz.setAttribute('aria-expanded', String(acesa));
      if (acesa) {
        ps.hidden = false;
        ps.classList.remove('visivel');
        void ps.offsetWidth;
        ps.classList.add('visivel');
        S.chuva(30);
      } else ps.hidden = true;
    });
  }

  /* links da música no final */
  function montarLinks() {
    const box = $('#fimLinks'), cfg = C.musica || {};
    if (!box) return;
    if (!cfg.titulo) { const m = $('#fimMusica'); if (m) m.hidden = true; return; }
    box.innerHTML = (cfg.links || []).filter(l => l && l.url && /^https:\/\//.test(l.url))
      .map(l => `<a href="${escapar(l.url)}" target="_blank" rel="noopener">${escapar(l.nome || 'ouvir')}</a>`).join('');
  }

  S.registrar({
    montar() {
      montarCarta();
      montarInventario();
      montarLinks();
    },
    iniciar() {
      iniciarCarta();
      iniciarVideos();
      iniciarFlores();
      iniciarCoracao();
      iniciarDigitar();
      iniciarToqueLongo();
      iniciarLuzFinal();
    }
  });
})();
