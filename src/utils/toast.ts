import type { ToastOptions } from '../types';

export class ToastManager {
  private container: HTMLElement;
  private toasts: Map<string, HTMLElement> = new Map();

  constructor() {
    this.container = document.getElementById('toastContainer')!;
  }

  show(options: ToastOptions): string {
    const id = this.generateId();
    const toast = this.createToast(id, options);
    
    this.container.appendChild(toast);
    this.toasts.set(id, toast);
    
    // Auto remove after duration
    const duration = options.duration || 5000;
    setTimeout(() => {
      this.remove(id);
    }, duration);
    
    return id;
  }

  remove(id: string): void {
    const toast = this.toasts.get(id);
    if (!toast) return;
    
    toast.classList.add('toast--removing');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(id);
    }, 250);
  }

  private createToast(id: string, options: ToastOptions): HTMLElement {
    const toast = document.createElement('div');
    toast.className = `toast toast--${options.type}`;
    toast.setAttribute('data-toast-id', id);
    
    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    toast.innerHTML = `
      <div class="toast__icon">${iconMap[options.type]}</div>
      <div class="toast__content">
        <div class="toast__title">${options.title}</div>
        <div class="toast__message">${options.message}</div>
      </div>
      <button class="toast__close" aria-label="Закрыть уведомление">×</button>
    `;
    
    const closeBtn = toast.querySelector('.toast__close') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => {
      this.remove(id);
    });
    
    return toast;
  }

  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  success(title: string, message: string, duration?: number): string {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number): string {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number): string {
    return this.show({ type: 'info', title, message, duration });
  }
}