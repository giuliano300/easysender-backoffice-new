import { Administrators } from "./administrators";

export interface AuthResponse {
  token: string;
  administator: Administrators;
}