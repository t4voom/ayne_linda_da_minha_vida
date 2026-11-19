/* ==========================================================================
   animations.js — movimento
   Rolagem com inércia (só no computador), textos que sobem palavra por
   palavra, cortina nas fotos, paralaxe discreta, o zoom da flor amarela,
   a entrada do hero, o anoitecer do final e o cursor.
   Tudo respeita "reduzir movimento" do sistema.
   ========================================================================== */
(() => {
  'use strict';
  const S = window.SITE;
  if (!S) return;
  const { $, $$, limitar } = S;
  const raiz = document.documentElement;
  const easeInOut = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const easeOut = k => 1 - Math.pow(1 - k, 3);

  /* ---------------------------------------------------------------------
     Rolagem com inércia: roda do mouse/trackpad no computador.
     A página continua usando a rolagem nativa (sticky e teclado funcionam).
     --------------------------------------------------------------------- */
  const Rolagem = (() => {
    const ativo = S.fino() && !S.reduzir() && !(S.C.opcoes && S.C.opcoes.rolagemSuave === false);
    let alvo = window.scrollY, atual = alvo, rodando = false, travado = false, animando = false;
    const maxY = () => raiz.scrollHeight - innerHeight;

    function rolavel(el, dy) {
      while (el && el !== document.body && el !== raiz) {
        if (el.nodeType === 1) {
          const st = getComputedStyle(el);
          if (/(auto|scroll)/.test(st.overflowY) && el.scrollHeight > el.clientHeight + 1) {
            if ((dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) || (dy < 0 && el.scrollTop > 0)) return true;
          }
        }
        el = el.parentElement;
      }
      return false;
    }
    function roda() {
      atual += (alvo - atual) * .1;
      if (Math.abs(alvo - atual) < .5) { atual = alvo; rodando = false; }
      window.scrollTo(0, atual);
      if (rodando) requestAnimationFrame(roda);
    }
    function aoGirar(e) {
      if (travado || e.ctrlKey || e.defaultPrevented) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (rolavel(e.target, e.deltaY)) return;
      e.preventDefault();
      animando = false;
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 36; else if (e.deltaMode === 2) d *= innerHeight * .9;
      if (!rodando) { atual = alvo = window.scrollY; }
      alvo = limitar(alvo + d, 0, maxY());
      if (!rodando) { rodando = true; requestAnimationFrame(roda); }
    }
    if (ativo) {
      raiz.classList.add('rolagem-suave');
      addEventListener('wheel', aoGirar, { passive: false });
      addEventListener('scroll', () => { if (!rodando && !animando) atual = alvo = window.scrollY; }, { passive: true });
    }
    S.ouvir('travar', v => { travado = v; rodando = false; animando = false; });

    function para(y) {
      y = limitar(y, 0, maxY());
      if (S.reduzir()) { window.scrollTo(0, y); return; }
      if (!ativo) { window.scrollTo({ top: y, behavior: 'smooth' }); return; }
      const y0 = window.scrollY, dy = y - y0;
      const dur = limitar(Math.abs(dy) * .3, 700, 2000);
      let t0 = 0;
      rodando = false; animando = true;
      const q = t => {
        if (!animando) return;
        if (!t0) t0 = t;
        const k = Math.min(1, (t - t0) / dur);
        const v = y0 + dy * easeInOut(k);
        window.scrollTo(0, v);
        atual = alvo = v;
        if (k < 1) requestAnimationFrame(q); else animando = false;
      };
      requestAnimationFrame(q);
    }
    return { ativo, para };
  })();

  S.irPara = alvo => {
    const el = typeof alvo === 'string' ? document.getElementById(alvo.replace(/^#/, '')) : alvo;
    if (!el) return;
    Rolagem.para(el.getBoundingClientRect().top + window.scrollY);
    if (el.focus) el.focus({ preventScroll: true });
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || a.closest('#menu')) return;
    const id = a.getAttribute('href').slice(1);
    const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    S.irPara(el);
  });

  /* ---------------------------------------------------------------------
     Texto em palavras (cada uma sobe de dentro de uma máscara)
     --------------------------------------------------------------------- */
  function dividir(el) {
    if (el.dataset.dividido) return;
    el.dataset.dividido = '1';
    /* leitores de tela recebem o texto inteiro; as palavras animadas ficam escondidas deles */
    const leitor = document.createElement('span');
    leitor.className = 'sr';
    leitor.textContent = el.textContent;
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    while (el.firstChild) visual.appendChild(el.firstChild);
    el.append(leitor, visual);
    el = visual;
    let i = 0;
    const percorrer = no => {
      Array.from(no.childNodes).forEach(filho => {
        if (filho.nodeType === 3) {
          const frag = document.createDocumentFragment();
          filho.textContent.split(/(\s+)/).forEach(parte => {
            if (!parte) return;
            if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(' ')); return; }
            const fora = document.createElement('span');
            fora.className = 'p';
            const dentro = document.createElement('span');
            dentro.className = 'p__i';
            dentro.style.setProperty('--i', i++);
            dentro.textContent = parte;
            fora.appendChild(dentro);
            frag.appendChild(fora);
          });
          filho.replaceWith(frag);
        } else if (filho.nodeType === 1 && filho.tagName !== 'BR') percorrer(filho);
      });
    };
    percorrer(el);
    el.parentElement.setAttribute('data-revelar', 'texto');
  }
  S.dividir = dividir;

  /* ---------------------------------------------------------------------
     Revelações ao rolar
     --------------------------------------------------------------------- */
  let observador = null;
  function iniciarRevelar() {
    const els = $$('[data-revelar]');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('revelado')); return; }
    observador = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revelado'); observador.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .1 });
    els.forEach(e => { if (!e.closest('.hero')) observador.observe(e); });
  }
  S.revelar = el => {
    if (observador) observador.observe(el);
    else el.classList.add('revelado');
  };

  /* ---------------------------------------------------------------------
     Paralaxe: a foto anda um pouco mais devagar que a moldura
     --------------------------------------------------------------------- */
  function iniciarParalaxe() {
    if (S.reduzir()) return;
    const itens = $$('[data-paralaxe]').map(fig => ({
      fig,
      moldura: fig.querySelector('.foto__moldura'),
      alvo: fig.querySelector('.foto__px'),
      v: parseFloat(fig.dataset.paralaxe) || .06,
      ativo: false
    })).filter(i => i.alvo && i.moldura && !i.fig.hidden);
    if (!itens.length) return;
    itens.forEach(i => i.fig.classList.add('com-paralaxe'));
    const io = new IntersectionObserver(es => es.forEach(e => {
      const it = itens.find(i => i.fig === e.target);
      if (it) it.ativo = e.isIntersecting;
    }), { rootMargin: '25% 0px' });
    itens.forEach(i => io.observe(i.fig));
    S.aoRolar(() => {
      const meio = innerHeight / 2;
      for (const i of itens) {
        if (!i.ativo) continue;
        const r = i.moldura.getBoundingClientRect();
        const max = r.height * .085;
        const dy = limitar(-(r.top + r.height / 2 - meio) * i.v, -max, max);
        i.alvo.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
      }
    });
  }

  /* ---------------------------------------------------------------------
     II · O zoom da flor: começa no close e abre até a foto inteira
     --------------------------------------------------------------------- */
  function iniciarZoom() {
    const sec = $('#zoom');
    const fig = sec && $('.zoom__foto', sec);
    if (!sec || !fig || fig.hidden) { if (sec) sec.hidden = !fig || fig.hidden; return; }
    if (S.reduzir()) { sec.classList.add('estatico'); return; }
    const palco = $('.zoom__palco', sec);
    const t1 = $('.zoom__texto--1', sec), t2 = $('.zoom__texto--2', sec), veu = $('.zoom__veu', sec);
    const d = S.foto(fig.dataset.id);
    const [fx, fy] = (d.foco || '50% 50%').split(/\s+/).map(v => limitar(parseFloat(v) / 100, .05, .95));
    const ar = d.w && d.h ? d.w / d.h : 3 / 4;
    let g = null, ativo = false;

    function medir() {
      const vw = innerWidth, vh = palco.clientHeight;
      const desk = vw >= 900;
      let h = desk ? vh * .8 : Math.min(vh * .64, (vw * .84) / ar);
      let w = h * ar;
      const cx = desk ? vw * .62 : vw / 2;
      const cy = desk ? vh / 2 : vh * .42;
      const left = cx - w / 2, top = cy - h / 2;
      Object.assign(fig.style, { width: w + 'px', height: h + 'px', left: left + 'px', top: top + 'px', transformOrigin: `${fx * 100}% ${fy * 100}%` });
      const Fx = left + fx * w, Fy = top + fy * h;
      const s0 = Math.max(Fx / (fx * w), (vw - Fx) / ((1 - fx) * w), Fy / (fy * h), (vh - Fy) / ((1 - fy) * h)) * 1.18;
      g = { s0, vh };
      atualizar();
    }
    function atualizar() {
      if (!g) return;
      const r = sec.getBoundingClientRect();
      const total = r.height - g.vh;
      const p = limitar(-r.top / total, 0, 1);
      const k = easeInOut(limitar((p - .04) / .66, 0, 1));
      const s = g.s0 + (1 - g.s0) * k;
      fig.style.transform = `scale(${s.toFixed(4)})`;
      const a1 = 1 - limitar((p - .2) / .14, 0, 1);
      t1.style.opacity = a1.toFixed(3);
      t1.style.transform = `translate3d(0, ${(-30 * (1 - a1)).toFixed(1)}px, 0)` + (innerWidth >= 900 ? ' translateY(-50%)' : '');
      const a2 = limitar((p - .58) / .14, 0, 1);
      t2.style.opacity = a2.toFixed(3);
      t2.style.transform = `translate3d(0, ${(24 * (1 - a2)).toFixed(1)}px, 0)` + (innerWidth >= 900 ? ' translateY(-50%)' : '');
      veu.style.opacity = (1 - k * .85).toFixed(3);
    }
    new IntersectionObserver(([e]) => { ativo = e.isIntersecting; if (ativo) atualizar(); }, { rootMargin: '10% 0px' }).observe(sec);
    addEventListener('resize', medir);
    S.aoRolar(() => { if (ativo) atualizar(); });
    medir();
  }

  /* ---------------------------------------------------------------------
     Hero: letras do nome, entrada depois da íris e profundidade ao rolar
     --------------------------------------------------------------------- */
  function montarHero() {
    const h1 = $('.hero__nome');
    const alvo = h1 && h1.querySelector('span');
    if (!alvo) return;
    const texto = alvo.textContent.trim();
    h1.setAttribute('aria-label', texto);
    alvo.setAttribute('aria-hidden', 'true');
    alvo.textContent = '';
    Array.from(texto).forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'letra';
      s.style.setProperty('--i', i);
      s.textContent = ch;
      alvo.appendChild(s);
    });
  }
  function iniciarHero() {
    const hero = $('.hero');
    if (!hero) return;
    S.ouvir('abrindo', () => hero.classList.add('entrou'));
    if (S.reduzir()) return;
    const foto = $('.hero__foto', hero), conteudo = $('.hero__conteudo', hero);
    S.aoRolar(y => {
      const h = hero.offsetHeight;
      if (y > h) return;
      const k = y / h;
      foto.style.transform = `translate3d(0, ${(y * .28).toFixed(1)}px, 0)`;
      conteudo.style.transform = `translate3d(0, ${(-y * .1).toFixed(1)}px, 0)`;
      conteudo.style.opacity = (1 - easeOut(limitar(k * 1.5, 0, 1))).toFixed(3);
    });
  }

  /* ---------------------------------------------------------------------
     Fim: o dia vai escurecendo enquanto a foto sobe
     --------------------------------------------------------------------- */
  function iniciarFim() {
    const dia = $('#fimDia'), veu = $('#fimVeu');
    const px = dia && $('.fim__foto .foto__px', dia);
    if (!dia || !veu || !px || S.reduzir()) return;
    let ativo = false;
    new IntersectionObserver(([e]) => { ativo = e.isIntersecting; }).observe(dia);
    S.aoRolar(() => {
      if (!ativo) return;
      const r = dia.getBoundingClientRect(), vh = innerHeight;
      const q = limitar((vh - r.top) / (vh + r.height), 0, 1);
      px.style.transform = `scale(${(1.12 - .12 * easeOut(limitar(q * 1.6, 0, 1))).toFixed(4)})`;
      veu.style.opacity = (easeInOut(limitar((q - .58) / .42, 0, 1)) * .88).toFixed(3);
    });
  }

  /* ---------------------------------------------------------------------
     Cursor: um selo que diz o que o clique faz (só com mouse)
     --------------------------------------------------------------------- */
  function iniciarCursor() {
    const c = $('#cursor');
    if (!c || !S.fino() || S.reduzir()) { if (c) c.hidden = true; return; }
    const rotulo = c.querySelector('span');
    let x = -200, y = -200, cx = x, cy = y, rodando = false, ativo = false, dentro = false, ultimaChecagem = 0;
    const loop = () => {
      cx += (x - cx) * .22; cy += (y - cy) * .22;
      c.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (Math.abs(x - cx) + Math.abs(y - cy) > .4) requestAnimationFrame(loop); else rodando = false;
    };
    const apagar = () => { if (ativo) { ativo = false; c.classList.remove('ativo'); } };
    function checar(alvoBruto) {
      const alvo = alvoBruto && alvoBruto.closest ? alvoBruto.closest('[data-cursor]') : null;
      if (alvo && dentro) {
        if (rotulo.textContent !== alvo.dataset.cursor) rotulo.textContent = alvo.dataset.cursor;
        if (!ativo) { ativo = true; c.classList.add('ativo'); cx = x; cy = y; }
      } else apagar();
    }
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY; dentro = true;
      checar(e.target);
      if (!rodando) { rodando = true; requestAnimationFrame(loop); }
    }, { passive: true });
    /* rolando com o mouse parado, o que está embaixo dele muda */
    let fimRolagem = 0;
    S.aoRolar(() => {
      if (!dentro) return;
      clearTimeout(fimRolagem);
      fimRolagem = setTimeout(() => checar(document.elementFromPoint(x, y)), 120);
      const agora = performance.now();
      if (agora - ultimaChecagem < 90) return;
      ultimaChecagem = agora;
      checar(document.elementFromPoint(x, y));
    });
    raiz.addEventListener('mouseleave', () => { dentro = false; apagar(); });
    S.ouvir('travar', v => { if (v) apagar(); });
  }

  S.registrar({
    montar() {
      montarHero();
      $$('[data-dividir]').forEach(dividir);
    },
    iniciar() {
      iniciarRevelar();
      iniciarParalaxe();
      iniciarZoom();
      iniciarHero();
      iniciarFim();
      iniciarCursor();
    }
  });
})();
