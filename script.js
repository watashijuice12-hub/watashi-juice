// Set this to the official WhatsApp Business number when it is confirmed.
// Use international digits only: country code + number, without +, spaces or punctuation.
const WATASHI_WHATSAPP_BUSINESS_NUMBER = '256786314245';

// Shared, accessible mobile-navigation behaviour for the static site.
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-button');
  const navigation = document.querySelector('.primary-nav');

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      navigation.classList.toggle('is-open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });

    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      navigation.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    }));
  }

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  // Catalogue size selectors update the displayed price used by the local order preview.
  document.querySelectorAll('.modern-product-card').forEach((card) => {
    const price = card.querySelector('[data-product-price]');
    const size = card.querySelector('[data-product-size]');
    const options = card.querySelectorAll('.size-option');

    options.forEach((option) => option.addEventListener('click', () => {
      options.forEach((button) => {
        const selected = button === option;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      price.textContent = option.dataset.price;
      size.textContent = option.dataset.size;
    }));
  });

  // Product catalogue filters progressively reveal only the matching, labelled pours.
  const productFilterButtons = document.querySelectorAll('[data-product-filter]');
  const productGrid = document.querySelector('#product-grid');
  const productFilterEmpty = document.querySelector('.product-filter-empty');

  if (productFilterButtons.length && productGrid && productFilterEmpty) {
    const productCards = Array.from(productGrid.querySelectorAll('.modern-product-card'));

    const applyProductFilter = (category) => {
      let visibleCards = 0;

      productCards.forEach((card) => {
        const matches = category === 'all' || card.dataset.productCategory === category;
        card.classList.toggle('is-filtered-out', !matches);
        card.hidden = !matches;
        card.setAttribute('aria-hidden', String(!matches));
        if (matches) visibleCards += 1;
      });

      const activeFilter = Array.from(productFilterButtons).find((button) => button.dataset.productFilter === category);
      productFilterButtons.forEach((button) => {
        const isActive = button === activeFilter;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      productFilterEmpty.hidden = visibleCards > 0;
      if (!productFilterEmpty.hidden && activeFilter) {
        productFilterEmpty.textContent = `No ${activeFilter.textContent.trim().toLowerCase()} pours are available just yet.`;
      }
    };

    productFilterButtons.forEach((button) => button.addEventListener('click', () => {
      applyProductFilter(button.dataset.productFilter);
    }));
  }

  // Order prototype: local selection, quantity and message preview only. No order is sent.
  const orderModal = document.querySelector('[data-order-modal]');
  const whatsappPreview = document.querySelector('[data-whatsapp-preview]');
  let previewOpener = null;

  const formatUGX = (amount) => `UGX ${amount.toLocaleString('en-US')}`;
  const priceNumber = (price) => Number(String(price).replace(/[^0-9]/g, ''));
  const defaultWhatsAppMessage = 'Hello Watashi Juice! I would like to know more about your juices and how to order.';

  document.querySelectorAll('[data-copy-mtn-number]').forEach((button) => button.addEventListener('click', async () => {
    const number = button.dataset.copyValue;
    if (!number) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(number);
      } else {
        const temporaryField = document.createElement('textarea');
        temporaryField.value = number;
        temporaryField.setAttribute('readonly', '');
        temporaryField.style.position = 'fixed';
        temporaryField.style.opacity = '0';
        document.body.append(temporaryField);
        temporaryField.select();
        const copied = document.execCommand('copy');
        temporaryField.remove();
        if (!copied) throw new Error('Copy command was unavailable.');
      }
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Copy unavailable';
    }
  }));
  const openWhatsAppConversation = (message) => {
    const url = `https://wa.me/${WATASHI_WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
    return true;
  };

  // All existing footer buttons use the same configured number; legacy URLs never run directly.
  document.querySelectorAll('.site-footer .whatsapp-button').forEach((button) => {
    button.removeAttribute('href');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openWhatsAppConversation(defaultWhatsAppMessage);
    });
  });

  const openWhatsAppPreview = (message, opener) => {
    if (!whatsappPreview) return;
    const messageBox = whatsappPreview.querySelector('[data-whatsapp-message]');
    if (!messageBox) return;
    messageBox.textContent = message;
    const copyButton = whatsappPreview.querySelector('[data-copy-whatsapp-message]');
    if (copyButton) copyButton.textContent = 'Copy Message';
    previewOpener = opener;
    whatsappPreview.hidden = false;
    document.body.classList.add('order-modal-open');
    whatsappPreview.querySelector('.whatsapp-preview-close')?.focus();
  };

  if (whatsappPreview) {
    const closeWhatsAppPreview = () => {
      if (whatsappPreview.hidden) return;
      whatsappPreview.hidden = true;
      document.body.classList.remove('order-modal-open');
      previewOpener?.focus();
    };
    whatsappPreview.querySelectorAll('[data-whatsapp-preview-close]').forEach((button) => button.addEventListener('click', closeWhatsAppPreview));
    whatsappPreview.querySelector('[data-copy-whatsapp-message]')?.addEventListener('click', async (event) => {
      const message = whatsappPreview.querySelector('[data-whatsapp-message]')?.textContent || '';
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(message);
        } else {
          const temporaryField = document.createElement('textarea');
          temporaryField.value = message;
          temporaryField.setAttribute('readonly', '');
          temporaryField.style.position = 'fixed';
          temporaryField.style.opacity = '0';
          document.body.append(temporaryField);
          temporaryField.select();
          const copied = document.execCommand('copy');
          temporaryField.remove();
          if (!copied) throw new Error('Copy command was unavailable.');
        }
        event.currentTarget.textContent = 'Copied';
      } catch {
        event.currentTarget.textContent = 'Copy unavailable';
      }
    });
    const previewActions = whatsappPreview.querySelector('.preview-actions');
    if (previewActions) {
      const chatButton = document.createElement('button');
      chatButton.className = 'button whatsapp-chat-action';
      chatButton.type = 'button';
      chatButton.textContent = 'Chat on WhatsApp';
      chatButton.addEventListener('click', () => {
        const message = whatsappPreview.querySelector('[data-whatsapp-message]')?.textContent || '';
        openWhatsAppConversation(message);
      });
      previewActions.prepend(chatButton);
    }

    document.querySelectorAll('[data-sample-order]').forEach((button) => {
      const panel = button.closest('.whatsapp-order-panel');
      const heading = panel?.querySelector('h2');
      const description = panel?.querySelector('div > p:not(.eyebrow)');
      if (heading) heading.textContent = 'Chat on WhatsApp';
      if (description) description.textContent = 'Have a question or ready to order? Chat with Watashi Juice on WhatsApp for help with your juice selection, payment and delivery.';
      button.textContent = 'Chat on WhatsApp';
      button.setAttribute('aria-label', 'Chat with Watashi Juice on WhatsApp');
      button.addEventListener('click', () => openWhatsAppConversation(defaultWhatsAppMessage));
    });
    document.addEventListener('keydown', (event) => {
      if (!whatsappPreview.hidden && event.key === 'Escape') closeWhatsAppPreview();
    });
  }

  if (orderModal) {
    const orderDialog = orderModal.querySelector('.order-modal-dialog');
    const orderProduct = orderModal.querySelector('[data-order-product]');
    const orderSize = orderModal.querySelector('[data-order-size]');
    const orderPrice = orderModal.querySelector('[data-order-price]');
    const orderTotal = orderModal.querySelector('[data-order-total]');
    const orderQuantity = orderModal.querySelector('[data-order-quantity]');
    const orderCloseButtons = orderModal.querySelectorAll('[data-order-modal-close]');
    const orderButtons = document.querySelectorAll('[data-order-button]');
    const previewButton = orderModal.querySelector('[data-order-preview]');
    let orderOpener = null;
    let selection = null;

    const renderSelection = () => {
      if (!selection) return;
      orderProduct.textContent = selection.name;
      orderSize.textContent = selection.size;
      orderPrice.textContent = formatUGX(selection.unitPrice);
      orderQuantity.textContent = String(selection.quantity);
      orderTotal.textContent = formatUGX(selection.unitPrice * selection.quantity);
    };

    const closeOrderModal = (restoreFocus = true) => {
      if (orderModal.hidden) return;
      orderModal.hidden = true;
      orderModal.setAttribute('aria-hidden', 'true');
      if (!whatsappPreview || whatsappPreview.hidden) document.body.classList.remove('order-modal-open');
      if (restoreFocus) orderOpener?.focus();
    };

    const openOrderModal = (button) => {
      const card = button.closest('.modern-product-card');
      if (!card) return;
      const name = card.querySelector('h2')?.textContent.trim();
      const size = card.querySelector('[data-product-size]')?.textContent.trim();
      const unitPrice = priceNumber(card.querySelector('[data-product-price]')?.textContent);
      if (!name || !size || !unitPrice) return;
      selection = { name, size, unitPrice, quantity: 1 };
      renderSelection();
      orderOpener = button;
      orderModal.hidden = false;
      orderModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('order-modal-open');
      orderDialog.querySelector('.order-modal-close')?.focus();
    };

    orderButtons.forEach((button) => button.addEventListener('click', () => openOrderModal(button)));
    orderCloseButtons.forEach((button) => button.addEventListener('click', () => closeOrderModal()));
    orderModal.querySelector('[data-order-quantity-decrease]')?.addEventListener('click', () => {
      if (!selection) return;
      selection.quantity = Math.max(1, selection.quantity - 1);
      renderSelection();
    });
    orderModal.querySelector('[data-order-quantity-increase]')?.addEventListener('click', () => {
      if (!selection) return;
      selection.quantity += 1;
      renderSelection();
    });
    previewButton?.addEventListener('click', () => {
      if (!selection) return;
      const bottleLabel = selection.quantity === 1 ? 'bottle' : 'bottles';
      const message = `Hello Watashi Juice!\n\nI would like to order:\n\nJuice: ${selection.name}\nBottle size: ${selection.size}\nQuantity: ${selection.quantity} ${bottleLabel}\nPrice per bottle: ${formatUGX(selection.unitPrice)}\nTotal: ${formatUGX(selection.unitPrice * selection.quantity)}\n\nPlease confirm the available payment and delivery options.`;
      closeOrderModal(false);
      openWhatsAppConversation(message);
    });
    document.addEventListener('keydown', (event) => {
      if (orderModal.hidden || event.key !== 'Escape') return;
      event.preventDefault();
      closeOrderModal();
    });
  }

  // Lightweight, looping flavour carousel for the homepage.
  const carousel = document.querySelector('[data-flavour-carousel]');
  if (carousel) {
    const viewport = carousel.querySelector('.carousel-viewport');
    const track = carousel.querySelector('.carousel-track');
    const previous = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const currentLabel = carousel.querySelector('[data-carousel-current]');
    const originalSlides = Array.from(track.children);
    const count = originalSlides.length;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let timer;
    let paused = false;
    let pointerStart = null;

    originalSlides.forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      const cloneImage = clone.querySelector('img');
      if (cloneImage) cloneImage.alt = '';
      track.appendChild(clone);
    });

    const slideDistance = () => {
      const firstSlide = track.querySelector('.flavour-slide');
      const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
      return firstSlide.getBoundingClientRect().width + gap;
    };

    const render = (animate = true) => {
      track.style.transition = animate ? '' : 'none';
      track.style.transform = `translateX(${-index * slideDistance()}px)`;
      currentLabel.textContent = String((index % count) + 1).padStart(2, '0');
    };

    const go = (direction) => {
      if (direction < 0 && index === 0) {
        index = count;
        render(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            index = count - 1;
            render(true);
          });
        });
        return;
      }
      index += direction;
      render(true);
    };

    const stopAutoplay = () => {
      window.clearInterval(timer);
      timer = undefined;
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (!paused && !prefersReducedMotion.matches) timer = window.setInterval(() => go(1), 5000);
    };

    previous.addEventListener('click', () => { go(-1); startAutoplay(); });
    next.addEventListener('click', () => { go(1); startAutoplay(); });
    track.addEventListener('transitionend', () => {
      if (index === count) {
        index = 0;
        render(false);
      }
    });
    carousel.addEventListener('mouseenter', () => { paused = true; stopAutoplay(); });
    carousel.addEventListener('mouseleave', () => { paused = false; startAutoplay(); });
    carousel.addEventListener('focusin', () => { paused = true; stopAutoplay(); });
    carousel.addEventListener('focusout', (event) => {
      if (!carousel.contains(event.relatedTarget)) { paused = false; startAutoplay(); }
    });
    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
    });
    viewport.addEventListener('pointerdown', (event) => {
      pointerStart = event.clientX;
      paused = true;
      stopAutoplay();
      viewport.setPointerCapture?.(event.pointerId);
    });
    viewport.addEventListener('pointerup', (event) => {
      if (pointerStart !== null) {
        const distance = event.clientX - pointerStart;
        if (Math.abs(distance) > 35) go(distance < 0 ? 1 : -1);
      }
      pointerStart = null;
      paused = false;
      startAutoplay();
    });
    viewport.addEventListener('pointercancel', () => { pointerStart = null; paused = false; startAutoplay(); });
    window.addEventListener('resize', () => render(false));
    prefersReducedMotion.addEventListener?.('change', startAutoplay);
    render(false);
    startAutoplay();
  }

  // Shared footer details: the same accessible content is applied to every static page.
  const footer = document.querySelector('.site-footer.unified-footer');
  if (footer) {
    const footerColumns = footer.querySelectorAll('.footer-grid > div');
    const findUs = footerColumns[0];
    const explore = footerColumns[1];
    const socialLinks = footer.querySelector('.social-placeholders');
    footer.querySelector('.footer-phone')?.remove();

    if (findUs) {
      findUs.innerHTML = `<h3>Find us</h3><div class="footer-find-details"><div class="footer-info"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10.2c0 5.3-8 10.3-8 10.3s-8-5-8-10.3a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10.2" r="2.6"/></svg><span>Kataza, Nakawa<br>Kampala, Uganda</span></div><div class="footer-info"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7.5v4.8l3.2 1.9"/></svg><span>9:00 AM &ndash; 10:00 PM</span></div><a class="footer-info" href="tel:0786314245"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.3 4.5 5.5 6.3c-.7.7-.8 1.8-.3 2.7 1.5 3 3.9 5.4 6.9 6.9.9.5 2 .4 2.7-.3l1.8-1.8-2.4-2.4-1.4.8c-1.6-.8-2.9-2.1-3.7-3.7l.8-1.4-2.6-2.6Z"/></svg><span>0786314245</span></a></div>`;
    }

    const footerSchedule = findUs?.querySelector('.footer-info:nth-of-type(2) span');
    if (footerSchedule) footerSchedule.innerHTML = 'Monday &ndash; Sunday<br>9:00 AM &ndash; 10:00 PM';

    if (explore) {
      explore.innerHTML = `<h3>Explore</h3><a href="index.html">Home</a><a href="products.html">Products</a><a href="about.html">About Us</a><a href="pay.html">How to Pay</a><a href="policies.html">Policies</a>`;
    }

    if (socialLinks) {
      socialLinks.innerHTML = `<span class="social-link" role="link" aria-disabled="true" tabindex="0" title="Official account pending confirmation"><svg class="social-brand-icon social-instagram" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.8" r=".8"/></svg>Instagram</span><span class="social-link" role="link" aria-disabled="true" tabindex="0" title="Official account pending confirmation"><svg class="social-brand-icon social-facebook" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 20v-7h2.4l.4-2.8h-2.8V8.4c0-.8.2-1.4 1.4-1.4h1.5V4.5c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7v2.1H8v2.8h2.7v7h2.8Z"/></svg>Facebook</span><span class="social-link" role="link" aria-disabled="true" tabindex="0" title="Official account pending confirmation"><svg class="social-brand-icon social-tiktok" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 3c.4 2.7 1.9 4.4 4.5 4.8v3.1c-1.6 0-3.1-.5-4.5-1.4v6.2a5.5 5.5 0 1 1-5.5-5.5c.4 0 .8 0 1.2.1v3.1a2.5 2.5 0 1 0 1.4 2.3V3h2.9Z"/></svg>TikTok</span>`;
    }
  }

  const homeSchedule = document.querySelector('.brand-facts > div:nth-child(2) dd');
  if (homeSchedule) homeSchedule.innerHTML = 'Monday &ndash; Sunday<br>9:00 AM &ndash; 10:00 PM';
});
