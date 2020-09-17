import { Injectable } from '@angular/core';

@Injectable()
export class JiraCredentialsService {
   private credentials: {
      username: string;
      password: string;
   } = null;

   getJiraCredentials(): { username: string; password: string } {
      return this.credentials;
   }

   saveJiraCredentials(username, password) {
      this.credentials = { username, password };
   }

   clearJiraCredentials() {
      this.credentials = null;
   }
}
