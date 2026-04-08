// ===== NAVBAR SCROLL =====
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ===== DROPDOWN CLICK =====
let activeDropdown = null;

document.querySelectorAll('.navbar__item').forEach((item) => {
  const link = item.querySelector('.navbar__link');
  const dropdown = item.querySelector('.navbar__dropdown');
  if (!dropdown || !link) return;

  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeDropdown === dropdown) {
      closeDropdown();
      return;
    }

    closeDropdown();
    dropdown.classList.add('active');
    activeDropdown = dropdown;
    document.body.style.overflow = 'hidden';
  });
});

// Close buttons inside dropdowns
document.querySelectorAll('.navbar__dropdown-close').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDropdown();
  });
});

// Close on clicking a dropdown link
document.querySelectorAll('.navbar__dropdown a').forEach((link) => {
  link.addEventListener('click', () => {
    closeDropdown();
  });
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDropdown();
});

// Click outside to close
document.addEventListener('click', (e) => {
  if (activeDropdown && !e.target.closest('.navbar__item')) {
    closeDropdown();
  }
});

function closeDropdown() {
  if (activeDropdown) {
    activeDropdown.classList.remove('active');
    activeDropdown = null;
    document.body.style.overflow = '';
  }
}

// ===== MOBILE MENU =====
const burger = document.querySelector('.navbar__burger');
const mobileMenu = document.querySelector('.mobile-menu');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Sub-menu toggles
  document.querySelectorAll('.mobile-menu__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const sub = btn.closest('.mobile-menu__item').querySelector('.mobile-menu__sub');
      if (sub) sub.classList.toggle('active');
    });
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ===== REVEAL ON SCROLL =====
const revealElements = document.querySelectorAll('.reveal');
if (revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15 }
  );
  revealElements.forEach((el) => revealObserver.observe(el));
}

// ===== STATS COUNTER =====
document.querySelectorAll('.stats__number[data-target]').forEach((el) => {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  let counted = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target + suffix;
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current) + suffix;
          }
        }, duration / steps);
      }
    },
    { threshold: 0.5 }
  );
  observer.observe(el);
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    contactForm.innerHTML = `
      <div style="text-align:center;padding:40px 0;">
        <p style="font-size:18px;font-weight:500;">Message envoyé !</p>
        <p style="margin-top:8px;font-size:14px;color:rgba(0,0,0,0.4);">
          Nous vous répondrons dans les plus brefs délais.
        </p>
      </div>
    `;
  });
}
