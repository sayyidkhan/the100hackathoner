const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const pad = (n) => String(n).padStart(3, "0");
const dialog = $("#project-dialog");
let data = [],
  filter = "all";
function openProject(p) {
  $("#dialog-kicker").textContent = `ATTEMPT ${pad(p.number)} / ${p.dateLabel}`;
  $("#dialog-title").textContent = p.title;
  $("#dialog-solution").textContent = p.solution;
  $("#dialog-facts").innerHTML =
    `<dt>Hackathon</dt><dd>${esc(p.event)}</dd><dt>Location</dt><dd>${esc(p.location || p.country)}</dd>${p.award ? `<dt>Recognition</dt><dd>${esc(p.award)}</dd>` : ""}${p.tags?.length ? `<dt>Exploring</dt><dd>${esc(p.tags.join(" · "))}</dd>` : ""}`;
  const link = $("#dialog-link");
  link.href = p.githubUrl || p.eventUrl || "http://127.0.0.1:18481/#journey";
  link.textContent = p.githubUrl
    ? "Explore the code ↗"
    : p.eventUrl
      ? "Explore the event ↗"
      : "See the full journey ↗";
  dialog.showModal();
}
function renderArchive() {
  const query = $("#search").value.trim().toLowerCase();
  const chosen = data.filter(
    (p) =>
      (filter === "all" ||
        (filter === "awarded" && p.award) ||
        (filter === "2026" && p.startDate?.startsWith("2026"))) &&
      `${p.title} ${p.event} ${p.solution} ${(p.tags || []).join(" ")}`
        .toLowerCase()
        .includes(query),
  );
  $("#result-count").textContent =
    `${chosen.length} ${chosen.length === 1 ? "attempt" : "attempts"}${query ? " matching your search" : ""}`;
  $("#project-list").innerHTML = chosen.length
    ? chosen
        .map(
          (p) =>
            `<button class="archive-item" data-id="${p.number}"><span>${pad(p.number)}</span><div><h4>${esc(p.title)}</h4><p>${esc(p.event)}</p></div><time>${esc(p.dateLabel)}</time><span>↗</span></button>`,
        )
        .join("")
    : '<p class="empty-state">No attempts match that search. Try a project name, event, or a different filter.</p>';
  $("#project-list")
    .querySelectorAll("button")
    .forEach((b) =>
      b.addEventListener("click", () =>
        openProject(data.find((p) => p.number === Number(b.dataset.id))),
      ),
    );
}
$("#archive-toggle").addEventListener("click", () => {
  const open = $("#archive-panel").hidden;
  $("#archive-panel").hidden = !open;
  $("#archive-toggle").setAttribute("aria-expanded", String(open));
  $("#archive-toggle").innerHTML = open
    ? "Close the archive <span>−</span>"
    : "Browse all 81 attempts <span>+</span>";
  if (open) {
    renderArchive();
    $("#search").focus({ preventScroll: true });
  }
});
$("#search").addEventListener("input", renderArchive);
document.querySelectorAll("[data-filter]").forEach((b) =>
  b.addEventListener("click", () => {
    filter = b.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((other) => {
      other.classList.toggle("active", other === b);
      other.setAttribute("aria-pressed", String(other === b));
    });
    renderArchive();
  }),
);
$(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});
try {
  const r = await fetch("assets/hackathons.json");
  if (!r.ok) throw Error("Data unavailable");
  data = (await r.json()).sort((a, b) => b.number - a.number);
} catch {
  $("#archive-status").innerHTML =
    '<p>The archive could not load. Refresh to try again, or <a href="http://127.0.0.1:18481/#journey">visit the main journey</a>.</p>';
}

// The scene is decorative; all chapter actions remain accessible HTML controls.
let selectedChapter = 0;
function selectChapter(index) {
  selectedChapter = index;
  const project = data[index];
  if (!project) return;
  document.querySelectorAll("[data-chapter]").forEach((button, i) => {
    button.classList.toggle("selected", i === index);
    button.setAttribute("aria-pressed", String(i === index));
  });
  $("#active-number").textContent = pad(project.number);
  $("#active-title").textContent = project.title;
  $("#active-event").textContent = project.event;
  $("#active-description").textContent = project.solution;
  document.dispatchEvent(new CustomEvent("journey-chapter", { detail: index }));
}
document.querySelectorAll("[data-chapter]").forEach((button) => {
  button.addEventListener("click", () =>
    selectChapter(Number(button.dataset.chapter)),
  );
});
$("#open-chapter").addEventListener("click", () => {
  if (data[selectedChapter]) openProject(data[selectedChapter]);
});
selectChapter(0);
import("./engine.js").catch(() => {
  $(".engine-scene").classList.add("scene-fallback");
  $("#scene-status").textContent = "ILLUSTRATED CHAPTER PREVIEW";
  $("#motion-toggle").hidden = true;
});
