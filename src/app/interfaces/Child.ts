export interface Child {
  id: number;
  userTypes: number;
  parentId: number;
  businessName: string;
  email: string;
  password: string; 
  address?: string;
}