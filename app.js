const DRIVES = [
  { id: 1, company: "TechNova Systems", role: "Frontend Developer", type: "Technology", package: "₹8.5 LPA", deadline: "20 Nov 2026", location: "Bengaluru", logo: "TN", logoClass: "logo-purple", tag: "Engineering", applicants: 86 },
  { id: 2, company: "FinEdge Capital", role: "Software Analyst", type: "Technology", package: "₹7.2 LPA", deadline: "24 Nov 2026", location: "Gurugram", logo: "FE", logoClass: "logo-orange", tag: "Finance Tech", applicants: 54 },
  { id: 3, company: "AutoCore Mobility", role: "Graduate Engineer Trainee", type: "Core", package: "₹6.8 LPA", deadline: "29 Nov 2026", location: "Pune", logo: "AC", logoClass: "logo-green", tag: "Core", applicants: 42 },
  { id: 4, company: "CloudNest Labs", role: "Cloud Support Associate", type: "Technology", package: "₹5.5 LPA", deadline: "02 Dec 2026", location: "Hyderabad", logo: "CN", logoClass: "logo-blue", tag: "Cloud", applicants: 73 },
  { id: 5, company: "PixelWorks Studio", role: "Product Design Intern", type: "Management", package: "₹35K / month", deadline: "05 Dec 2026", location: "Remote", logo: "PW", logoClass: "logo-pink", tag: "Design", applicants: 28 }
];

const DEFAULT_APPLICATIONS = [
  { company: "DataBridge Analytics", role: "Data Analyst", status: "Shortlisted", statusClass: "shortlisted", logo: "DB", logoClass: "logo-blue", date: "Applied 12 Nov 2026" },
  { company: "GreenGrid Energy", role: "Graduate Engineer", status: "Under review", statusClass: "review", logo: "GG", logoClass: "logo-green", date: "Applied 08 Nov 2026" },
  { company: "NovaBank", role: "Technology Associate", status: "Offer received", statusClass: "offer", logo: "NB", logoClass: "logo-purple", date: "Applied 02 Nov 2026" }
];

const $ = (id) => document.getElementById(id);
let selectedDrive = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function renderDrives() {
  const search = $("drive-search").value.trim().toLowerCase();
  const activeFilter = document.querySelector(".filter-tab.active").dataset.filter;
  const filtered = DRIVES.filter((drive) => {
    const matchesSearch = !search || `${drive.company} ${drive.role} ${drive.location}`.toLowerCase().includes(search);
    const matchesFilter = activeFilter === "All" || drive.type === activeFilter;
    return matchesSearch && matchesFilter;
  });
  $("drive-list").innerHTML = filtered.length ? filtered.map((drive) => `
    <article class="drive-card">
      <span class="company-logo ${drive.logoClass}">${escapeHtml(drive.logo)}</span>
      <div><strong>${escapeHtml(drive.company)}</strong><small>${escapeHtml(drive.role)} · ${escapeHtml(drive.location)}</small></div>
      <div class="drive-meta"><b>${escapeHtml(drive.package)}</b><span>${drive.applicants} applicants</span></div>
      <span class="drive-tag ${drive.type.toLowerCase()}">${escapeHtml(drive.tag)}</span>
      <button class="apply-button" data-drive-id="${drive.id}" type="button">View details</button>
    </article>
  `).join("") : '<p class="empty-message">No placement drives match your search.</p>';
  document.querySelectorAll("[data-drive-id]").forEach((button) => button.addEventListener("click", () => openApplication(Number(button.dataset.driveId))));
}

function getApplications() {
  return JSON.parse(localStorage.getItem("campusHireApplications") || "null") || DEFAULT_APPLICATIONS;
}

function renderApplications() {
  const applications = getApplications();
  $("application-list").innerHTML = applications.slice(0, 4).map((application) => `
    <div class="application-item"><span class="company-logo ${application.logoClass}">${escapeHtml(application.logo)}</span><div><strong>${escapeHtml(application.company)}</strong><small>${escapeHtml(application.role)} · ${escapeHtml(application.date)}</small></div><span class="application-status ${application.statusClass}">${escapeHtml(application.status)}</span></div>
  `).join("");
  $("application-stat").textContent = 12 + Math.max(0, applications.length - DEFAULT_APPLICATIONS.length);
}

function openApplication(id) {
  selectedDrive = DRIVES.find((drive) => drive.id === id);
  if (!selectedDrive) return;
  $("modal-title").textContent = `Apply to ${selectedDrive.company}`;
  $("modal-description").textContent = `${selectedDrive.role} · ${selectedDrive.package} · Application closes ${selectedDrive.deadline}.`;
  $("application-note").value = "";
  $("apply-modal").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("apply-modal").hidden = true;
  document.body.style.overflow = "";
  selectedDrive = null;
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function saveApplication(event) {
  event.preventDefault();
  if (!selectedDrive) return;
  const applications = getApplications();
  if (applications.some((application) => application.company === selectedDrive.company)) {
    closeModal();
    showToast("You have already applied to this drive.");
    return;
  }
  const newApplication = { company: selectedDrive.company, role: selectedDrive.role, status: "Under review", statusClass: "review", logo: selectedDrive.logo, logoClass: selectedDrive.logoClass, date: "Applied today" };
  localStorage.setItem("campusHireApplications", JSON.stringify([newApplication, ...applications]));
  renderApplications();
  sendApplicationToApi(newApplication);
  closeModal();
  showToast(`Application sent to ${selectedDrive.company}.`);
}

async function sendApplicationToApi(application) {
  if (!window.location.protocol.startsWith("http")) return;
  try {
    await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(application) });
  } catch (error) {
    // Local Storage keeps the dashboard usable when the optional API is offline.
  }
}

document.querySelectorAll(".filter-tab").forEach((tab) => tab.addEventListener("click", () => {
  document.querySelectorAll(".filter-tab").forEach((item) => item.classList.remove("active"));
  tab.classList.add("active");
  renderDrives();
}));
$("drive-search").addEventListener("input", renderDrives);
$("application-form").addEventListener("submit", saveApplication);
document.querySelectorAll("[data-close-modal]").forEach((element) => element.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !$("apply-modal").hidden) closeModal(); });
$("profile-button").addEventListener("click", () => { $("students").scrollIntoView({ behavior: "smooth" }); showToast("Profile checklist opened."); });
$("edit-profile-button").addEventListener("click", () => showToast("Profile editor will be connected to the student API next."));

renderDrives();
renderApplications();
