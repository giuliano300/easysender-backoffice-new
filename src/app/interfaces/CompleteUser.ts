import { Users } from './Users';
import { UserProducts } from './UserProducts';
import { UserOptions } from './UserOptions';

export interface CompleteUser {
  user: Users;
  products: UserProducts[];
  options: UserOptions[];
}
