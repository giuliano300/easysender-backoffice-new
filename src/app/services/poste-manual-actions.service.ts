import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../main';
import { PosteManualAction, PosteManualActionDefinition } from '../interfaces/PosteManualAction';

@Injectable({ providedIn: 'root' })
export class PosteManualActionsService {
  private readonly baseUrl = API_URL + 'PosteManualActions';

  constructor(private http: HttpClient) {}

  definitions(): Observable<PosteManualActionDefinition[]> {
    return this.http.get<PosteManualActionDefinition[]>(`${this.baseUrl}/definitions`);
  }

  definitionsForRecipient(recipientId: number): Observable<{ recipient: { id: number; product: string; currentState: number; requestId?: string | null; code?: string | null; message?: string | null }; definitions: PosteManualActionDefinition[] }> {
    return this.http.get<{ recipient: { id: number; product: string; currentState: number; requestId?: string | null; code?: string | null; message?: string | null }; definitions: PosteManualActionDefinition[] }>(`${this.baseUrl}/recipient/${recipientId}/definitions`);
  }

  history(recipientId?: number): Observable<PosteManualAction[]> {
    const query = recipientId ? `?recipientId=${recipientId}` : '';
    return this.http.get<PosteManualAction[]>(this.baseUrl + query);
  }

  execute(recipientId: number, action: string): Observable<PosteManualAction> {
    return this.http.post<PosteManualAction>(this.baseUrl, { recipientId, action });
  }
}
