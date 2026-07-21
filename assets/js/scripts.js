const getConfigValue = (path) => {
  return path.split('.').reduce((value, key) => value?.[key], window.PET_GROOMER_CONFIG);
};

const applySiteConfig = () => {
  const config = window.PET_GROOMER_CONFIG;
  if (!config) return;

  document.title = config.copy?.pageTitle || config.business?.name || document.title;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && config.copy?.metaDescription) metaDescription.content = config.copy.metaDescription;

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = document.title;
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription && config.copy?.metaDescription) ogDescription.content = config.copy.metaDescription;

  const root = document.documentElement;
  const themeMap = {
    primary: '--brand-primary',
    primaryDark: '--brand-primary-dark',
    accent: '--brand-accent',
    cream: '--brand-cream',
    ink: '--brand-ink'
  };
  Object.entries(themeMap).forEach(([key, cssVariable]) => {
    if (config.theme?.[key]) root.style.setProperty(cssVariable, config.theme[key]);
  });

  document.querySelectorAll('[data-bind]').forEach((element) => {
    const value = getConfigValue(element.dataset.bind);
    if (value !== undefined && value !== null) element.textContent = value;
  });

  document.querySelectorAll('[data-bind-attr]').forEach((element) => {
    const [attribute, path] = element.dataset.bindAttr.split(':');
    const value = getConfigValue(path);
    if (attribute && value) element.setAttribute(attribute, value);
  });

  const linkValues = {
    phone: config.contact?.phoneHref ? `tel:${config.contact.phoneHref}` : '',
    whatsapp: config.contact?.whatsappHref || '',
    mapsSearch: config.links?.mapsSearch || '',
    reviews: config.links?.reviews || config.links?.mapsSearch || '',
    booking: config.links?.booking || '#kapcsolat'
  };
  document.querySelectorAll('[data-link]').forEach((element) => {
    const href = linkValues[element.dataset.link];
    if (href) element.setAttribute('href', href);
  });

  document.querySelectorAll('[data-image]').forEach((image) => {
    const path = image.dataset.image;
    const source = getConfigValue(`images.${path}`);
    if (source) image.setAttribute('src', source);
  });

  const map = document.querySelector('[data-map-embed]');
  if (map && config.links?.mapsEmbed) map.setAttribute('src', config.links.mapsEmbed);

  const bookingForm = document.querySelector('#bookingForm');
  if (bookingForm) {
    bookingForm.dataset.delivery = config.form?.delivery || 'email';
    bookingForm.dataset.email = config.contact?.email || '';
    bookingForm.dataset.whatsapp = config.contact?.whatsappHref || '';
  }
};

window.addEventListener('DOMContentLoaded', () => {
  applySiteConfig();

  const nav = document.querySelector('#mainNav');
  const shrink = () => nav?.classList.toggle('navbar-shrink', window.scrollY > 15);
  shrink();
  document.addEventListener('scroll', shrink, { passive: true });

  const toggler = document.querySelector('.navbar-toggler');
  document.querySelectorAll('#navbarResponsive .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (toggler && getComputedStyle(toggler).display !== 'none') toggler.click();
    });
  });

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  const bookingForm = document.querySelector('#bookingForm');
  if (!bookingForm) return;

  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      return;
    }

    const data = new FormData(bookingForm);
    const text = [
      'Új időpontkérés a weboldalról',
      `Név: ${data.get('name') || ''}`,
      `Telefon: ${data.get('phone') || ''}`,
      `Kutya: ${data.get('dog') || ''}`,
      `Üzenet: ${data.get('message') || ''}`
    ].join('\n');

    const delivery = bookingForm.dataset.delivery;
    const whatsapp = bookingForm.dataset.whatsapp;
    const email = bookingForm.dataset.email;

    if (delivery === 'whatsapp' && whatsapp) {
      const separator = whatsapp.includes('?') ? '&' : '?';
      window.open(`${whatsapp}${separator}text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      return;
    }

    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Időpontkérés kutyakozmetikába')}&body=${encodeURIComponent(text)}`;
  });
});
