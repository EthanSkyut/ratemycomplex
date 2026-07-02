(function () {
  "use strict";

  const STORAGE_KEY = "rmc_user_reviews_v1";
  let map, markerLayer;
  const markers = {};
  let activeComplexId = null;

  // ---------- Data helpers ----------

  function avg(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  function loadUserReviews() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveUserReviews(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function applyUserReviews() {
    loadUserReviews().forEach(({ complexId, review }) => {
      const complex = RMC_DATA.complexes.find(c => c.id === complexId);
      if (complex) complex.reviews.push(Object.assign({ isUserSubmitted: true }, review));
    });
  }

  function complexOverall(complex) {
    if (!complex.reviews.length) return avg(Object.values(complex.subRatings));
    return avg(complex.reviews.map(r => r.rating));
  }

  function landlordComplexes(landlordId) {
    return RMC_DATA.complexes.filter(c => c.landlordId === landlordId);
  }

  function landlordOverall(landlordId) {
    const ratings = [];
    landlordComplexes(landlordId).forEach(c => c.reviews.forEach(r => ratings.push(r.landlordRating)));
    return avg(ratings);
  }

  function landlordReviewCount(landlordId) {
    return landlordComplexes(landlordId).reduce((sum, c) => sum + c.reviews.length, 0);
  }

  function ratingBand(rating) {
    if (rating >= 4.2) return "good";
    if (rating >= 3.4) return "mid";
    return "low";
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Small render helpers ----------

  function starsHTML(rating) {
    const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
    return (
      '<span class="stars"><span class="stars-bg">★★★★★</span>' +
      '<span class="stars-fg" style="width:' + pct.toFixed(0) + '%">★★★★★</span></span>'
    );
  }

  function ratingInline(rating, count) {
    const r = rating ? rating.toFixed(1) : "—";
    let html = '<span class="badge-dot ' + ratingBand(rating) + '"></span>' +
      starsHTML(rating) + '<span class="rating-num">' + r + '</span>';
    if (typeof count === "number") {
      html += ' <span class="review-count">(' + count + (count === 1 ? " review" : " reviews") + ')</span>';
    }
    return html;
  }

  function barRow(label, value) {
    const pct = Math.max(0, Math.min(100, (value / 5) * 100));
    return (
      '<div class="bar-row"><span class="bar-label">' + escapeHTML(label) + '</span>' +
      '<span class="bar-track"><span class="bar-fill" style="width:' + pct.toFixed(0) + '%"></span></span>' +
      '<span>' + value.toFixed(1) + '</span></div>'
    );
  }

  function statItem(value, label) {
    return '<span><strong>' + value + '</strong>' + label + '</span>';
  }

  // ---------- Map ----------

  function initMap() {
    map = L.map("map", { scrollWheelZoom: false }).setView(RMC_DATA.center, RMC_DATA.zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
  }

  function markerIcon(rating) {
    return L.divIcon({
      className: "",
      html: '<div class="rmc-marker ' + ratingBand(rating) + '"><span>' + rating.toFixed(1) + '</span></div>',
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -30]
    });
  }

  function updateMarkers(list) {
    markerLayer.clearLayers();
    Object.keys(markers).forEach(k => delete markers[k]);
    list.forEach(complex => {
      const rating = complexOverall(complex);
      const marker = L.marker([complex.lat, complex.lng], { icon: markerIcon(rating) });
      marker.bindPopup(
        '<div class="popup-title">' + escapeHTML(complex.name) + '</div>' +
        ratingInline(rating, complex.reviews.length) +
        '<div class="popup-price">' + escapeHTML(complex.price) + '</div>' +
        '<button class="icon-btn popup-view-btn" data-id="' + complex.id + '" type="button">View Details</button>'
      );
      marker.addTo(markerLayer);
      markers[complex.id] = marker;
    });
  }

  function focusMarker(id) {
    const marker = markers[id];
    if (!marker) return;
    map.flyTo(marker.getLatLng(), 15, { duration: 0.6 });
    marker.openPopup();
  }

  // ---------- Filtering / sorting ----------

  function getFilteredSorted() {
    const q = (document.getElementById("listSearch").value || "").trim().toLowerCase();
    const activeChip = document.querySelector(".chip.active");
    const minRating = parseFloat(activeChip ? activeChip.dataset.min : "0");
    const sortBy = document.getElementById("sortSelect").value;

    const list = RMC_DATA.complexes.filter(c => {
      const matchesText = !q || c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q);
      const matchesRating = complexOverall(c) >= minRating;
      return matchesText && matchesRating;
    });

    list.sort((a, b) => {
      if (sortBy === "rating") return complexOverall(b) - complexOverall(a);
      if (sortBy === "reviews") return b.reviews.length - a.reviews.length;
      if (sortBy === "price") return a.priceMin - b.priceMin;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }

  // ---------- Cards ----------

  function renderCards() {
    const list = getFilteredSorted();
    const wrap = document.getElementById("listingWrap");

    if (!list.length) {
      wrap.innerHTML = '<div class="empty-state">No complexes match your filters. Try clearing the search or lowering the minimum rating.</div>';
      updateMarkers([]);
      return;
    }

    wrap.innerHTML = list.map(c => {
      const landlord = RMC_DATA.landlords.find(l => l.id === c.landlordId);
      const rating = complexOverall(c);
      const lRating = landlordOverall(c.landlordId);
      return (
        '<div class="complex-card" data-id="' + c.id + '">' +
          '<div class="card-top">' +
            '<div><h3>' + escapeHTML(c.name) + '</h3>' +
            '<p class="card-address">' + escapeHTML(c.address) + '</p></div>' +
            '<div class="card-price">' + escapeHTML(c.price) + '</div>' +
          '</div>' +
          '<div class="card-rating-row">' + ratingInline(rating, c.reviews.length) + '</div>' +
          '<div class="card-meta">' +
            '<span class="card-landlord">' + escapeHTML(landlord.name) + ' · ' + lRating.toFixed(1) + '★ landlord</span>' +
            '<button class="icon-btn card-map-btn" data-id="' + c.id + '" type="button">📍 View on map</button>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    updateMarkers(list);
  }

  // ---------- Landlord spotlight ----------

  function renderLandlordGrid() {
    const grid = document.getElementById("landlordGrid");
    grid.innerHTML = RMC_DATA.landlords.map(l => {
      const props = landlordComplexes(l.id);
      const rating = landlordOverall(l.id);
      const count = landlordReviewCount(l.id);
      return (
        '<div class="landlord-card">' +
          '<h3>' + escapeHTML(l.name) + '</h3>' +
          '<div>' + ratingInline(rating, count) + '</div>' +
          '<div class="landlord-props">Manages: ' + props.map(p => escapeHTML(p.name)).join(", ") + '</div>' +
        '</div>'
      );
    }).join("");
  }

  // ---------- Stats ----------

  function renderStats() {
    const totalReviews = RMC_DATA.complexes.reduce((sum, c) => sum + c.reviews.length, 0);
    document.getElementById("heroStats").innerHTML =
      statItem(RMC_DATA.complexes.length, "Complexes Listed") +
      statItem(RMC_DATA.landlords.length, "Landlords Tracked") +
      statItem(totalReviews, "Renter Reviews") +
      statItem(RMC_DATA.city, "Metro Area");
  }

  // ---------- Modal ----------

  function openModal(id) {
    const complex = RMC_DATA.complexes.find(c => c.id === id);
    if (!complex) return;
    activeComplexId = id;
    const landlord = RMC_DATA.landlords.find(l => l.id === complex.landlordId);
    const rating = complexOverall(complex);
    const lRating = landlordOverall(complex.landlordId);
    const otherProps = landlordComplexes(complex.landlordId).filter(p => p.id !== complex.id);

    const subRatingsHTML = Object.entries(complex.subRatings)
      .map(([key, val]) => barRow(capitalize(key), val)).join("");

    const reviewsHTML = complex.reviews.slice().reverse().map(r => (
      '<div class="review-item">' +
        '<div class="review-item-top">' +
          '<span class="review-author">' + escapeHTML(r.author) +
            (r.isUserSubmitted ? '<span class="you-badge">YOU</span>' : '') + '</span>' +
          '<span class="review-date">' + escapeHTML(r.date) + '</span>' +
        '</div>' +
        ratingInline(r.rating) +
        '<p class="review-text">' + escapeHTML(r.text) + '</p>' +
        '<div class="review-landlord-rating">Landlord rating: ' + r.landlordRating.toFixed(1) + '★</div>' +
      '</div>'
    )).join("");

    document.getElementById("modalContent").innerHTML =
      '<h2 id="modalTitle">' + escapeHTML(complex.name) + '</h2>' +
      '<p class="modal-address">' + escapeHTML(complex.address) + '</p>' +
      '<div class="card-rating-row">' + ratingInline(rating, complex.reviews.length) + '</div>' +
      '<p class="modal-price">' + escapeHTML(complex.price) + ' · ' + escapeHTML(complex.beds) + '</p>' +

      '<div class="modal-section"><h4>Ratings Breakdown</h4>' +
        '<div class="subrating-grid">' + subRatingsHTML + '</div>' +
      '</div>' +

      '<div class="modal-section"><h4>Landlord / Property Manager</h4>' +
        '<div class="landlord-mini">' +
          '<div class="landlord-mini-top"><strong>' + escapeHTML(landlord.name) + '</strong>' + ratingInline(lRating) + '</div>' +
          (otherProps.length
            ? '<div class="landlord-props">Also manages: ' + otherProps.map(p => escapeHTML(p.name)).join(", ") + '</div>'
            : '<div class="landlord-props">Only property on RateMyComplex right now.</div>') +
        '</div>' +
      '</div>' +

      '<div class="modal-section"><h4>Reviews (' + complex.reviews.length + ')</h4>' +
        '<div class="reviews-list">' + (reviewsHTML || '<p>No reviews yet. Be the first to write one.</p>') + '</div>' +
        '<button class="btn btn-primary" id="openReviewFormBtn" type="button" style="margin-top:14px;">Write a Review</button>' +
      '</div>' +

      buildReviewFormHTML();

    initStarInputs();
    document.getElementById("modalBackdrop").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    document.getElementById("modalBackdrop").classList.remove("open");
    document.body.style.overflow = "";
    activeComplexId = null;
  }

  // ---------- Review form ----------

  function buildReviewFormHTML() {
    return (
      '<form class="review-form" id="reviewForm" hidden>' +
        '<h3>Write a review</h3>' +
        '<div class="form-row"><label>Overall rating for the complex</label>' +
          '<div class="star-input" id="complexStarInput" data-value="0"></div></div>' +
        '<div class="form-row"><label>Rating for the landlord / property manager</label>' +
          '<div class="star-input" id="landlordStarInput" data-value="0"></div></div>' +
        '<div class="form-row"><label for="reviewText">Your review</label>' +
          '<textarea id="reviewText" rows="4" placeholder="What should other renters know?"></textarea></div>' +
        '<div class="form-row checkbox-row"><label><input type="checkbox" id="anonToggle" checked> Post anonymously</label></div>' +
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-ghost" id="cancelReview">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">Submit Review</button>' +
        '</div>' +
      '</form>'
    );
  }

  function initStarInputs() {
    ["complexStarInput", "landlordStarInput"].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = "";
      for (let i = 1; i <= 5; i++) {
        const span = document.createElement("span");
        span.textContent = "★";
        span.dataset.value = i;
        el.appendChild(span);
      }
      el.addEventListener("click", (e) => {
        if (e.target.tagName !== "SPAN") return;
        const val = parseInt(e.target.dataset.value, 10);
        el.dataset.value = val;
        Array.from(el.children).forEach(child => {
          child.classList.toggle("filled", parseInt(child.dataset.value, 10) <= val);
        });
      });
    });
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    const complexVal = parseInt(document.getElementById("complexStarInput").dataset.value || "0", 10);
    const landlordVal = parseInt(document.getElementById("landlordStarInput").dataset.value || "0", 10);
    const text = document.getElementById("reviewText").value.trim();
    const anon = document.getElementById("anonToggle").checked;

    if (!complexVal || !landlordVal) {
      showToast("Please rate both the complex and the landlord.");
      return;
    }
    if (!text) {
      showToast("Please write a few words about your experience.");
      return;
    }

    const complex = RMC_DATA.complexes.find(c => c.id === activeComplexId);
    const review = {
      author: anon ? "Anonymous Resident" : "Verified Resident",
      rating: complexVal,
      landlordRating: landlordVal,
      date: new Date().toISOString().slice(0, 10),
      text: text,
      isUserSubmitted: true
    };
    complex.reviews.push(review);
    const saved = loadUserReviews();
    saved.push({ complexId: complex.id, review: review });
    saveUserReviews(saved);

    showToast("Thanks — your review was posted.");
    openModal(complex.id);
    renderCards();
    renderLandlordGrid();
    renderStats();
  }

  // ---------- Toast ----------

  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // ---------- Init / events ----------

  function init() {
    applyUserReviews();
    initMap();
    renderStats();
    renderCards();
    renderLandlordGrid();

    document.getElementById("listSearch").addEventListener("input", renderCards);
    document.getElementById("sortSelect").addEventListener("change", renderCards);

    document.getElementById("ratingChips").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderCards();
    });

    document.getElementById("heroSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      document.getElementById("listSearch").value = document.getElementById("heroSearchInput").value;
      renderCards();
      document.getElementById("browse").scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("listingWrap").addEventListener("click", (e) => {
      const mapBtn = e.target.closest(".card-map-btn");
      if (mapBtn) {
        e.stopPropagation();
        focusMarker(mapBtn.dataset.id);
        return;
      }
      const card = e.target.closest(".complex-card");
      if (card) openModal(card.dataset.id);
    });

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".popup-view-btn");
      if (btn) openModal(btn.dataset.id);
    });

    document.getElementById("modalBackdrop").addEventListener("click", (e) => {
      if (e.target.id === "modalBackdrop") closeModal();
    });
    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    document.getElementById("modalContent").addEventListener("click", (e) => {
      if (e.target.id === "openReviewFormBtn") {
        document.getElementById("reviewForm").hidden = false;
        e.target.style.display = "none";
      }
      if (e.target.id === "cancelReview") {
        document.getElementById("reviewForm").hidden = true;
        const openBtn = document.getElementById("openReviewFormBtn");
        if (openBtn) openBtn.style.display = "";
      }
    });
    document.getElementById("modalContent").addEventListener("submit", (e) => {
      if (e.target.id === "reviewForm") handleReviewSubmit(e);
    });

    document.getElementById("headerWriteReview").addEventListener("click", () => {
      document.getElementById("browse").scrollIntoView({ behavior: "smooth" });
      showToast("Pick a complex below, then hit “Write a Review.”");
    });
    document.getElementById("claimListingBtn").addEventListener("click", () => {
      showToast("Property manager claims are coming soon.");
    });
    document.getElementById("signInBtn").addEventListener("click", () => {
      showToast("Accounts are coming soon — reviews currently post anonymously by default.");
    });
    document.getElementById("dismissBanner").addEventListener("click", () => {
      document.getElementById("demoBanner").classList.add("hidden");
    });
    document.getElementById("resetDemoData").addEventListener("click", () => {
      if (confirm("Clear all reviews you've submitted in this browser and reload?")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
