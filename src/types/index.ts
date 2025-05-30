export interface Contact {
    id: string;
    name: string;
    phone: string;
    groupId: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Group {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ToastOptions {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }
  
  export interface DropdownItem {
    value: string;
    label: string;
  }
  
  export interface DropdownEvents {
    change: (value: string) => void;
    open: () => void;
    close: () => void;
  }