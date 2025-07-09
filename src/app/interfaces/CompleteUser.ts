import { Users } from './Users';
import { UserProducts } from './UserProducts';

export interface CompleteUser {
  user: Users;
  products: UserProducts[];
}
