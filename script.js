document.addEventListener("DOMContentLoaded", () => {
  fetch("data.json")
    .then((res) => res.json())
    .then(async (data) => {
      setFavicon(data.favicon);
      setHeaderImage(data.headerImage?.[0]);
      populatePricing(data.pricingImages);
      const validImages = await filterExistingImages(data.carouselImages);
      initCarousel(validImages);
      populateFooterLinks(data.mail, data.instagram);
    })
    .catch(() => {
      const fallbackImages = Array.from({ length: 9 }, (_, i) => `imgs/carousel_img_0${i + 1}.jpg`);
      initCarousel(fallbackImages);
    });
});

function setHeaderImage(src) {
  const header = document.getElementById("page-header");
  if (src) {
    header.style.backgroundImage = `url(${src})`;
  }
}

function populatePricing(images) {
  const pricingContainer = document.getElementById("pricing-plans");
  const titles = ["Basic", "Standard", "Premium"];
  const descriptions = [
    "For simple designs. 1 - 2 colors with a simple logo, shapes or numbers added.",
    "Detailed designs with multiple colors. Great for fun designs with minimal details.",
    "Intricate custom designs. Fully custom, ranged color detail and shading. Cage paint included."
  ];
  const priceTexts = ["Approximate price range:", "Approximate price range:", "Approximate price range:"];
  const prices = ["150EUR - 200EUR", "250EUR - 300EUR", "350EUR - 400EUR"];
  const disclaimers = [
    "Prices shown are indicators, actual price varies based on paint and other equipment costs. Cage paint can be added for further costs. Option for design and mockup included.",
    "Prices shown are indicators, actual price varies based on paint and other equipment costs. Cage paint can be added for further costs. Option for design and mockup included.",
    "Prices shown are indicators, actual price varies based on paint and other equipment costs. Cage paint, option for custom design and mockup included."
  ];

  images.forEach((src, i) => {
    const plan = document.createElement("div");
    plan.className = "plan";
    plan.innerHTML = `
      <h3>${titles[i]}</h3>
      <p>${descriptions[i]}</p>
      <div>
        <p>${priceTexts[i]}</p>
        <p>${prices[i]}</p>
      </div>
      <div class="img-container">
        <img src="${src}" alt="${titles[i]} plan example" />
      </div>
      <p>${disclaimers[i]}</p>
    `;
    pricingContainer.appendChild(plan);
  });
}

let currentModalIndex = 1;
let carouselImages = [];

async function filterExistingImages(imagePaths) {
  const checks = imagePaths.map(path => {
    return new Promise(resolve => {
      const img = new Image();
      img.src = path;
      img.onload = () => resolve(path);
      img.onerror = () => resolve(null);
    });
  });

  const results = await Promise.all(checks);
  return results.filter(Boolean);
}

function initCarousel(images) {
  carouselImages = images;
  const isMobile = window.innerWidth <= 1024;
  if (isMobile) {
    renderDragCarousel(images);
  } else {
    renderCenteredCarousel(images, Math.floor(images.length / 2));
  }
  setupArrowControls();
}

function setupArrowControls() {
  const left = document.getElementById("left-arrow");
  const right = document.getElementById("right-arrow");

  if (!left || !right) return;

  left.onclick = () => {
    const isMobile = window.innerWidth <= 1024;
    if (!isMobile) {
      const centerImg = document.querySelector(".carousel .center img");
      const current = parseInt(centerImg?.dataset.index || 0);
      const newCenter = (current - 1 + carouselImages.length) % carouselImages.length;
      renderCenteredCarousel(carouselImages, newCenter);
    } else {
      scrollCarouselBy(-1);
    }
  };

  right.onclick = () => {
    const isMobile = window.innerWidth <= 1024;
    if (!isMobile) {
      const centerImg = document.querySelector(".carousel .center img");
      const current = parseInt(centerImg?.dataset.index || 0);
      const newCenter = (current + 1) % carouselImages.length;
      renderCenteredCarousel(carouselImages, newCenter);
    } else {
      scrollCarouselBy(1);
    }
  };
}

function populateFooterLinks(mailImg, instaImg) {
  const footerLinks = document.getElementById("footer-links");
  if (!footerLinks) return;

  footerLinks.style.display = "flex";
  footerLinks.style.justifyContent = "center";
  footerLinks.style.alignItems = "center";
  footerLinks.style.gap = "1.5rem";
  footerLinks.style.margin = "1em 0";

  const iconStyle = "height: 40px; width: 40px; object-fit: contain;";

  const mailLink = document.createElement("a");
  mailLink.href = "mailto:ben.publicbusiness@gmail.com";
  mailLink.target = "_blank";
  mailLink.innerHTML = `<img src="${mailImg}" alt="Email" style="${iconStyle}" />`;

  const instaLink = document.createElement("a");
  instaLink.href = "https://www.instagram.com/creasecustoms_?igsh=MWlvOHprNmlzaDg5aw%3D%3D&utm_source=qr";
  instaLink.target = "_blank";
  instaLink.innerHTML = `<img src="${instaImg}" alt="Instagram" style="${iconStyle}" />`;

  footerLinks.appendChild(mailLink);
  footerLinks.appendChild(instaLink);
}

function scrollCarouselBy(step) {
  const carousel = document.getElementById("carousel");
  const scrollAmount = step * 200;
  carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
}

function renderDragCarousel(images) {
  const carousel = document.getElementById("carousel");
  carousel.innerHTML = "";

  images.forEach((src, idx) => {
    const imgContainer = document.createElement("div");
    imgContainer.className = "img-container";

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Carousel image ${idx + 1}`;

    img.addEventListener("click", () => openModal(src));
    imgContainer.appendChild(img);
    carousel.appendChild(imgContainer);
  });

  enableDragScroll(carousel);
}

function renderCenteredCarousel(images, centerIndex) {
  const carousel = document.getElementById("carousel");
  carousel.innerHTML = "";

  const visibleCount = getVisibleCount();
  const half = Math.floor(visibleCount / 2);
  const total = images.length;
  const start = (centerIndex - half + total) % total;

  for (let i = 0; i < visibleCount; i++) {
    const idx = (start + i) % total;
    const imgContainer = document.createElement("div");
    imgContainer.className = "img-container";

    const img = document.createElement("img");
    img.src = images[idx];
    img.alt = `Carousel image ${idx + 1}`;
    img.dataset.index = idx;

    if (i === half) imgContainer.classList.add("center");

    img.addEventListener("click", () => {
      if (i === half) {
        openModal(images[idx]);
      } else {
        renderCenteredCarousel(images, idx);
      }
    });

    imgContainer.appendChild(img);
    carousel.appendChild(imgContainer);
  }
}

function enableDragScroll(container) {
  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener("pointerdown", (e) => {
    isDown = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * -1;
    container.scrollLeft = scrollLeft + walk;
  });

  container.addEventListener("pointerup", () => isDown = false);
  container.addEventListener("pointerleave", () => isDown = false);
}

function getVisibleCount() {
  const w = window.innerWidth;
  if (w > 1200) return 7;
  if (w > 800) return 5;
  return 3;
}

window.addEventListener("resize", () => {
  initCarousel(carouselImages);
});

function openModal(src) {
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";

  overlay.innerHTML = `
    <div class="modal-content" id="modal-content">
      <span class="close-button">&times;</span>
      <img src="${src}" alt="Enlarged view" id="modal-img" />
    </div>
  `;

  document.body.appendChild(overlay);
  const modalContent = document.getElementById("modal-content");

  currentModalIndex = carouselImages.findIndex((img) => img === src);

  overlay.addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay" || e.target.classList.contains("close-button")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", handleKeyNavigation);

  let startX = null;

  modalContent.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
    }
  }, { passive: true });

  modalContent.addEventListener("touchend", (e) => {
    if (!startX || e.changedTouches.length === 0) return;

    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    const threshold = 50;

    if (deltaX > threshold) {
      showPreviousImage();
    } else if (deltaX < -threshold) {
      showNextImage();
    }

    startX = null;
  });
}

function setFavicon(faviconPath) {
  if (!faviconPath) return;
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.href = faviconPath;
  document.head.appendChild(link);
}

function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) overlay.remove();
  document.removeEventListener("keydown", handleKeyNavigation);
}

function handleKeyNavigation(e) {
  if (e.key === "ArrowRight") showNextImage();
  else if (e.key === "ArrowLeft") showPreviousImage();
  else if (e.key === "Escape") closeModal();
}

function showNextImage() {
  currentModalIndex = (currentModalIndex + 1) % carouselImages.length;
  document.getElementById("modal-img").src = carouselImages[currentModalIndex];
}

function showPreviousImage() {
  currentModalIndex = (currentModalIndex - 1 + carouselImages.length) % carouselImages.length;
  document.getElementById("modal-img").src = carouselImages[currentModalIndex];
}