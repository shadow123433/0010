// js/ui.js

/* =========================
   TOAST
========================= */
export const toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);

export function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* =========================
   MODAL DE AVISO (GENÉRICO)
========================= */
export function abrirModal(mensagem) {
  document.getElementById("modalMessage").innerText = mensagem;
  document.getElementById("modalOverlay").style.display = "flex";
}

export function fecharModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

/* =========================
   LIGHTBOX & ZOOM (LÓGICA ORIGINAL)
========================= */
export const lightbox = document.createElement("div");
lightbox.className = "lightbox-overlay";
lightbox.innerHTML = `<span class="fechar-lightbox">✖</span><img src="">`;
document.body.appendChild(lightbox);

export const lightboxImg = lightbox.querySelector("img");
export const fecharLightbox = lightbox.querySelector(".fechar-lightbox");

let scale = 1;
let lastDistance = null;
let originLocked = false;
let currentX = 0;
let currentY = 0;

lightboxImg.style.transition = "transform 0.12s linear";
lightboxImg.style.transformOrigin = "center center";
lightboxImg.style.touchAction = "none";

export function resetLightbox() {
  scale = 1;
  originLocked = false;
  currentX = 0;
  currentY = 0;
  lightboxImg.style.transformOrigin = "center center";
  lightboxImg.style.transform = "translate(0px,0px) scale(1)";
}

// Vinculando os eventos de Zoom exatamente como no original
export function configurarZoom() {
  lightboxImg.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (!originLocked) {
      const rect = lightboxImg.getBoundingClientRect();
      const originX = ((e.clientX - rect.left) / rect.width) * 100;
      const originY = ((e.clientY - rect.top) / rect.height) * 100;
      lightboxImg.style.transformOrigin = `${originX}% ${originY}%`;
      originLocked = true;
    }
    scale += e.deltaY * -0.004;
    scale = Math.min(Math.max(1, scale), 4);
    lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
  }, { passive: false });

  lightboxImg.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDistance = Math.hypot(dx, dy);
      if (!originLocked) {
        const rect = lightboxImg.getBoundingClientRect();
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const originX = ((centerX - rect.left) / rect.width) * 100;
        const originY = ((centerY - rect.top) / rect.height) * 100;
        lightboxImg.style.transformOrigin = `${originX}% ${originY}%`;
        originLocked = true;
      }
    }
  }, { passive: false });

  lightboxImg.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2 && lastDistance) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      scale += (distance - lastDistance) * 0.01;
      scale = Math.min(Math.max(1, scale), 4);
      lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
      lastDistance = distance;
    }
  }, { passive: false });

  lightboxImg.addEventListener("touchend", () => {
    lastDistance = null;
  });
}