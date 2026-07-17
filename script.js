const GITHUB_USER = "KLEITONSOBRAL";

const header = document.querySelector(".header");
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");
const projectsGrid = document.querySelector("#projects-grid");
const projectsMessage = document.querySelector("#projects-message");
const repositoryCount = document.querySelector("#repository-count");
const currentYear = document.querySelector("#current-year");

/*
  Atualiza automaticamente o ano do rodapé.
*/
currentYear.textContent = new Date().getFullYear();

/*
  Adiciona um fundo ao cabeçalho quando a página é rolada.
*/
function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 20);
}

window.addEventListener("scroll", updateHeader, {
  passive: true
});

updateHeader();

/*
  Controla a abertura e o fechamento do menu no celular.
*/
function closeMenu() {
  navLinks.classList.remove("open");
  menuButton.classList.remove("active");
  document.body.classList.remove("menu-open");

  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
}

menuButton.addEventListener("click", () => {
  const menuIsOpen = navLinks.classList.toggle("open");

  menuButton.classList.toggle("active", menuIsOpen);
  document.body.classList.toggle("menu-open", menuIsOpen);

  menuButton.setAttribute(
    "aria-expanded",
    String(menuIsOpen)
  );

  menuButton.setAttribute(
    "aria-label",
    menuIsOpen ? "Fechar menu" : "Abrir menu"
  );
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

/*
  Anima os elementos quando eles aparecem na tela.
*/
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});

/*
  Impede que informações recebidas da API sejam interpretadas
  como código HTML.
*/
function escapeHTML(value = "") {
  const characters = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };

  return String(value).replace(
    /[&<>"']/g,
    (character) => characters[character]
  );
}

/*
  Formata a data de atualização dos repositórios.
*/
function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

/*
  Cria o HTML de cada projeto.
*/
function createProjectCard(repository) {
  const name = repository.name
    .replaceAll("_", " ")
    .replaceAll("-", " ");

  const description =
    repository.description ||
    "Projeto disponível para consulta no GitHub.";

  const language =
    repository.language ||
    "Repositório";

  return `
    <a
      class="card project-card"
      href="${repository.html_url}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir o projeto ${escapeHTML(name)} no GitHub"
    >
      <div class="project-top">
        <span class="folder-icon" aria-hidden="true"></span>
        <span class="project-arrow" aria-hidden="true">↗</span>
      </div>

      <h3>${escapeHTML(name)}</h3>

      <p>${escapeHTML(description)}</p>

      <div class="project-meta">
        <span class="project-language">
          ${escapeHTML(language)}
        </span>

        <span>
          Atualizado em ${formatDate(repository.updated_at)}
        </span>
      </div>
    </a>
  `;
}

/*
  Exibe alguns projetos manualmente caso a API do GitHub
  não esteja disponível.
*/
function showFallbackProjects() {
  projectsGrid.innerHTML = `
    <a
      class="card project-card"
      href="https://github.com/${GITHUB_USER}/ATIVIDADES_KLEITON_JAVA"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="project-top">
        <span class="folder-icon"></span>
        <span class="project-arrow">↗</span>
      </div>

      <h3>Atividades Kleiton Java</h3>

      <p>
        Exercícios e atividades desenvolvidos durante os estudos
        de programação em Java.
      </p>

      <div class="project-meta">
        <span class="project-language">Java</span>
        <span>GitHub</span>
      </div>
    </a>

    <a
      class="card project-card"
      href="https://github.com/${GITHUB_USER}/JOGO_ADIVINHACAO_FILME"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="project-top">
        <span class="folder-icon"></span>
        <span class="project-arrow">↗</span>
      </div>

      <h3>Jogo Adivinhação Filme</h3>

      <p>
        Projeto desenvolvido para praticar lógica de programação
        e conceitos da linguagem Java.
      </p>

      <div class="project-meta">
        <span class="project-language">Java</span>
        <span>GitHub</span>
      </div>
    </a>

    <a
      class="card project-card"
      href="https://github.com/${GITHUB_USER}/ATIVIDADE_JAVASCRIPT"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="project-top">
        <span class="folder-icon"></span>
        <span class="project-arrow">↗</span>
      </div>

      <h3>Atividade JavaScript</h3>

      <p>
        Projeto de estudo desenvolvido utilizando HTML,
        CSS e JavaScript.
      </p>

      <div class="project-meta">
        <span class="project-language">JavaScript</span>
        <span>GitHub</span>
      </div>
    </a>
  `;

  projectsMessage.textContent =
    "A API do GitHub não respondeu. Foram exibidos projetos de reserva.";

  projectsMessage.hidden = false;
}

/*
  Busca as informações públicas do GitHub.
*/
async function loadGitHubProjects() {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 7000);

  try {
    const userRequest = fetch(
      `https://api.github.com/users/${GITHUB_USER}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/vnd.github+json"
        }
      }
    );

    const repositoriesRequest = fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/vnd.github+json"
        }
      }
    );

    const [
      userResponse,
      repositoriesResponse
    ] = await Promise.all([
      userRequest,
      repositoriesRequest
    ]);

    if (!userResponse.ok || !repositoriesResponse.ok) {
      throw new Error(
        "Não foi possível acessar os dados do GitHub."
      );
    }

    const user = await userResponse.json();
    const repositories = await repositoriesResponse.json();

    repositoryCount.textContent = user.public_repos;

    const selectedRepositories = repositories
      .filter((repository) => {
        return (
          !repository.fork &&
          repository.name.toUpperCase() !==
            GITHUB_USER.toUpperCase()
        );
      })
      .sort((firstRepository, secondRepository) => {
        return (
          new Date(secondRepository.updated_at) -
          new Date(firstRepository.updated_at)
        );
      })
      .slice(0, 6);

    if (selectedRepositories.length === 0) {
      throw new Error(
        "Nenhum repositório público foi encontrado."
      );
    }

    projectsGrid.innerHTML = selectedRepositories
      .map(createProjectCard)
      .join("");

    projectsMessage.hidden = true;
  } catch (error) {
    console.error(error);
    showFallbackProjects();
  } finally {
    clearTimeout(timeout);
  }
}

loadGitHubProjects();