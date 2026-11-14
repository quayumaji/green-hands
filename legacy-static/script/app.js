(function () {
  "use strict";
  const data = window.GH_DATA;
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const storageKey = "green-hands-cart-v1";
  let cart = readCart();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }
  function priceText(cents) { return currency.format(cents / 100); }
  function whatsappUrl(message) {
    const digits = data.business.phone.replace(/\D/g, "");
    const internationalNumber = digits.length === 10 ? "1" + digits : digits;
    return "https://wa.me/" + internationalNumber + (message ? "?text=" + encodeURIComponent(message) : "");
  }

  function readCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved.filter(function (line) {
        return line && typeof line.id === "string" && Number.isInteger(line.quantity) && line.quantity > 0;
      }).map(function (line) {
        return { id: line.id, quantity: Math.min(line.quantity, 20), choices: line.choices && typeof line.choices === "object" ? line.choices : {} };
      });
    } catch (error) {
      console.warn("The saved cart could not be read.", error);
      return [];
    }
  }
  function saveCart() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch (error) {
      showNotice("Your browser couldn't save this cart. Keep this page open while ordering.", true);
      console.error("The cart could not be saved.", error);
    }
    renderCart();
  }

  function photoMarkup(photo, ratio, extraClass, showCaption) {
    const classes = ["photo-slot", "ratio-" + (ratio || "dish"), extraClass || ""].filter(Boolean).join(" ");
    const alt = photo && photo.alt ? photo.alt : "Restaurant photo";
    const caption = showCaption === false ? "" : '<span class="photo-caption">' + escapeHtml(photo && photo.label ? photo.label : "Add your photo here") + '</span>';
    if (photo && photo.image) {
      return '<div class="' + classes + '"><img src="' + escapeHtml(photo.image) + '" alt="' + escapeHtml(alt) + '" loading="lazy" decoding="async">' + caption + '</div>';
    }
    return '<div class="' + classes + ' photo-placeholder" role="img" aria-label="' + escapeHtml(alt + " — photo placeholder") + '"><span class="camera-icon" aria-hidden="true">⌕</span>' + caption + '</div>';
  }
  function fillPhotoSlots() {
    document.querySelectorAll("[data-photo]").forEach(function (slot) {
      const photo = data.photos[slot.dataset.photo];
      if (!photo) return;
      const extraClasses = Array.from(slot.classList).filter(function (className) {
        return className !== "photo-slot" && !className.startsWith("ratio-");
      }).join(" ");
      slot.outerHTML = photoMarkup(photo, slot.dataset.ratio || "dish", extraClasses, !slot.closest(".favorite-card"));
    });
  }

  function renderHeaderFooter() {
    const page = document.body.dataset.page || "";
    const instagramHandle = data.business.instagram.replace(/^@/, "");
    const nav = [["home", "index.html", "Home"], ["menu", "menu.html", "Menu"], ["about", "about.html", "Our story"], ["gallery", "gallery.html", "Gallery"], ["contact", "contact.html", "Contact"]];
    const navMarkup = nav.map(function (item) {
      return '<a href="' + item[1] + '"' + (page === item[0] ? ' aria-current="page"' : "") + '>' + item[2] + '</a>';
    }).join("");
    const header = document.querySelector("[data-site-header]");
    if (header) {
      header.innerHTML = '<div class="container header-inner"><a class="brand" href="index.html" aria-label="Green Hands African Restaurant home"><span class="brand-mark" aria-hidden="true">GH</span><span class="brand-name">GREEN<span>HANDS</span><small>AFRICAN RESTAURANT</small></span></a><button class="mobile-menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="primary-navigation"><span></span><span></span><span class="sr-only">Open menu</span></button><nav class="main-nav" id="primary-navigation" aria-label="Main navigation">' + navMarkup + '</nav><button class="cart-trigger" type="button" data-open-cart aria-label="Open shopping cart"><span aria-hidden="true">Bag</span><span class="cart-count" data-cart-count>0</span></button></div>';
      const main = document.querySelector("main");
      if (main) main.id = "main";
    }
    const footer = document.querySelector("[data-site-footer]");
    if (footer) {
      footer.innerHTML = '<div class="container footer-main"><div class="footer-brand"><a class="brand brand-light" href="index.html"><span class="brand-mark" aria-hidden="true">GH</span><span class="brand-name">GREEN<span>HANDS</span><small>AFRICAN RESTAURANT</small></span></a><p>Honest West and East African food, cooked from scratch and served with a family-kitchen welcome.</p></div><nav class="footer-links" aria-label="Footer navigation"><h2 class="footer-heading">Explore</h2><a href="menu.html">Menu & ordering</a><a href="about.html">Our story</a><a href="gallery.html">Gallery</a><a href="contact.html">Contact</a></nav><section class="footer-contact" aria-labelledby="footer-contact-title"><h2 class="footer-heading" id="footer-contact-title">Come on in</h2><address>' + escapeHtml(data.business.address) + '</address><a class="footer-whatsapp" href="' + escapeHtml(whatsappUrl()) + '" target="_blank" rel="noopener noreferrer" aria-label="Message Green Hands on WhatsApp at ' + escapeHtml(data.business.phone) + '"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M20.1 11.8a8.1 8.1 0 0 1-11.9 7.1L3 20l1.2-4.9a8.1 8.1 0 1 1 15.9-3.3Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.6 8.1c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4 0 .5l-.6.7c-.2.2-.2.4-.1.6.4.8 1.2 1.5 2 1.9.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.2.1.4.3.4.5 0 .3-.2 1.1-.7 1.5-.5.5-1.2.7-1.8.6-.6-.1-1.4-.4-2.4-.9-1.2-.7-2.2-1.7-2.8-2.8-.5-.8-.8-1.7-.8-2.3 0-.6.3-1.3.7-1.8Z" fill="currentColor"/></svg><span>WhatsApp</span><span>' + escapeHtml(data.business.phone) + '</span></a><a class="footer-social-link" href="https://www.instagram.com/' + encodeURIComponent(instagramHandle) + '/" target="_blank" rel="noopener noreferrer" aria-label="Visit Green Hands African Restaurant on Instagram, @' + escapeHtml(instagramHandle) + '"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><circle cx="17.6" cy="6.6" r="1" fill="currentColor"/></svg><span>@' + escapeHtml(instagramHandle) + '</span></a><p>Tue–Sat · 11 am–8 pm<br>Sun · 11 am–6 pm<br>Mon · Closed</p></section></div><div class="container footer-bottom"><span>© ' + new Date().getFullYear() + ' Green Hands African Restaurant</span><span>Made with care in Glen Burnie, Maryland</span></div>';
    }
  }

  function renderCartShell() {
    const root = document.querySelector("[data-cart-root]");
    if (!root) return;
    root.innerHTML = '<div class="drawer-scrim" data-close-cart></div><section class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden="true" tabindex="-1"><div class="cart-header"><div><p class="eyebrow">Pickup order request</p><h2 id="cart-title">Your bag <span data-cart-title-count>(0)</span></h2></div><button class="icon-button" type="button" data-close-cart aria-label="Close cart">×</button></div><div class="cart-content"><div class="cart-lines" data-cart-lines></div><div class="cart-empty" data-cart-empty><span aria-hidden="true">✳</span><h3>Your bag is taking a breather.</h3><p>Add something delicious from the menu.</p><a class="text-link" href="menu.html">Browse the menu →</a></div><div class="checkout-area" data-checkout-area><div class="cart-total"><span>Estimated subtotal</span><strong data-cart-total>$0.00</strong></div><p class="checkout-caption">Tax, payment, and pickup are confirmed directly with the restaurant.</p><form id="checkout-form" class="checkout-form"><label>Pickup preference<select name="pickupPreference"><option value="asap">As soon as possible</option><option value="scheduled">Request a scheduled pickup</option></select></label><label class="pickup-time-field" hidden>Requested pickup date & time<input type="datetime-local" name="pickupTime"></label><label>Order note <span class="optional">(optional)</span><textarea name="note" rows="2" maxlength="300" placeholder="Anything our kitchen should know?"></textarea></label><button class="button button-gold checkout-button" type="submit">Prepare email order request <span aria-hidden="true">→</span></button><p class="checkout-caption">This opens your email app. Send the message, then wait for the restaurant to confirm your order. Online payment is not available on this front-end-only site.</p><p class="form-feedback" data-checkout-feedback role="status" aria-live="polite"></p><a class="call-to-order" href="tel:+14104126694">Prefer to call? (410) 412-6694</a></form></div></div></section><div class="lightbox" data-lightbox role="dialog" aria-modal="true" aria-label="Photo viewer" aria-hidden="true"><button class="icon-button lightbox-close" type="button" aria-label="Close photo">×</button><div class="lightbox-content"></div></div><div class="toast" data-toast role="status" aria-live="polite"></div>';
    bindCartDrawer();
  }

  function renderMenu() {
    const host = document.querySelector("#menu-categories");
    if (!host) return;
    host.innerHTML = data.categories.map(function (category, categoryIndex) {
      const items = data.menu.filter(function (item) { return item.category === category.id; });
      return '<section class="menu-category" id="' + escapeHtml(category.id) + '" aria-labelledby="' + escapeHtml(category.id) + '-title"><div class="category-heading reveal"><div><span class="category-number" aria-hidden="true">' + String(categoryIndex + 1).padStart(2, "0") + '</span><h2 id="' + escapeHtml(category.id) + '-title">' + escapeHtml(category.title) + '</h2></div><p>' + escapeHtml(category.intro) + '</p></div><div class="menu-grid">' + items.map(renderMenuItem).join("") + '</div></section>';
    }).join("");
  }
  function renderMenuItem(item) {
    const unavailable = item.price === null;
    const choices = (item.choices || []).map(function (choice, index) {
      return '<label class="choice-field">' + escapeHtml(choice.name) + '<select data-choice="' + index + '" aria-label="' + escapeHtml(choice.name + " for " + item.name) + '">' + choice.values.map(function (value) {
        return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
      }).join("") + '</select></label>';
    }).join("");
    const tags = (item.tags || []).map(function (tag) { return '<span class="diet-tag">' + escapeHtml(tag) + '</span>'; }).join("");
    const action = unavailable && item.whatsappInquiry
      ? '<a class="button button-green add-button" href="' + escapeHtml(whatsappUrl(item.whatsappInquiry)) + '" target="_blank" rel="noopener noreferrer">Ask price on WhatsApp <span aria-hidden="true">↗</span></a>'
      : '<button class="button ' + (unavailable ? "button-muted" : "button-green") + ' add-button" type="button" data-add="' + escapeHtml(item.id) + '"' + (unavailable ? ' disabled aria-disabled="true"' : '') + '>' + (unavailable ? 'Price to be confirmed' : 'Add to bag <span aria-hidden="true">+</span>') + '</button>';
    return '<article class="menu-card reveal" data-menu-item="' + escapeHtml(item.id) + '">' + photoMarkup(item.photo, "dish", "menu-photo", false) + '<div class="menu-card-content"><div class="menu-card-top"><h3>' + escapeHtml(item.name) + '</h3><strong class="menu-price">' + (unavailable ? escapeHtml(item.displayPrice) : priceText(item.price)) + '</strong></div><p class="menu-description">' + escapeHtml(item.description) + '</p>' + (tags ? '<div class="diet-tags">' + tags + '</div>' : '') + (choices ? '<div class="choice-fields">' + choices + '</div>' : '') + action + '</div></article>';
  }

  function renderGallery() {
    const host = document.querySelector("#gallery-grid");
    if (!host) return;
    host.innerHTML = data.gallery.map(function (key, index) {
      const photo = data.photos[key];
      return '<li><button class="gallery-tile reveal" type="button" data-gallery-photo="' + escapeHtml(key) + '" aria-label="Open photo: ' + escapeHtml(photo.label) + '">' + photoMarkup(photo, index === 0 ? "landscape" : "dish", "") + '<span class="gallery-tile-label">' + escapeHtml(photo.label) + '<span aria-hidden="true">↗</span></span></button></li>';
    }).join("");
  }

  function lineProduct(line) { return data.menu.find(function (item) { return item.id === line.id; }); }
  function lineKey(line) { return line.id + "|" + JSON.stringify(line.choices || {}); }
  function cartCount() { return cart.reduce(function (sum, line) { return sum + line.quantity; }, 0); }
  function renderCart() {
    document.querySelectorAll("[data-cart-count]").forEach(function (element) { element.textContent = cartCount(); });
    const countTitle = document.querySelector("[data-cart-title-count]");
    if (countTitle) countTitle.textContent = "(" + cartCount() + ")";
    const linesHost = document.querySelector("[data-cart-lines]");
    if (!linesHost) return;
    const hasItems = cart.length > 0;
    const empty = document.querySelector("[data-cart-empty]");
    const checkout = document.querySelector("[data-checkout-area]");
    if (empty) empty.hidden = hasItems;
    if (checkout) checkout.hidden = !hasItems;
    linesHost.innerHTML = cart.map(function (line) {
      const item = lineProduct(line);
      if (!item || item.price === null) return "";
      const detail = Object.entries(line.choices || {}).map(function (entry) { return entry[0] + ": " + entry[1]; }).join(" · ");
      return '<article class="cart-line"><div class="cart-line-copy"><b>' + escapeHtml(item.name) + '</b>' + (detail ? '<span>' + escapeHtml(detail) + '</span>' : '') + '<strong>' + priceText(item.price * line.quantity) + '</strong></div><div class="quantity-control" aria-label="Quantity for ' + escapeHtml(item.name) + '"><button type="button" data-quantity="-1" data-key="' + escapeHtml(lineKey(line)) + '" aria-label="Remove one ' + escapeHtml(item.name) + '">−</button><span>' + line.quantity + '</span><button type="button" data-quantity="1" data-key="' + escapeHtml(lineKey(line)) + '" aria-label="Add one ' + escapeHtml(item.name) + '">+</button><button type="button" class="remove-line" data-remove="' + escapeHtml(lineKey(line)) + '">Remove</button></div></article>';
    }).join("");
    const total = cart.reduce(function (sum, line) {
      const item = lineProduct(line);
      return sum + (item && item.price ? item.price * line.quantity : 0);
    }, 0);
    const totalEl = document.querySelector("[data-cart-total]");
    if (totalEl) totalEl.textContent = priceText(total);
  }

  function showNotice(message, isError) {
    const toast = document.querySelector("[data-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle("toast-error", Boolean(isError));
    toast.classList.add("toast-visible");
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(function () { toast.classList.remove("toast-visible"); }, 2600);
  }
  function openCart() {
    const drawer = document.querySelector(".cart-drawer");
    if (!drawer) return;
    document.body.classList.add("cart-open");
    drawer.setAttribute("aria-hidden", "false");
    const closeButton = drawer.querySelector("[data-close-cart]");
    if (closeButton) closeButton.focus();
  }
  function closeCart() {
    const drawer = document.querySelector(".cart-drawer");
    if (!drawer) return;
    document.body.classList.remove("cart-open");
    drawer.setAttribute("aria-hidden", "true");
    const trigger = document.querySelector("[data-open-cart]");
    if (trigger) trigger.focus();
  }

  function bindCartDrawer() {
    document.addEventListener("click", function (event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const menuAction = target.closest("#menu-categories .add-button");
      if (menuAction) menuAction.classList.add("is-clicked");
      if (target.closest("[data-open-cart]")) openCart();
      if (target.closest("[data-close-cart]")) closeCart();
      const addButton = target.closest("[data-add]");
      if (addButton && !addButton.disabled) {
        const card = addButton.closest("[data-menu-item]");
        const item = data.menu.find(function (candidate) { return candidate.id === addButton.dataset.add; });
        if (!item || !card) return;
        const choices = {};
        card.querySelectorAll("[data-choice]").forEach(function (select) {
          choices[item.choices[Number(select.dataset.choice)].name] = select.value;
        });
        const line = { id: item.id, choices: choices, quantity: 1 };
        const existing = cart.find(function (candidate) { return lineKey(candidate) === lineKey(line); });
        if (existing) existing.quantity = Math.min(20, existing.quantity + 1);
        else cart.push(line);
        saveCart();
        addButton.classList.remove("added");
        requestAnimationFrame(function () { addButton.classList.add("added"); });
        document.querySelectorAll("[data-cart-count]").forEach(function (badge) {
          badge.classList.remove("count-bounce");
          requestAnimationFrame(function () { badge.classList.add("count-bounce"); });
        });
        showNotice(item.name + " added to your bag");
      }
      const quantityButton = target.closest("[data-quantity]");
      if (quantityButton) {
        const line = cart.find(function (candidate) { return lineKey(candidate) === quantityButton.dataset.key; });
        if (line) {
          line.quantity += Number(quantityButton.dataset.quantity);
          if (line.quantity <= 0) cart = cart.filter(function (candidate) { return candidate !== line; });
          saveCart();
        }
      }
      const removeButton = target.closest("[data-remove]");
      if (removeButton) {
        cart = cart.filter(function (candidate) { return lineKey(candidate) !== removeButton.dataset.remove; });
        saveCart();
      }
      const galleryButton = target.closest("[data-gallery-photo]");
      if (galleryButton) openLightbox(data.photos[galleryButton.dataset.galleryPhoto]);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { closeCart(); closeLightbox(); }
    });
    const preference = document.querySelector('[name="pickupPreference"]');
    if (preference) preference.addEventListener("change", function () {
      const field = document.querySelector(".pickup-time-field");
      const input = field && field.querySelector("input");
      if (field) field.hidden = preference.value !== "scheduled";
      if (input) input.required = preference.value === "scheduled";
    });
    const checkoutForm = document.querySelector("#checkout-form");
    if (checkoutForm) checkoutForm.addEventListener("submit", startCheckout);
  }

  function openLightbox(photo) {
    const lightbox = document.querySelector("[data-lightbox]");
    if (!lightbox || !photo) return;
    lightbox.querySelector(".lightbox-content").innerHTML = photoMarkup(photo, "landscape", "lightbox-photo");
    lightbox.classList.add("lightbox-open");
    lightbox.setAttribute("aria-hidden", "false");
    const close = lightbox.querySelector(".lightbox-close");
    if (close) close.focus();
  }
  function closeLightbox() {
    const lightbox = document.querySelector("[data-lightbox]");
    if (!lightbox) return;
    lightbox.classList.remove("lightbox-open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  function startCheckout(event) {
    event.preventDefault();
    const feedback = document.querySelector("[data-checkout-feedback]");
    const formData = new FormData(event.currentTarget);
    const pickupPreference = String(formData.get("pickupPreference") || "asap");
    const pickupTime = String(formData.get("pickupTime") || "");
    const note = String(formData.get("note") || "");
    if (!cart.length) return;
    if (pickupPreference === "scheduled" && (!pickupTime || new Date(pickupTime).getTime() <= Date.now())) {
      if (feedback) feedback.textContent = "Choose a future pickup date and time.";
      return;
    }
    if (feedback) feedback.textContent = "";
    const lines = cart.map(function (line) {
      const item = lineProduct(line);
      if (!item) return "";
      const choices = Object.entries(line.choices || {}).map(function (entry) { return entry[0] + ": " + entry[1]; }).join(", ");
      return line.quantity + " × " + item.name + (choices ? " (" + choices + ")" : "") + " — " + priceText(item.price * line.quantity);
    }).filter(Boolean);
    const pickup = pickupPreference === "scheduled" ? "Requested time: " + new Date(pickupTime).toLocaleString() : "As soon as possible";
    const body = [
      "Hello Green Hands African Restaurant,",
      "",
      "I'd like to request this pickup order:",
      lines.join("\n"),
      "",
      "Estimated subtotal: " + document.querySelector("[data-cart-total]").textContent,
      "Pickup: " + pickup,
      note ? "Order note: " + note : "",
      "",
      "Please confirm availability, final total, and payment/pickup details."
    ].filter(Boolean).join("\n");
    const subject = "Pickup order request — Green Hands";
    if (feedback) feedback.textContent = "Your email app should open with the request. Send it there, then wait for the restaurant to confirm.";
    window.location.href = "mailto:" + data.business.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function bindContactForm() {
    const form = document.querySelector("#contact-form");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const feedback = document.querySelector("#contact-feedback");
      if (feedback) feedback.textContent = "";
      const fields = Object.fromEntries(new FormData(form).entries());
      const subject = "Website inquiry — " + fields.topic;
      const body = "From: " + fields.name + "\nReply email: " + fields.email + "\n\n" + fields.message;
      if (feedback) feedback.textContent = "Your email app should open with your message. Send it there to contact the restaurant.";
      window.location.href = "mailto:" + data.business.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  function bindMobileNav() {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      toggle.setAttribute("aria-label", expanded ? "Open navigation menu" : "Close navigation menu");
      nav.classList.toggle("nav-open", !expanded);
    });
  }
  function setupReveals() {
    const elements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach(function (element) { element.classList.add("is-visible"); });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement.children).filter(function (child) { return child.classList.contains("reveal"); });
          entry.target.style.setProperty("--reveal-delay", Math.max(0, Math.min(siblings.indexOf(entry.target), 5)) * 70 + "ms");
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach(function (element) { observer.observe(element); });
  }

  function init() {
    renderHeaderFooter();
    fillPhotoSlots();
    renderCartShell();
    renderMenu();
    renderGallery();
    renderCart();
    bindMobileNav();
    bindContactForm();
    setupReveals();
    const lightbox = document.querySelector("[data-lightbox]");
    if (lightbox) lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox || (event.target instanceof Element && event.target.closest(".lightbox-close"))) closeLightbox();
    });
  }
  document.addEventListener("DOMContentLoaded", init);
}());
