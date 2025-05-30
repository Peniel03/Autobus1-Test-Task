import IMask from 'imask';
import { StorageManager } from './classes/StorageManager';
import { CustomDropdown } from './classes/CustomDropdown';
import { ToastManager } from './utils/toast';
import { ValidationUtils } from './utils/validation';
import type { Contact, Group } from './types';
import './styles/main.scss';

class ContactsApp {
  private storageManager: StorageManager;
  private toastManager: ToastManager;
  private contacts: Contact[] = [];
  private groups: Group[] = [];
  private currentEditingContact: Contact | null = null;
  private contactGroupDropdown!: CustomDropdown;
  private phoneMask: any;

  // DOM elements
  private contactsList!: HTMLElement;
  private groupsList!: HTMLElement;
  private groupFilter!: HTMLSelectElement;
  private contactModal!: HTMLElement;
  private groupModal!: HTMLElement;
  private confirmModal!: HTMLElement;
  private contactForm!: HTMLFormElement;
  private groupForm!: HTMLFormElement;

  constructor() {
    this.storageManager = new StorageManager();
    this.toastManager = new ToastManager();
    this.init();
  }

  private init(): void {
    this.loadData();
    this.initDOM();
    this.initPhoneMask();
    this.initDropdown();
    this.bindEvents();
    this.render();
  }

  private loadData(): void {
    this.groups = this.storageManager.loadGroups();
    this.contacts = this.storageManager.loadContacts();
  }

  private initDOM(): void {
    this.contactsList = document.getElementById('contactsList')!;
    this.groupsList = document.getElementById('groupsList')!;
    this.groupFilter = document.getElementById('groupFilter') as HTMLSelectElement;
    this.contactModal = document.getElementById('contactModal')!;
    this.groupModal = document.getElementById('groupModal')!;
    this.confirmModal = document.getElementById('confirmModal')!;
    this.contactForm = document.getElementById('contactForm') as HTMLFormElement;
    this.groupForm = document.getElementById('groupForm') as HTMLFormElement;
  }

  private initPhoneMask(): void {
    const phoneInput = document.getElementById('contactPhone') as HTMLInputElement;
    this.phoneMask = IMask(phoneInput, {
      mask: '+{7} (000) 000-00-00',
      lazy: false,
      placeholderChar: '_'
    });
  }

  private initDropdown(): void {
    const dropdownContainer = document.getElementById('contactGroupDropdown')!;
    this.contactGroupDropdown = new CustomDropdown(dropdownContainer);
    this.updateDropdownItems();
  }

  private updateDropdownItems(): void {
    const items = this.groups.map(group => ({
      value: group.id,
      label: group.name
    }));
    this.contactGroupDropdown.dataItems = items;
  }

  private bindEvents(): void {
    // Add contact button
    document.getElementById('addContactBtn')!.addEventListener('click', () => {
      this.openContactModal();
    });

    // Add group button
    document.getElementById('addGroupBtn')!.addEventListener('click', () => {
      this.openGroupModal();
    });

    // Modal close buttons
    document.getElementById('closeContactModal')!.addEventListener('click', () => {
      this.closeContactModal();
    });

    document.getElementById('closeGroupModal')!.addEventListener('click', () => {
      this.closeGroupModal();
    });

    // Cancel buttons
    document.getElementById('cancelContactBtn')!.addEventListener('click', () => {
      this.closeContactModal();
    });

    document.getElementById('cancelGroupBtn')!.addEventListener('click', () => {
      this.closeGroupModal();
    });

    document.getElementById('cancelConfirmBtn')!.addEventListener('click', () => {
      this.closeConfirmModal();
    });

    // Form submissions
    this.contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleContactSubmit();
    });

    this.groupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleGroupSubmit();
    });

    // Group filter
    this.groupFilter.addEventListener('change', () => {
      this.renderContacts();
    });

    // Modal overlay clicks
    this.contactModal.querySelector('.modal__overlay')!.addEventListener('click', () => {
      this.closeContactModal();
    });

    this.groupModal.querySelector('.modal__overlay')!.addEventListener('click', () => {
      this.closeGroupModal();
    });

    this.confirmModal.querySelector('.modal__overlay')!.addEventListener('click', () => {
      this.closeConfirmModal();
    });

    // Escape key handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeContactModal();
        this.closeGroupModal();
        this.closeConfirmModal();
      }
    });
  }

  private render(): void {
    this.renderGroups();
    this.renderContacts();
    this.renderGroupFilter();
  }

  private renderGroups(): void {
    this.groupsList.innerHTML = this.groups
      .map(group => {
        const contactCount = this.contacts.filter(c => c.groupId === group.id).length;
        return `
          <div class="group-item" data-group-id="${group.id}">
            <div class="group-item__content">
              <h3 class="group-item__name">${group.name}</h3>
              <span class="group-item__count">${contactCount} контакт${this.getContactsEnding(contactCount)}</span>
            </div>
            <div class="group-item__actions">
              <button class="btn btn--secondary btn--small btn--icon" onclick="app.editGroup('${group.id}')" aria-label="Редактировать группу">
                ✏️
              </button>
              <button class="btn btn--danger btn--small btn--icon" onclick="app.deleteGroup('${group.id}')" aria-label="Удалить группу">
                🗑️
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  private renderContacts(): void {
    const selectedGroupId = this.groupFilter.value;
    let filteredContacts = this.contacts;

    if (selectedGroupId) {
      filteredContacts = this.contacts.filter(c => c.groupId === selectedGroupId);
    }

    if (filteredContacts.length === 0) {
      this.contactsList.innerHTML = `
        <div class="empty-state">
          <p>Контакты не найдены</p>
          <button class="btn btn--primary" onclick="app.openContactModal()">
            Добавить первый контакт
          </button>
        </div>
      `;
      return;
    }

    this.contactsList.innerHTML = filteredContacts
      .map(contact => {
        const group = this.groups.find(g => g.id === contact.groupId);
        return `
          <div class="contact-item" data-contact-id="${contact.id}">
            <div class="contact-item__avatar">
              ${contact.name.charAt(0).toUpperCase()}
            </div>
            <div class="contact-item__content">
              <h3 class="contact-item__name">${contact.name}</h3>
              <p class="contact-item__phone">${ValidationUtils.formatPhone(contact.phone)}</p>
              <span class="contact-item__group">${group?.name || 'Без группы'}</span>
            </div>
            <div class="contact-item__actions">
              <button class="btn btn--secondary btn--small btn--icon" onclick="app.editContact('${contact.id}')" aria-label="Редактировать контакт">
                ✏️
              </button>
              <button class="btn btn--danger btn--small btn--icon" onclick="app.deleteContact('${contact.id}')" aria-label="Удалить контакт">
                🗑️
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  private renderGroupFilter(): void {
    this.groupFilter.innerHTML = `
      <option value="">Все группы</option>
      ${this.groups.map(group => `
        <option value="${group.id}">${group.name}</option>
      `).join('')}
    `;
  }

  private getContactsEnding(count: number): string {
    if (count % 10 === 1 && count % 100 !== 11) return '';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'а';
    return 'ов';
  }

  // Contact methods
  public openContactModal(contact?: Contact): void {
    this.currentEditingContact = contact || null;
    const title = contact ? 'Редактировать контакт' : 'Добавить контакт';
    
    document.getElementById('contactModalTitle')!.textContent = title;
    
    if (contact) {
      (document.getElementById('contactName') as HTMLInputElement).value = contact.name;
      this.phoneMask.value = ValidationUtils.formatPhone(contact.phone);
      this.contactGroupDropdown.value = contact.groupId;
    } else {
      this.contactForm.reset();
      this.phoneMask.value = '';
      this.contactGroupDropdown.reset();
    }
    
    this.contactModal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
      (document.getElementById('contactName') as HTMLInputElement).focus();
    }, 100);
  }

  private closeContactModal(): void {
    this.contactModal.classList.remove('modal--active');
    document.body.style.overflow = '';
    this.currentEditingContact = null;
  }

  private handleContactSubmit(): void {
    const nameInput = document.getElementById('contactName') as HTMLInputElement;
    const phoneValue = this.phoneMask.unmaskedValue;
    const groupId = this.contactGroupDropdown.value;

    // Validation
    const nameError = ValidationUtils.validateContactName(nameInput.value);
    if (nameError) {
      this.toastManager.error('Ошибка валидации', nameError);
      nameInput.focus();
      return;
    }

    const phoneError = ValidationUtils.validatePhone(phoneValue);
    if (phoneError) {
      this.toastManager.error('Ошибка валидации', phoneError);
      return;
    }

    if (!groupId) {
      this.toastManager.error('Ошибка валидации', 'Выберите группу');
      return;
    }

    const normalizedPhone = ValidationUtils.normalizePhone(phoneValue);

    // Check for duplicate phone
    const existingContact = this.contacts.find(c => 
      ValidationUtils.normalizePhone(c.phone) === normalizedPhone && 
      c.id !== this.currentEditingContact?.id
    );

    if (existingContact) {
      this.toastManager.error('Ошибка', 'Контакт с таким номером телефона уже существует');
      return;
    }

    if (this.currentEditingContact) {
      // Update existing contact
      this.currentEditingContact.name = nameInput.value.trim();
      this.currentEditingContact.phone = normalizedPhone;
      this.currentEditingContact.groupId = groupId;
      this.currentEditingContact.updatedAt = new Date();
      
      this.toastManager.success('Успешно', 'Контакт обновлен');
    } else {
      // Create new contact
      const newContact: Contact = {
        id: this.generateId(),
        name: nameInput.value.trim(),
        phone: normalizedPhone,
        groupId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.contacts.push(newContact);
      this.toastManager.success('Успешно', 'Контакт создан');
    }

    this.saveContacts();
    this.render();
    this.closeContactModal();
  }

  public editContact(id: string): void {
    const contact = this.contacts.find(c => c.id === id);
    if (contact) {
      this.openContactModal(contact);
    }
  }

  public deleteContact(id: string): void {
    const contact = this.contacts.find(c => c.id === id);
    if (!contact) return;

    this.showConfirmDialog(
      `Вы уверены, что хотите удалить контакт "${contact.name}"?`,
      () => {
        this.contacts = this.contacts.filter(c => c.id !== id);
        this.saveContacts();
        this.render();
        this.toastManager.success('Успешно', 'Контакт удален');
      }
    );
  }

  // Group methods
  public openGroupModal(group?: Group): void {
    const title = group ? 'Редактировать группу' : 'Добавить группу';
    document.querySelector('#groupModal .modal__title')!.textContent = title;
    
    if (group) {
      (document.getElementById('groupName') as HTMLInputElement).value = group.name;
    } else {
      this.groupForm.reset();
    }
    
    this.groupModal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      (document.getElementById('groupName') as HTMLInputElement).focus();
    }, 100);
  }

  private closeGroupModal(): void {
    this.groupModal.classList.remove('modal--active');
    document.body.style.overflow = '';
  }

  private handleGroupSubmit(): void {
    const nameInput = document.getElementById('groupName') as HTMLInputElement;
    
    const nameError = ValidationUtils.validateGroupName(nameInput.value);
    if (nameError) {
      this.toastManager.error('Ошибка валидации', nameError);
      nameInput.focus();
      return;
    }

    const trimmedName = nameInput.value.trim();
    
    // Check for duplicate group name
    const existingGroup = this.groups.find(g => 
      g.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingGroup) {
      this.toastManager.error('Ошибка', 'Группа с таким названием уже существует');
      nameInput.focus();
      return;
    }

    const newGroup: Group = {
      id: this.generateId(),
      name: trimmedName,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.groups.push(newGroup);
    this.saveGroups();
    this.updateDropdownItems();
    this.render();
    this.closeGroupModal();
    
    this.toastManager.success('Успешно', 'Группа создана');
  }

  public editGroup(id: string): void {
    const group = this.groups.find(g => g.id === id);
    if (group) {
      this.openGroupModal(group);
    }
  }

  public deleteGroup(id: string): void {
    const group = this.groups.find(g => g.id === id);
    if (!group) return;

    const contactsInGroup = this.contacts.filter(c => c.groupId === id);
    const message = contactsInGroup.length > 0 
      ? `Вы уверены, что хотите удалить эту группу? Это приведет к удалению всех контактов, находящихся в этой группе.`
      : `Вы уверены, что хотите удалить группу "${group.name}"?`;

    this.showConfirmDialog(message, () => {
      // Remove all contacts in this group
      this.contacts = this.contacts.filter(c => c.groupId !== id);
      
      // Remove the group
      this.groups = this.groups.filter(g => g.id !== id);
      
      this.saveContacts();
      this.saveGroups();
      this.updateDropdownItems();
      this.render();
      
      const successMessage = contactsInGroup.length > 0
        ? `Группа и все контакты (${contactsInGroup.length}) были успешно удалены`
        : 'Группа удалена';
      
      this.toastManager.success('Успешно', successMessage);
    });
  }

  // Confirmation dialog
  private showConfirmDialog(message: string, onConfirm: () => void): void {
    document.getElementById('confirmMessage')!.textContent = message;
    
    const confirmBtn = document.getElementById('confirmBtn')!;
    
    // Remove existing listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode!.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new listener
    newConfirmBtn.addEventListener('click', () => {
      onConfirm();
      this.closeConfirmModal();
    });
    
    this.confirmModal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';
  }

  private closeConfirmModal(): void {
    this.confirmModal.classList.remove('modal--active');
    document.body.style.overflow = '';
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveContacts(): void {
    try {
      this.storageManager.saveContacts(this.contacts);
    } catch (error) {
      this.toastManager.error('Ошибка', 'Не удалось сохранить контакты');
    }
  }

  private saveGroups(): void {
    try {
      this.storageManager.saveGroups(this.groups);
    } catch (error) {
      this.toastManager.error('Ошибка', 'Не удалось сохранить группы');
    }
  }
}

// Initialize the application
const app = new ContactsApp();

// Make app globally available for onclick handlers
(window as any).app = app;