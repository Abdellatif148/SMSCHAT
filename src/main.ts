interface NotificationType {
  message: string;
  type: 'success' | 'error';
}

class SMSChatLandingPage {
  private modal: HTMLElement | null = null;
  private contactForm: HTMLFormElement | null = null;
  private carousel: HTMLElement | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    document.addEventListener('DOMContentLoaded', () => {
      this.initSmoothScrolling();
      this.initScrollAnimations();
      this.initCarousel();
      this.initContactForm();
      this.initParticles();
      this.initDownloadModal();
      this.initDownloadButtons();
    });
  }

  private initSmoothScrolling(): void {
    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (!href) return;

        const target = document.querySelector<HTMLElement>(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  private initScrollAnimations(): void {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });
  }

  private initCarousel(): void {
    this.carousel = document.querySelector('.screenshots-carousel');
    if (!this.carousel) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    this.carousel.addEventListener('mousedown', (e: MouseEvent) => {
      isDown = true;
      if (this.carousel) {
        this.carousel.style.cursor = 'grabbing';
        startX = e.pageX - this.carousel.offsetLeft;
        scrollLeft = this.carousel.scrollLeft;
      }
    });

    this.carousel.addEventListener('mouseleave', () => {
      isDown = false;
      if (this.carousel) {
        this.carousel.style.cursor = 'grab';
      }
    });

    this.carousel.addEventListener('mouseup', () => {
      isDown = false;
      if (this.carousel) {
        this.carousel.style.cursor = 'grab';
      }
    });

    this.carousel.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDown || !this.carousel) return;
      e.preventDefault();
      const x = e.pageX - this.carousel.offsetLeft;
      const walk = (x - startX) * 2;
      this.carousel.scrollLeft = scrollLeft - walk;
    });

    let touchStartX = 0;
    let touchScrollLeft = 0;

    this.carousel.addEventListener('touchstart', (e: TouchEvent) => {
      if (this.carousel) {
        touchStartX = e.touches[0].pageX - this.carousel.offsetLeft;
        touchScrollLeft = this.carousel.scrollLeft;
      }
    });

    this.carousel.addEventListener('touchmove', (e: TouchEvent) => {
      if (!this.carousel) return;
      const x = e.touches[0].pageX - this.carousel.offsetLeft;
      const walk = (x - touchStartX) * 2;
      this.carousel.scrollLeft = touchScrollLeft - walk;
    });
  }

  private initContactForm(): void {
    this.contactForm = document.getElementById('contact-form') as HTMLFormElement;
    if (!this.contactForm) return;

    this.contactForm.addEventListener('submit', (e: Event) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name') as HTMLInputElement;
      const emailInput = document.getElementById('contact-email') as HTMLInputElement;
      const messageInput = document.getElementById('contact-message') as HTMLTextAreaElement;

      const name = nameInput?.value || '';
      const email = emailInput?.value || '';
      const message = messageInput?.value || '';

      if (!name || !email || !message) {
        this.showNotification('Please fill in all fields', 'error');
        return;
      }

      if (!this.isValidEmail(email)) {
        this.showNotification('Please enter a valid email address', 'error');
        return;
      }

      console.log('Form submission:', { name, email, message });

      this.showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
      this.contactForm?.reset();
    });
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? 'linear-gradient(135deg, rgba(0, 175, 255, 0.9), rgba(0, 145, 255, 0.9))' : 'rgba(255, 60, 60, 0.9)'};
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: #fff;
      border-radius: 1rem;
      border: 1px solid ${type === 'success' ? 'rgba(0, 175, 255, 0.5)' : 'rgba(255, 60, 60, 0.5)'};
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 30px ${type === 'success' ? 'rgba(0, 175, 255, 0.5)' : 'rgba(255, 60, 60, 0.5)'};
      z-index: 9999;
      animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 600;
      max-width: 400px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      setTimeout(() => notification.remove(), 400);
    }, 5000);
  }

  private initParticles(): void {
    const hero = document.querySelector<HTMLElement>('.hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      opacity: 0.4;
    `;
    hero.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];

    const resizeCanvas = (): void => {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update(canvasWidth: number, canvasHeight: number): void {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvasWidth) this.x = 0;
        if (this.x < 0) this.x = canvasWidth;
        if (this.y > canvasHeight) this.y = 0;
        if (this.y < 0) this.y = canvasHeight;
      }

      draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = `rgba(0, 175, 255, ${this.opacity})`;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
      }
    }

    const createParticles = (): void => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 20000);
      particles = [];
      for (let i = 0; i < Math.min(particleCount, 50); i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };
    createParticles();
    window.addEventListener('resize', createParticles);

    const animate = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx);
      });

      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = `rgba(0, 175, 255, ${0.15 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('beforeunload', () => {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }
    });
  }

  private initDownloadModal(): void {
    this.modal = document.getElementById('download-modal');
    const openBtn = document.getElementById('open-download-modal');
    const closeBtn = this.modal?.querySelector('.modal-close');
    const downloadBtn = document.getElementById('modal-download-btn');

    if (!this.modal || !openBtn) return;

    openBtn.addEventListener('click', (e: Event) => {
      e.preventDefault();
      this.modal?.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    const closeModal = (): void => {
      this.modal?.classList.remove('active');
      document.body.style.overflow = '';
    };

    closeBtn?.addEventListener('click', closeModal);

    this.modal.addEventListener('click', (e: Event) => {
      if (e.target === this.modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
        closeModal();
      }
    });

    downloadBtn?.addEventListener('click', (e: Event) => {
      const btn = downloadBtn as HTMLAnchorElement;
      if (!btn.href || btn.href === window.location.href + '#' || btn.getAttribute('href') === '#') {
        e.preventDefault();
        this.showNotification('APK download will be available soon! Check back later.', 'success');
      }
    });
  }

  private initDownloadButtons(): void {
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e: Event) => {
        const btn = downloadBtn as HTMLAnchorElement;
        if (!btn.href || btn.href === window.location.href + '#' || btn.getAttribute('href') === '#') {
          e.preventDefault();
          this.showNotification('APK download will be available soon! Check back later.', 'success');
        }
      });
    }
  }
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

new SMSChatLandingPage();
