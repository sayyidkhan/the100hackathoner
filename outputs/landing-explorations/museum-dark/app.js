const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const order = [81, 80, 79];
const featured = {
  81: {
    title: "The Next 8 Seconds",
    event: "ANTI-DRUG JAM 2026",
    description:
      "An illustrated adventure through peer pressure. Sketch a solution. Find your way home.",
  },
  80: {
    title: "Itachi’s Crow",
    event: "GPT-6 ASTRA HACKATHON / SINGAPORE",
    description:
      "Explore a real 3D city through a crow, then imagine yourself there with AI-generated travel scenes.",
  },
  79: {
    title: "Long Taa Borneo Eco Stay",
    event: "SG × SWK FRIENDSHIP AI BUSINESS DESIGN HACKATHON",
    description:
      "A bilingual visitor experience connecting travelers with a Sebup longhouse village in Borneo.",
  },
};
const state = {
  selected: 81,
  view: "artwork",
  theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  filter: "all",
  collectionView: "grid",
  preview: 81,
  visible: 6,
  paused: matchMedia("(prefers-reduced-motion: reduce)").matches,
};
const dialog = $("#project-dialog");
let projects = [];
let scene;
let scenePromise;
let modeRequest = 0;
let dialogOpener;
let collectionStatus = "loading";
const colorScheme = matchMedia("(prefers-color-scheme: dark)");
let hasThemePreference = false;
try {
  hasThemePreference = ["light", "dark"].includes(
    localStorage.getItem("museum-dark-theme"),
  );
} catch {}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  $('meta[name="theme-color"]').content =
    theme === "dark" ? "#100f12" : "#f6f5f0";
  const nextTheme = theme === "dark" ? "light" : "dark";
  $("#theme-toggle").setAttribute("aria-label", `Switch to ${nextTheme} mode`);
  $("#theme-toggle").title = `Switch to ${nextTheme} mode`;
  $("#theme-label").textContent =
    nextTheme === "dark" ? "Dark mode" : "Light mode";
  $("#theme-icon").textContent = nextTheme === "dark" ? "◐" : "☼";
  scene?.setTheme(theme);
}

$("#theme-toggle").addEventListener("click", () => {
  const theme = state.theme === "dark" ? "light" : "dark";
  hasThemePreference = true;
  try {
    localStorage.setItem("museum-dark-theme", theme);
  } catch {}
  applyTheme(theme);
});
colorScheme.addEventListener("change", (event) => {
  if (!hasThemePreference) applyTheme(event.matches ? "dark" : "light");
});
applyTheme(state.theme);

function selectExhibit(number) {
  if (!order.includes(number)) return;
  state.selected = number;
  const copy = featured[number];
  const index = order.indexOf(number);
  $$("[data-object]").forEach((button) => {
    const id = Number(button.dataset.object);
    const offset = (order.indexOf(id) - index + order.length) % order.length;
    button.classList.toggle("is-active", offset === 0);
    button.classList.toggle("is-after", offset === 1);
    button.classList.toggle("is-before", offset === 2);
    button.tabIndex = offset === 0 ? 0 : -1;
    button.setAttribute(
      "aria-label",
      `${offset === 0 ? "Open" : "Select"} ${featured[id].title}`,
    );
  });
  $$("[data-exhibit]").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(Number(button.dataset.exhibit) === number),
    ),
  );
  $("#stage-number").textContent = String(number).padStart(3, "0");
  $("#featured-event").textContent =
    `${String(number).padStart(3, "0")} / ${copy.event}`;
  $("#featured-title").textContent = copy.title;
  $("#featured-description").textContent = copy.description;
  $("#gallery-canvas").setAttribute(
    "aria-label",
    `Interactive 3D concept object for ${copy.title}. Drag or use arrow keys to rotate.`,
  );
  scene?.setProject(number);
}

function moveExhibit(delta) {
  selectExhibit(
    order[
      (order.indexOf(state.selected) + delta + order.length) % order.length
    ],
  );
}

function updateView(view) {
  state.view = view;
  document.documentElement.dataset.view = view;
  $("#artwork-stage").hidden = view !== "artwork";
  $("#three-stage").hidden = view !== "3d";
  $$("[data-view-mode]").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.viewMode === view),
    ),
  );
  $("#gallery-hint").textContent =
    view === "3d"
      ? "DRAG TO ROTATE · ARROW KEYS TO TURN"
      : "DRAG TO EXPLORE · SELECT TO OPEN";
  scene?.setActive(view === "3d" && !dialog.open);
}

function fallback() {
  modeRequest += 1;
  const sceneHadFocus = $("#three-stage").contains(document.activeElement);
  updateView("artwork");
  scene?.dispose();
  scene = undefined;
  scenePromise = undefined;
  $("#mode-status").textContent =
    "3D is unavailable in this browser. The artwork and all project stories are still available.";
  if (sceneHadFocus) $("#artwork-mode").focus();
}

async function changeView(view) {
  const request = ++modeRequest;
  if (view === "artwork") {
    updateView(view);
    $("#mode-status").textContent = "";
    return;
  }
  if (scene) {
    updateView(view);
    return;
  }
  $("#mode-status").textContent = "Opening the 3D gallery…";
  $("#three-mode").setAttribute("aria-busy", "true");
  try {
    if (!scenePromise)
      scenePromise = import("./scene.js").then(({ createGalleryScene }) =>
        createGalleryScene({
          canvas: $("#gallery-canvas"),
          container: $("#three-stage"),
          onError: fallback,
          theme: state.theme,
        }),
      );
    const readyScene = await scenePromise;
    scene = readyScene;
    scene.setTheme(state.theme);
    scene.setProject(state.selected);
    scene.setPaused(state.paused);
    if (request !== modeRequest) return;
    updateView("3d");
    $("#mode-status").textContent = "";
  } catch {
    scenePromise = undefined;
    if (request === modeRequest) fallback();
  } finally {
    $("#three-mode").removeAttribute("aria-busy");
  }
}

$$("[data-view-mode]").forEach((button) =>
  button.addEventListener("click", () => changeView(button.dataset.viewMode)),
);
$$("[data-exhibit]").forEach((button) =>
  button.addEventListener("click", () =>
    selectExhibit(Number(button.dataset.exhibit)),
  ),
);
$("#previous-exhibit").addEventListener("click", () => moveExhibit(-1));
$("#next-exhibit").addEventListener("click", () => moveExhibit(1));
$("#reset-view").addEventListener("click", () => scene?.resetView());
function updatePauseLabel() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $("#pause-motion").disabled = reduced;
  $("#pause-motion").textContent = reduced
    ? "Reduced motion on"
    : state.paused
      ? "Resume motion"
      : "Pause motion";
  $("#pause-motion").setAttribute("aria-pressed", String(state.paused));
}
$("#pause-motion").addEventListener("click", () => {
  state.paused = !state.paused;
  updatePauseLabel();
  scene?.setPaused(state.paused);
});
matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
  "change",
  (event) => {
    state.paused = event.matches;
    updatePauseLabel();
    scene?.setPaused(state.paused);
  },
);

// Artwork gestures change the exhibit. 3D gestures are owned by the renderer.
const stage = $("#artwork-stage");
let pointer;
let suppressClickUntil = 0;
stage.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  pointer = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    captured: false,
  };
});
stage.addEventListener("pointermove", (event) => {
  if (!pointer || event.pointerId !== pointer.id) return;
  if (event.pointerType === "mouse" && !event.buttons) {
    pointer = undefined;
    stage.classList.remove("is-dragging");
    return;
  }
  const dx = event.clientX - pointer.x;
  const dy = event.clientY - pointer.y;
  if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
    pointer.captured = true;
    stage.setPointerCapture(event.pointerId);
    stage.classList.add("is-dragging");
  }
});
stage.addEventListener("pointerup", (event) => {
  if (!pointer || event.pointerId !== pointer.id) return;
  const dx = event.clientX - pointer.x;
  const dy = event.clientY - pointer.y;
  if (pointer.captured) suppressClickUntil = Date.now() + 400;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy))
    moveExhibit(dx < 0 ? 1 : -1);
  pointer = undefined;
  stage.classList.remove("is-dragging");
  if (stage.hasPointerCapture(event.pointerId))
    stage.releasePointerCapture(event.pointerId);
});
for (const name of ["pointercancel", "lostpointercapture"])
  stage.addEventListener(name, () => {
    pointer = undefined;
    stage.classList.remove("is-dragging");
  });
stage.addEventListener("pointerleave", () => {
  if (pointer && !pointer.captured) pointer = undefined;
});
stage.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  moveExhibit(event.key === "ArrowRight" ? 1 : -1);
  stage.querySelector(".is-active").focus({ preventScroll: true });
});
$$("[data-object]").forEach((button) =>
  button.addEventListener("click", () => {
    if (Date.now() < suppressClickUntil) return;
    const number = Number(button.dataset.object);
    if (number === state.selected) openProject(number);
    else selectExhibit(number);
  }),
);
$("#open-story").addEventListener("click", () => openProject(state.selected));

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function openProject(number) {
  const project = projects.find((item) => item.number === Number(number));
  if (!project) {
    $("#mode-status").textContent =
      "Project records are still loading or unavailable. Please try again shortly.";
    return;
  }
  $("#dialog-number").textContent =
    `ATTEMPT ${String(project.number).padStart(3, "0")} / ${project.dateLabel}`;
  $("#dialog-title").textContent = project.title;
  $("#dialog-event").textContent = `${project.event} · ${project.country}`;
  $("#dialog-solution").textContent =
    project.solution || "A project from the collection.";
  $("#dialog-tags").replaceChildren(
    ...(project.categories || []).map((category) => {
      const tag = document.createElement("span");
      tag.textContent = category;
      return tag;
    }),
  );
  $("#dialog-award").textContent = project.award
    ? `Recognition: ${project.award}`
    : "";
  $("#dialog-award").hidden = !project.award;
  const github = safeUrl(project.githubUrl);
  const event = safeUrl(project.eventUrl);
  $("#dialog-link").href = github || event || "http://127.0.0.1:18481/#journey";
  $("#dialog-link").textContent = github
    ? "View the project on GitHub ↗"
    : event
      ? "Visit the event ↗"
      : "Explore the full journey ↗";
  dialogOpener = document.activeElement;
  dialog.showModal();
  scene?.setActive(false);
}

function matchingProjects() {
  const term = $("#search").value.toLowerCase().trim();
  const year = $("#collection-year").value;
  return projects.filter((project) =>
    (state.filter !== "awarded" || project.award) &&
    (year === "all" || project.startDate.slice(0, 4) === year) &&
    [project.title, project.event, project.startDate, project.solution,
      ...(project.tags || []), ...(project.categories || [])]
      .join(" ").toLowerCase().includes(term),
  );
}

function previewAttempt(number) {
  const project = projects.find((item) => item.number === number);
  if (!project) return;
  state.preview = number;
  $("#preview-number").textContent = String(number).padStart(3, "0");
  $("#preview-date").textContent = `${project.dateLabel} / ${project.country}`;
  $("#preview-title").textContent = project.title;
  $("#preview-event").textContent = project.event;
  $("#preview-description").textContent = project.solution || "A project from the collection.";
  $("#preview-award").textContent = project.award || "";
  $("#preview-award").hidden = !project.award;
  $("#preview-state").textContent = number === Math.max(...projects.map(p => p.number))
    ? "CURRENT" : project.award ? "◇ AWARDED" : "COMPLETED";
  $$(".attempt-tile[data-number]").forEach((tile) => {
    tile.setAttribute("aria-pressed", String(Number(tile.dataset.number) === number));
  });
}

function renderAttemptGrid(selected) {
  const matching = new Set(selected.map((project) => project.number));
  const byNumber = new Map(projects.map((project) => [project.number, project]));
  const latest = Math.max(...byNumber.keys());
  const fragment = document.createDocumentFragment();
  for (let number = 1; number <= 100; number++) {
    const project = byNumber.get(number);
    const available = project && matching.has(number);
    const tile = document.createElement(available ? "button" : "span");
    tile.className = "attempt-tile";
    tile.textContent = String(number).padStart(2, "0");
    if (!project) {
      tile.classList.add("is-ahead");
      tile.setAttribute("aria-label", `Attempt ${number}: still ahead`);
    } else {
      tile.classList.toggle("is-awarded", Boolean(project.award));
      tile.classList.toggle("is-current", number === latest);
      if (!available) {
        tile.classList.add("is-filtered");
        tile.setAttribute("aria-hidden", "true");
      } else {
        tile.type = "button";
        tile.dataset.number = number;
        tile.setAttribute("aria-label", `Attempt ${number}: ${project.title}${project.award ? ", awarded" : ""}${number === latest ? ", current" : ""}`);
        tile.addEventListener("pointerenter", (event) => {
          if (event.pointerType === "mouse") previewAttempt(number);
        });
        tile.addEventListener("focus", () => previewAttempt(number));
        tile.addEventListener("click", (event) => {
          previewAttempt(number);
          // Touch selects a preview; its explicit action opens the full story.
          if (event.pointerType !== "touch") openProject(number);
        });
      }
    }
    fragment.append(tile);
  }
  $("#attempt-grid").replaceChildren(fragment);
  $(".attempt-preview").hidden = selected.length === 0;
  if (selected.length) previewAttempt(matching.has(state.preview) ? state.preview : selected[0].number);
}

$("#attempt-grid").addEventListener("keydown", (event) => {
  const tile = event.target.closest("button[data-number]");
  if (!tile) return;
  const buttons = $$("#attempt-grid button");
  const index = buttons.indexOf(tile);
  const columns = getComputedStyle($("#attempt-grid")).gridTemplateColumns.split(" ").length;
  const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }[event.key];
  if (step === undefined && event.key !== "Home" && event.key !== "End") return;
  event.preventDefault();
  let target;
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    let number = Number(tile.dataset.number) + step;
    while (number >= 1 && number <= 100) {
      target = buttons.find((button) => Number(button.dataset.number) === number);
      if (target) break;
      number += step;
    }
  } else {
    target = buttons[event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
      : Math.max(0, Math.min(buttons.length - 1, index + step))];
  }
  target?.focus({ preventScroll: true });
});
$("#preview-open").addEventListener("click", () => openProject(state.preview));
$("#collection-year").addEventListener("change", () => {
  state.visible = 6;
  renderCollection();
});
$$("[data-collection-view]").forEach((button) => button.addEventListener("click", () => {
  state.collectionView = button.dataset.collectionView;
  $$("[data-collection-view]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
  renderCollection();
}));

function renderCollection() {
  if (collectionStatus !== "ready") {
    $("#result-status").textContent =
      collectionStatus === "failed"
        ? "The archive could not load. Refresh to try again, or visit the main website."
        : "Opening the collection…";
    $("#load-more").hidden = true;
    return;
  }
  const selected = matchingProjects();
  $("#surprise").disabled = selected.length === 0;
  const gridView = state.collectionView === "grid";
  $("#grid-collection").hidden = !gridView;
  const list = $("#project-list");
  list.hidden = gridView;
  if (gridView) {
    renderAttemptGrid(selected);
    $("#result-status").textContent = selected.length
      ? `${selected.length} of ${projects.length} recorded attempts · ${100 - projects.length} still to come`
      : "No attempts found. Try another year, filter, or search.";
    $("#load-more").hidden = true;
    return;
  }
  list.replaceChildren();
  for (const project of selected.slice(0, state.visible)) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "project-row";
    row.setAttribute(
      "aria-label",
      `Explore attempt ${project.number}: ${project.title}`,
    );
    const number = document.createElement("span");
    number.className = "number";
    number.textContent = String(project.number).padStart(3, "0");
    const info = document.createElement("span");
    const title = document.createElement("h3");
    title.textContent = project.title;
    const event = document.createElement("p");
    event.textContent = project.event;
    info.append(title, event);
    const meta = document.createElement("span");
    meta.className = "project-meta";
    meta.textContent = project.dateLabel;
    if (project.award) {
      const badge = document.createElement("span");
      badge.className = "award-label";
      badge.textContent = "↗ Awarded";
      meta.append(badge);
    }
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    row.append(number, info, meta, arrow);
    row.addEventListener("click", () => openProject(project.number));
    list.append(row);
  }
  $("#result-status").textContent = selected.length
    ? `${Math.min(state.visible, selected.length)} of ${selected.length} attempts on display`
    : "No attempts found. Try a different search.";
  $("#load-more").hidden = state.visible >= selected.length;
}
$$("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    state.visible = 6;
    $$("[data-filter]").forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    renderCollection();
  }),
);
$("#search").addEventListener("input", () => {
  state.visible = 6;
  renderCollection();
});
$("#load-more").addEventListener("click", () => {
  const previousCount = $("#project-list").children.length;
  state.visible += 12;
  renderCollection();
  $("#project-list").children[previousCount]?.focus({ preventScroll: true });
});
$("#surprise").addEventListener("click", () => {
  const matching = matchingProjects();
  if (matching.length) {
    const project = matching[Math.floor(Math.random() * matching.length)];
    previewAttempt(project.number);
    openProject(project.number);
  }
});
$("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  scene?.setActive(state.view === "3d");
  dialogOpener?.focus({ preventScroll: true });
});
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    dialog.close();
});

selectExhibit(81);
updatePauseLabel();
$("#result-status").textContent = "Opening the collection…";
$("#load-more").hidden = true;
fetch("./hackathons.json")
  .then((response) => {
    if (!response.ok) throw new Error("Collection unavailable");
    return response.json();
  })
  .then((records) => {
    collectionStatus = "ready";
    projects = records;
    [...new Set(records.map((project) => project.startDate.slice(0, 4)))]
      .sort().reverse().forEach((year) => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        $("#collection-year").append(option);
      });
    $("#all-count").textContent = records.length;
    $("#journey-count").textContent = records.length;
    $("#award-count").textContent = records.filter(
      (project) => project.award,
    ).length;
    renderCollection();
  })
  .catch(() => {
    collectionStatus = "failed";
    $("#result-status").textContent =
      "The archive could not load. Refresh to try again, or visit the main website.";
    $("#surprise").disabled = true;
  });
