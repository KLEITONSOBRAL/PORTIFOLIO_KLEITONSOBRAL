(() => {
  "use strict";

  const GITHUB_USER = "KLEITONSOBRAL";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".nav-links");
  const projectsGrid = document.querySelector("#projects-grid");
  const projectsMessage = document.querySelector("#projects-message");
  const repositoryCount = document.querySelector("#repository-count");
  const currentYear = document.querySelector("#current-year");
  const scrollTopLinks = [...document.querySelectorAll("[data-scroll-top]")];

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  scrollTopLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setMenu(false);
      window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? "auto" : "smooth" });
      if (history.replaceState) history.replaceState(null, "", "#inicio");
    });
  });


  const hero = document.querySelector(".hero");
  const heroLines = [...document.querySelectorAll(".mega-line")];
  const skillRows = [...document.querySelectorAll(".skill-row")];
  const ingredientsRail = document.querySelector(".ingredients-rail");
  const ingredientItems = [...document.querySelectorAll(".ingredients-track span")];

  function updateCenteredIngredient() {
    if (!ingredientsRail || !ingredientItems.length) return;

    const railRect = ingredientsRail.getBoundingClientRect();
    const viewportCenter = window.innerWidth / 2;
    const railIsVisible = railRect.bottom > 0 && railRect.top < window.innerHeight;

    if (railIsVisible) {
      let closestItem = null;
      let closestDistance = Infinity;

      ingredientItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(itemCenter - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestItem = item;
        }
      });

      ingredientItems.forEach((item) => item.classList.toggle("is-center", item === closestItem));
    } else {
      ingredientItems.forEach((item) => item.classList.remove("is-center"));
    }

    requestAnimationFrame(updateCenteredIngredient);
  }

  requestAnimationFrame(updateCenteredIngredient);

  function setHeroLineActive(activeLine) {
    const nudge = window.innerWidth <= 600 ? 8 : window.innerWidth <= 900 ? 16 : 28;

    heroLines.forEach((line) => {
      const isActive = line === activeLine;
      line.classList.toggle("is-hovered", isActive);
      line.classList.toggle("is-muted", Boolean(activeLine) && !isActive);

      const label = line.querySelector("b");
      if (!label) return;

      // Estado do hover aplicado diretamente para não depender de GSAP,
      // :hover ou detecção de tipo de ponteiro. A transição continua no CSS.
      if (isActive) {
        line.style.transform = `translateX(${nudge}px) rotate(0deg) scale(1.02)`;
        line.style.opacity = "1";
        label.style.color = "#ffffff";
      } else {
        line.style.removeProperty("transform");
        line.style.removeProperty("opacity");
        label.style.removeProperty("color");
      }
    });
  }

  function initPointerInteractions() {
    // O hero sempre recebe pointerenter/pointerleave. Isso evita depender
    // da detecção de "pointer: fine" para o hover funcionar.
    heroLines.forEach((line) => {
      line.addEventListener("pointerenter", () => setHeroLineActive(line));
      line.addEventListener("pointerleave", () => setHeroLineActive(null));
    });

    if (!finePointer) return;

    skillRows.forEach((row) => {
      row.addEventListener("pointermove", (event) => {
        const rect = row.getBoundingClientRect();
        row.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        row.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });
  }

  const profilePhoto = document.querySelector(".profile-photo");
  const portraitWrap = document.querySelector(".portrait-wrap");

  if (profilePhoto) {
    profilePhoto.addEventListener("error", () => {
      const fallbackSrc = profilePhoto.dataset.fallbackSrc;
      if (fallbackSrc && !profilePhoto.dataset.fallbackUsed) {
        profilePhoto.dataset.fallbackUsed = "true";
        profilePhoto.src = fallbackSrc;
        return;
      }
      profilePhoto.closest(".portrait-wrap")?.classList.add("photo-error");
    });
  }

  // Interação da foto: elevação + leve tilt seguindo o cursor.
  // O efeito atua no wrapper, separado das animações de scroll do hero-profile.
  if (portraitWrap && !reducedMotion) {
    const resetPortrait = () => {
      portraitWrap.classList.remove("is-photo-hovered");
      portraitWrap.style.setProperty("--photo-rx", "0deg");
      portraitWrap.style.setProperty("--photo-ry", "0deg");
      portraitWrap.style.setProperty("--shine-x", "50%");
      portraitWrap.style.setProperty("--shine-y", "50%");
      portraitWrap.style.removeProperty("--photo-scale");
    };

    portraitWrap.addEventListener("pointerenter", () => {
      portraitWrap.classList.add("is-photo-hovered");
      portraitWrap.style.setProperty("--photo-scale", "1.035");
    });

    portraitWrap.addEventListener("pointermove", (event) => {
      const rect = portraitWrap.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 14;
      const rotateX = (0.5 - y) * 12;

      portraitWrap.style.setProperty("--photo-rx", `${rotateX.toFixed(2)}deg`);
      portraitWrap.style.setProperty("--photo-ry", `${rotateY.toFixed(2)}deg`);
      portraitWrap.style.setProperty("--shine-x", `${(x * 100).toFixed(1)}%`);
      portraitWrap.style.setProperty("--shine-y", `${(y * 100).toFixed(1)}%`);
    });

    portraitWrap.addEventListener("pointerleave", resetPortrait);
    portraitWrap.addEventListener("pointercancel", resetPortrait);
  }

  function updateHeader() {
    header?.classList.toggle("scrolled", window.scrollY > 20);
  }

  function setMenu(open) {
    if (!menuButton || !nav) return;
    nav.classList.toggle("open", open);
    menuButton.classList.toggle("active", open);
    document.body.classList.toggle("menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        setMenu(false);
        menuButton.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && nav.classList.contains("open")) setMenu(false);
    });
  }

  const sectionLinks = nav ? [...nav.querySelectorAll('a[href^="#"]')].filter((link) => link.getAttribute("href") !== "#contato") : [];
  const trackedSections = sectionLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && sectionLinks.length && trackedSections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = `#${visible.target.id}`;
      sectionLinks.forEach((link) => link.classList.toggle("is-current", link.getAttribute("href") === id));
    }, { rootMargin: "-34% 0px -52% 0px", threshold: [0, .08, .2, .45] });
    trackedSections.forEach((section) => sectionObserver.observe(section));
  }

  let gsapReady = false;

  function animateProjectCards() {
    if (!gsapReady || reducedMotion || !projectsGrid) return;
    const cards = [...projectsGrid.querySelectorAll(".project-card")];
    if (!cards.length) return;

    window.gsap.from(cards, {
      opacity: 0,
      y: 36,
      duration: .75,
      stagger: .08,
      ease: "power3.out",
      clearProps: "opacity,transform",
      scrollTrigger: { trigger: projectsGrid, start: "top 88%", once: true }
    });
    window.ScrollTrigger.refresh();
  }

  function initAnimations() {
    if (reducedMotion || !window.gsap || !window.ScrollTrigger) return;

    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    gsapReady = true;

    gsap.timeline({ defaults: { ease: "power4.out" } })
      .from(".hero-typewall", { x: 70, opacity: 0, duration: 1.05, clearProps: "opacity,transform" })
      .from(".js-hero-item", { y: 28, opacity: 0, duration: .7, stagger: .07, clearProps: "opacity,transform" }, "-=.65")
      .from(".scroll-cue", { opacity: 0, y: -10, duration: .5 }, "-=.25");

    gsap.to(".scroll-progress", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: .1 }
    });

    if (hero) {
      gsap.to(".hero-typewall", {
        y: -34,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 }
      });
    }

    if (finePointer) {
      gsap.to(".hero-profile", {
        y: -52,
        rotate: -1.5,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
      });
    }

    document.querySelectorAll(".reveal-once").forEach((element) => {
      gsap.from(element, {
        opacity: 0,
        y: 36,
        duration: .8,
        ease: "power3.out",
        clearProps: "opacity,transform",
        scrollTrigger: { trigger: element, start: "top 88%", once: true }
      });
    });

    document.querySelectorAll(".reveal-group").forEach((group) => {
      const children = [...group.children];
      if (!children.length) return;
      gsap.from(children, {
        opacity: 0,
        y: 28,
        duration: .68,
        stagger: .07,
        ease: "power3.out",
        clearProps: "opacity,transform",
        scrollTrigger: { trigger: group, start: "top 88%", once: true }
      });
    });

    gsap.fromTo(".contact-backdrop",
      { rotate: -6, scale: .96, opacity: .55 },
      { rotate: -3.5, scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: ".contact", start: "top 85%", end: "center 55%", scrub: .7 } }
    );

    animateProjectCards();
  }

  function formatRepositoryName(name) {
    return String(name || "Projeto").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function formatDate(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "recentemente";
    return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(date).replace(" de ", " ");
  }

  function createProjectCard(repository, index) {
    const link = document.createElement("a");
    link.className = "project-card";
    link.href = repository.html_url || `https://github.com/${GITHUB_USER}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Abrir o projeto ${formatRepositoryName(repository.name)} no GitHub`);

    const top = document.createElement("div");
    top.className = "project-top";
    const number = document.createElement("span");
    number.textContent = `WORK / ${String(index + 1).padStart(2, "0")}`;
    const arrow = document.createElement("span");
    arrow.className = "project-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    top.append(number, arrow);

    const title = document.createElement("h3");
    title.textContent = formatRepositoryName(repository.name);
    const description = document.createElement("p");
    description.textContent = repository.description || "Projeto disponível para consulta no GitHub.";

    const meta = document.createElement("div");
    meta.className = "project-meta";
    const language = document.createElement("span");
    language.className = "project-language";
    language.textContent = repository.language || "Repositório";
    const updated = document.createElement("span");
    updated.textContent = `Atualizado ${formatDate(repository.updated_at)}`;
    meta.append(language, updated);

    link.append(top, title, description, meta);
    return link;
  }

  function renderProjects(repositories, message = "") {
    if (!projectsGrid) return;
    projectsGrid.replaceChildren();
    repositories.forEach((repository, index) => projectsGrid.appendChild(createProjectCard(repository, index)));
    if (projectsMessage) {
      projectsMessage.textContent = message;
      projectsMessage.hidden = !message;
    }
    animateProjectCards();
  }

  function fallbackProjects() {
    renderProjects([
      { name: "ATIVIDADES_KLEITON_JAVA", description: "Exercícios e atividades de programação desenvolvidos durante os estudos em Java.", language: "Java", html_url: `https://github.com/${GITHUB_USER}/ATIVIDADES_KLEITON_JAVA`, updated_at: "2025-01-01" },
      { name: "JOGO_ADIVINHACAO_FILME", description: "Projeto para praticar lógica de programação e conceitos fundamentais.", language: "Java", html_url: `https://github.com/${GITHUB_USER}/JOGO_ADIVINHACAO_FILME`, updated_at: "2025-01-01" },
      { name: "ATIVIDADE_JAVASCRIPT", description: "Projeto de estudo desenvolvido com HTML, CSS e JavaScript.", language: "JavaScript", html_url: `https://github.com/${GITHUB_USER}/ATIVIDADE_JAVASCRIPT`, updated_at: "2025-01-01" }
    ], "A API do GitHub não respondeu agora. Exibindo projetos de reserva.");
  }

  async function loadGitHubProjects() {
    if (!projectsGrid) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      const [userResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USER}`, { signal: controller.signal }),
        fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`, { signal: controller.signal })
      ]);
      if (!userResponse.ok || !reposResponse.ok) throw new Error("Resposta inválida da API do GitHub");
      const user = await userResponse.json();
      const repos = await reposResponse.json();
      if (repositoryCount && Number.isFinite(user.public_repos)) repositoryCount.textContent = String(user.public_repos);
      if (!Array.isArray(repos)) throw new Error("Lista de repositórios inválida");

      const selected = repos
        .filter((repo) => repo && !repo.fork && String(repo.name).toUpperCase() !== GITHUB_USER)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 6);

      if (!selected.length) throw new Error("Nenhum repositório encontrado");
      renderProjects(selected);
    } catch (error) {
      console.warn("GitHub API indisponível:", error);
      fallbackProjects();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  window.addEventListener("load", () => {
    initPointerInteractions();
    initAnimations();
    loadGitHubProjects();
  }, { once: true });
})();
