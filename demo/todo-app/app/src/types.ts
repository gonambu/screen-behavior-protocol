// Type definitions based on UIDP spec

export interface Todo {
  id: string;
  text: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoForm {
  text: string;
  description: string;
}
