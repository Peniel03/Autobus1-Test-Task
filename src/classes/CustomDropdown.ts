import type { DropdownItem, DropdownEvents } from '../types';

export class CustomDropdown {
  private container: HTMLElement;
  private trigger!: HTMLButtonElement; /*'!' indicate definite assignment*/
  private menu!: HTMLElement; /*'!' indicate definite assignment*/ 
  /*the presence of '!' mean: these properties will be initialized before use, even though not in the constructor.*/
  private items: DropdownItem[] = [];
  private selectedValue: string = '';
  private isOpen: boolean = false;
  private listeners: Partial<DropdownEvents> = {};

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.container.innerHTML = `
      <button type="button" class="custom-dropdown__trigger" aria-haspopup="listbox" aria-expanded="false">
        Выберите группу
      </button>
      <div class="custom-dropdown__menu" role="listbox"></div>
    `;

    this.trigger = this.container.querySelector('.custom-dropdown__trigger') as HTMLButtonElement;
    this.menu = this.container.querySelector('.custom-dropdown__menu') as HTMLElement;
  }

  private bindEvents(): void {
    this.trigger.addEventListener('click', this.toggle.bind(this));
    this.trigger.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    document.addEventListener('click', (event) => {
      if (!this.container.contains(event.target as Node)) {
        this.close();
      }
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle();
        break;
      case 'Escape':
        this.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          this.focusNextItem();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen) {
          this.focusPreviousItem();
        }
        break;
    }
  }

  private focusNextItem(): void {
    const items = this.menu.querySelectorAll('.custom-dropdown__item');
    const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    (items[nextIndex] as HTMLElement).focus();
  }

  private focusPreviousItem(): void {
    const items = this.menu.querySelectorAll('.custom-dropdown__item');
    const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    (items[previousIndex] as HTMLElement).focus();
  }

  private renderItems(): void {
    this.menu.innerHTML = this.items
      .map(item => `
        <div 
          class="custom-dropdown__item ${item.value === this.selectedValue ? 'custom-dropdown__item--selected' : ''}"
          role="option"
          aria-selected="${item.value === this.selectedValue}"
          data-value="${item.value}"
          tabindex="-1"
        >
          ${item.label}
        </div>
      `)
      .join('');

    this.menu.querySelectorAll('.custom-dropdown__item').forEach(item => {
      item.addEventListener('click', () => {
        const value = (item as HTMLElement).dataset.value!;
        this.selectItem(value);
      });
    });
  }

  private selectItem(value: string): void {
    const item = this.items.find(item => item.value === value);
    if (!item) return;

    this.selectedValue = value;
    this.trigger.textContent = item.label;
    this.trigger.setAttribute('aria-expanded', 'false');
    
    this.renderItems();
    this.close();
    
    if (this.listeners.change) {
      this.listeners.change(value);
    }
  }

  private toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.trigger.classList.add('custom-dropdown__trigger--open');
    this.trigger.setAttribute('aria-expanded', 'true');
    this.menu.classList.add('custom-dropdown__menu--open');
    
    if (this.listeners.open) {
      this.listeners.open();
    }
  }

  private close(): void {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.trigger.classList.remove('custom-dropdown__trigger--open');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.menu.classList.remove('custom-dropdown__menu--open');
    
    if (this.listeners.close) {
      this.listeners.close();
    }
  }

  // Public API
  bind(event: keyof DropdownEvents, callback: DropdownEvents[keyof DropdownEvents]): void {
    this.listeners[event] = callback as any;
  }

  set dataItems(items: DropdownItem[]) {
    this.items = items;
    this.renderItems();
  }

  get dataItems(): DropdownItem[] {
    return [...this.items];
  }

  get value(): string {
    return this.selectedValue;
  }

  set value(value: string) {
    this.selectItem(value);
  }

  reset(): void {
    this.selectedValue = '';
    this.trigger.textContent = 'Выберите группу';
    this.renderItems();
    this.close();
  }

  destroy(): void {
    this.container.innerHTML = '';
  }
}