(() => {
  'use strict';

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Mobile navigation
  const menuButton = qs('.menu-toggle');
  const menu = qs('.nav-links');
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('open', !expanded);
    });

    qsa('a', menu).forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
      });
    });
  }

  // Soft transitions between internal pages.
  qsa('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') || link.target === '_blank') return;
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      document.body.classList.add('page-leaving');
      window.setTimeout(() => { window.location.href = href; }, 210);
    });
  });

  // Reveal on scroll
  const revealItems = qsa('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  // Gentle portrait parallax
  const portraitStage = qs('.portrait-stage');
  if (portraitStage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    portraitStage.addEventListener('pointermove', (event) => {
      const rect = portraitStage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      portraitStage.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${y * -4}deg)`;
    });
    portraitStage.addEventListener('pointerleave', () => {
      portraitStage.style.transform = '';
    });
  }

  // About-page skill bubbles.
  const bubbleInfo = qs('.bubble-info');
  const bubbles = qsa('.skill-bubble');
  if (bubbleInfo && bubbles.length) {
    const defaultText = bubbleInfo.textContent;
    const showBubble = (bubble) => {
      bubbleInfo.textContent = bubble.dataset.description || defaultText;
      bubbleInfo.classList.add('show');
    };
    bubbles.forEach((bubble) => {
      ['mouseenter', 'focus', 'click'].forEach((eventName) => bubble.addEventListener(eventName, () => showBubble(bubble)));
      bubble.addEventListener('mouseleave', () => bubbleInfo.classList.remove('show'));
      bubble.addEventListener('blur', () => bubbleInfo.classList.remove('show'));
    });
  }

  // Research ecosystem interactions.
  const networkNodes = qsa('.network-node');
  const networkInfo = qs('.network-info');
  const networkLines = qsa('.network-lines line');
  if (networkNodes.length && networkInfo) {
    const resetNetwork = () => {
      networkNodes.forEach((node) => node.classList.remove('active', 'dim'));
      networkLines.forEach((line) => line.classList.remove('active'));
      networkInfo.textContent = 'Choose a research topic to explore how it connects to the microbiome.';
    };

    const activateNode = (node) => {
      const id = node.dataset.node;
      networkNodes.forEach((other) => {
        other.classList.toggle('active', other === node || other.dataset.node === 'microbiome');
        other.classList.toggle('dim', other !== node && other.dataset.node !== 'microbiome');
      });
      networkLines.forEach((line) => line.classList.toggle('active', line.dataset.target === id || id === 'microbiome'));
      networkInfo.textContent = node.dataset.description || networkInfo.textContent;
    };

    networkNodes.forEach((node) => {
      ['mouseenter', 'focus', 'click'].forEach((eventName) => node.addEventListener(eventName, () => activateNode(node)));
      node.addEventListener('mouseleave', () => {
        if (document.activeElement !== node) resetNetwork();
      });
      node.addEventListener('blur', resetNetwork);
    });
  }

  // Journey page: one real-world map with country-specific academic, work, stay, and conference details.
  const countryData = {
    Vietnam: {
      summary: 'Study · Laboratory leadership · Technology transfer · Training',
      activities: [
        { date: '2014–2019', title: 'Bachelor of Science in Aquaculture — Can Tho University', type: 'study', category: 'Study' },
        { date: 'Aug 2022–Nov 2023', title: 'Lab Manager — KYTOS Vietnam', type: 'work', category: 'Work' },
        { date: 'Nov 2023–Apr 2026', title: 'Lab Manager — KYTOS Vietnam', type: 'work', category: 'Work' },
        { date: '2024', title: 'DeltaVax Project — Professional training on microbiome monitoring', type: 'conference', category: 'Training' }
      ]
    },
    Taiwan: {
      summary: 'International research experience',
      activities: [
        { date: 'Feb–Jun 2018', title: 'Research Stay — National Taiwan Ocean University (NTOU)', type: 'stay', category: 'Research stay' }
      ]
    },
    Belgium: {
      summary: 'Study · PhD research · R&D · Scientific events',
      activities: [
        { date: '2019–2021', title: 'Master of Science in Aquaculture — Ghent University', type: 'study', category: 'Study' },
        { date: 'Nov 2023–Present', title: 'PhD Researcher — Ghent University', type: 'study', category: 'PhD' },
        { date: 'Nov 2023–Nov 2027', title: 'VLAIO Baekeland PhD Mandate', type: 'study', category: 'Fellowship' },
        { date: 'Nov 2023–Apr 2026', title: 'Research Assistant — KYTOS Belgium', type: 'work', category: 'Work' },
        { date: '2024', title: '8th Fish & Shellfish Larviculture Symposium — Speaker', type: 'conference', category: 'Conference' },
        { date: '2025', title: 'Microbiome Engineering — Poster', type: 'conference', category: 'Conference' },
        { date: 'Apr 2026–Present', title: 'R&D Team Leader — KYTOS Belgium', type: 'work', category: 'Work' }
      ]
    },
    Malaysia: {
      summary: 'WorldFish internship · Remote collaboration',
      activities: [
        { date: 'Dec 2021–Dec 2022', title: 'Internship — WorldFish (Malaysia / Remote)', type: 'stay', category: 'Internship' }
      ]
    },
    Thailand: {
      summary: 'Research stay · Scientific presentation',
      activities: [
        { date: '2018', title: '8th International Fisheries Symposium — Speaker', type: 'conference', category: 'Conference' },
        { date: 'Oct–Dec 2024', title: 'Research Stay — BIOTEC', type: 'stay', category: 'Research stay' }
      ]
    },
    Singapore: {
      summary: 'International conference presentations',
      activities: [
        { date: '2022', title: 'World Aquaculture Singapore — Speaker', type: 'conference', category: 'Conference' },
        { date: '2026', title: 'World Aquaculture Singapore — Speaker', type: 'conference', category: 'Conference' }
      ]
    },
    Spain: {
      summary: 'International conference poster',
      activities: [
        { date: '2025', title: 'European Aquaculture — Poster', type: 'conference', category: 'Conference' }
      ]
    }
  };

  const countryPanelTitle = qs('#country-panel-title');
  const countryPanelSub = qs('#country-panel-sub');
  const countryEvents = qs('#country-events');
  const markers = qsa('.location-marker');

  const eventColor = {
    study: 'var(--sky)',
    work: 'var(--sage)',
    stay: 'var(--peach)',
    conference: 'var(--pink)'
  };

  const renderCountry = (country) => {
    const data = countryData[country];
    if (!data || !countryPanelTitle || !countryEvents) return;
    markers.forEach((marker) => marker.classList.toggle('active', marker.dataset.country === country));
    countryPanelTitle.textContent = country;
    countryPanelSub.textContent = data.summary;
    countryEvents.innerHTML = data.activities.map((activity) => `
      <div class="country-event" style="--event-color:${eventColor[activity.type]}">
        <span>${activity.date} · ${activity.category}</span>
        <strong>${activity.title}</strong>
      </div>
    `).join('');
  };

  markers.forEach((marker) => {
    marker.addEventListener('click', () => renderCountry(marker.dataset.country));
  });

  qsa('[data-show-country]').forEach((button) => {
    button.addEventListener('click', () => {
      const country = button.dataset.showCountry;
      renderCountry(country);
      qs('#journey-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (countryPanelTitle) renderCountry('Belgium');
})();
