(() => {
  'use strict';

  const config = window.PET_GROOMER_CONFIG || {};
  const get = (path) => path.split('.').reduce((value, key) => value?.[key], config);

  const applyConfig = () => {
    document.title = config.copy?.pageTitle || config.business?.name || document.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && config.copy?.metaDescription) meta.content = config.copy.metaDescription;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.content = document.title;
    if (ogDescription && config.copy?.metaDescription) ogDescription.content = config.copy.metaDescription;

    const themeMap = {green:'--green',greenDeep:'--green-deep',cream:'--cream',accent:'--accent',ink:'--ink'};
    Object.entries(themeMap).forEach(([key, variable]) => {
      if (config.theme?.[key]) document.documentElement.style.setProperty(variable, config.theme[key]);
    });

    document.querySelectorAll('[data-bind]').forEach((element) => {
      const value = get(element.dataset.bind);
      if (value !== undefined && value !== null) element.textContent = value;
    });
    document.querySelectorAll('[data-bind-attr]').forEach((element) => {
      const [attribute, path] = element.dataset.bindAttr.split(':');
      const value = get(path);
      if (attribute && value) element.setAttribute(attribute, value);
    });

    const hrefs = {
      phone: config.contact?.phoneHref ? `tel:${config.contact.phoneHref}` : '',
      whatsapp: config.contact?.whatsappHref || '',
      mapsSearch: config.links?.mapsSearch || '',
      reviews: config.links?.reviews || '#velemenyek',
      booking: config.links?.booking || '#kapcsolat'
    };
    document.querySelectorAll('[data-link]').forEach((element) => {
      const href = hrefs[element.dataset.link];
      if (href) element.setAttribute('href', href);
      if (element.dataset.link === 'mapsSearch' && !href) {
        element.setAttribute('href', '#terkep');
        element.removeAttribute('target');
      }
    });
    document.querySelectorAll('[data-image]').forEach((image) => {
      const source = get(`images.${image.dataset.image}`);
      if (source) image.src = source;
    });

    const map = document.querySelector('[data-map-embed]');
    const placeholder = document.querySelector('.map-placeholder');
    if (map && config.links?.mapsEmbed) {
      map.src = config.links.mapsEmbed;
      if (placeholder) placeholder.hidden = true;
    } else if (map) {
      map.hidden = true;
      if (placeholder) placeholder.hidden = false;
    }

    const form = document.querySelector('#bookingForm');
    if (form) {
      form.dataset.delivery = config.form?.delivery || 'email';
      form.dataset.email = config.contact?.email || '';
      form.dataset.whatsapp = config.contact?.whatsappHref || '';
    }
  };

  const setupMenu = () => {
    const button = document.querySelector('.menu-button');
    const menu = document.querySelector('#mobileMenu');
    if (!button || !menu) return;
    const close = () => { menu.hidden = true; button.setAttribute('aria-expanded','false'); };
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      menu.hidden = open;
      button.setAttribute('aria-expanded', String(!open));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
    window.addEventListener('resize', () => { if (window.innerWidth > 900) close(); });
  };

  const setupDialogs = () => {
    document.querySelectorAll('[data-dialog-open]').forEach((button) => {
      button.addEventListener('click', () => document.getElementById(button.dataset.dialogOpen)?.showModal());
    });
    document.querySelectorAll('[data-dialog-close]').forEach((button) => {
      button.addEventListener('click', () => button.closest('dialog')?.close());
    });
    document.querySelectorAll('dialog').forEach((dialog) => {
      dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    });
  };

  const setupForm = () => {
    const form = document.querySelector('#bookingForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const data = new FormData(form);
      const text = ['Új időpontkérés a weboldalról',`Név: ${data.get('name') || ''}`,`Telefon: ${data.get('phone') || ''}`,`Kutya: ${data.get('dog') || ''}`,`Üzenet: ${data.get('message') || ''}`].join('\n');
      if (form.dataset.delivery === 'whatsapp' && form.dataset.whatsapp) {
        const separator = form.dataset.whatsapp.includes('?') ? '&' : '?';
        window.open(`${form.dataset.whatsapp}${separator}text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      } else if (form.dataset.email) {
        window.location.href = `mailto:${encodeURIComponent(form.dataset.email)}?subject=${encodeURIComponent('Időpontkérés kutyakozmetikába')}&body=${encodeURIComponent(text)}`;
      }
    });
  };

  window.addEventListener('DOMContentLoaded', () => {
    applyConfig();
    setupMenu();
    setupDialogs();
    setupForm();
    const year = document.querySelector('#year');
    if (year) year.textContent = new Date().getFullYear();
    const header = document.querySelector('.site-header');
    const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, {passive:true});
  });
})();
