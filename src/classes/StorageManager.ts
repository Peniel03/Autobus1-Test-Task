import type { Contact, Group } from '../types';

export class StorageManager {
  private readonly CONTACTS_KEY = 'contacts_app_contacts';
  private readonly GROUPS_KEY = 'contacts_app_groups';

  saveContacts(contacts: Contact[]): void {
    try {
      localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
    } catch (error) {
      console.error('Failed to save contacts:', error);
      throw new Error('Не удалось сохранить контакты');
    }
  }

  loadContacts(): Contact[] {
    try {
      const data = localStorage.getItem(this.CONTACTS_KEY);
      if (!data) return [];
      
      const contacts = JSON.parse(data);
      return contacts.map((contact: any) => ({
        ...contact,
        createdAt: new Date(contact.createdAt),
        updatedAt: new Date(contact.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load contacts:', error);
      return [];
    }
  }

  saveGroups(groups: Group[]): void {
    try {
      localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));
    } catch (error) {
      console.error('Failed to save groups:', error);
      throw new Error('Не удалось сохранить группы');
    }
  }

  loadGroups(): Group[] {
    try {
      const data = localStorage.getItem(this.GROUPS_KEY);
      if (!data) return this.getDefaultGroups();
      
      const groups = JSON.parse(data);
      return groups.map((group: any) => ({
        ...group,
        createdAt: new Date(group.createdAt),
        updatedAt: new Date(group.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load groups:', error);
      return this.getDefaultGroups();
    }
  }

  private getDefaultGroups(): Group[] {
    const defaultGroups: Group[] = [
      {
        id: 'default-family',
        name: 'Семья',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-work',
        name: 'Работа',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-friends',
        name: 'Друзья',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    this.saveGroups(defaultGroups);
    return defaultGroups;
  }

  clearAll(): void {
    localStorage.removeItem(this.CONTACTS_KEY);
    localStorage.removeItem(this.GROUPS_KEY);
  }
}