export class ValidationUtils {
    static validateContactName(name: string): string | null {
      if (!name.trim()) {
        return 'Имя обязательно для заполнения';
      }
      
      if (name.trim().length < 2) {
        return 'Имя должно содержать минимум 2 символа';
      }
      
      if (name.trim().length > 50) {
        return 'Имя не должно превышать 50 символов';
      }
      
      return null;
    }
  
    static validatePhone(phone: string): string | null {
      if (!phone.trim()) {
        return 'Номер телефона обязателен для заполнения';
      }
      
      // Remove all non-digit characters for validation
      const cleanPhone = phone.replace(/\D/g, '');
      
      if (cleanPhone.length !== 11) {
        return 'Номер телефона должен содержать 11 цифр';
      }
      
      if (!cleanPhone.startsWith('7') && !cleanPhone.startsWith('8')) {
        return 'Номер телефона должен начинаться с 7 или 8';
      }
      
      return null;
    }
  
    static validateGroupName(name: string): string | null {
      if (!name.trim()) {
        return 'Название группы обязательно для заполнения';
      }
      
      if (name.trim().length < 2) {
        return 'Название группы должно содержать минимум 2 символа';
      }
      
      if (name.trim().length > 30) {
        return 'Название группы не должно превышать 30 символов';
      }
      
      return null;
    }
  
    static normalizePhone(phone: string): string {
      // Remove all non-digit characters
      const cleanPhone = phone.replace(/\D/g, '');
      
      // Convert 8 to 7 if it's the first digit
      if (cleanPhone.startsWith('8')) {
        return '7' + cleanPhone.slice(1);
      }
      
      return cleanPhone;
    }
  
    static formatPhone(phone: string): string {
      const cleanPhone = this.normalizePhone(phone);
      
      if (cleanPhone.length === 11) {
        return `+${cleanPhone[0]} (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7, 9)}-${cleanPhone.slice(9)}`;
      }
      
      return phone;
    }
  }