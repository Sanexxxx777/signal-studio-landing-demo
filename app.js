(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // stagger rise
  var batch = [], flush;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      batch.push(e.target);
      io.unobserve(e.target);
    });
    if (batch.length && !flush) {
      flush = requestAnimationFrame(function () {
        batch.forEach(function (el, i) {
          el.style.transitionDelay = reduce ? '0s' : (i * 55) + 'ms';
          el.classList.add('in');
        });
        batch = [];
        flush = null;
      });
    }
  }, { threshold: 0.05, rootMargin: '0px 0px 220px 0px' });
  document.querySelectorAll('.rise').forEach(function (el) { io.observe(el); });

  // scroll progress bar
  if (!reduce) {
    var bar = document.createElement('div');
    bar.className = 'progress';
    document.body.appendChild(bar);
    var ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement;
        var p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
        bar.style.transform = 'scaleX(' + p + ')';
        ticking = false;
      });
    }, { passive: true });
  }

  // counters
  function tween(el) {
    var text = el.textContent;
    var m = text.match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return;
    var raw = m[1];
    var comma = raw.indexOf(',') > -1;
    var target = parseFloat(raw.replace(',', '.'));
    var decimals = (raw.split(/[.,]/)[1] || '').length;
    var start = null, dur = 650;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      if (comma) val = val.replace('.', ',');
      el.textContent = text.replace(raw, val);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = text;
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) {
    var seen = new WeakSet();
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !seen.has(e.target)) {
          seen.add(e.target);
          tween(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px 220px 0px' });
    document.querySelectorAll('.nums b, .work-card__nums b, .nums-side b').forEach(function (el) { cio.observe(el); });
  }

  // card tilt
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.work-card').forEach(function (card) {
      var raf = null;
      card.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
          var ry = ((e.clientX - r.left) / r.width - 0.5) * 4;
          card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-3px)';
          raf = null;
        });
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
  }

  // lead modal
  var modal = document.getElementById('lead-modal');
  if (modal) {
    var lastFocus = null;
    function openModal(e) {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      var first = modal.querySelector('input');
      if (first) first.focus();
    }
    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    document.querySelectorAll('[data-modal-open]').forEach(function (el) {
      el.addEventListener('click', openModal);
    });
    modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
    var form = modal.querySelector('[data-lead-form]');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      modal.classList.add('sent');
      modal.querySelector('.modal__ok').classList.add('show');
      setTimeout(function () {
        closeModal();
        setTimeout(function () { modal.classList.remove('sent'); form.reset(); }, 400);
      }, 2200);
    });
  }
})();
