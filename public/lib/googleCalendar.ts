'use client';

// Google Calendar integration utilities using new Google Identity Services
export class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  private isInitialized = false;
  private accessToken: string | null = null;

  static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  async initializeGoogleAPI(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Load Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        // Initialize Google API client
        const apiScript = document.createElement('script');
        apiScript.src = 'https://apis.google.com/js/api.js';
        apiScript.onload = () => {
          window.gapi.load('client', () => {
            window.gapi.client.init({
              apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            }).then(() => {
              this.isInitialized = true;
              resolve();
            }).catch(reject);
          });
        };
        apiScript.onerror = reject;
        document.head.appendChild(apiScript);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    try {
      await this.initializeGoogleAPI();
      
      return new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          scope: 'https://www.googleapis.com/auth/calendar',
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }
            
            this.accessToken = response.access_token;
            window.gapi.client.setToken({ access_token: response.access_token });
            resolve(true);
          },
        });
        
        client.requestAccessToken();
      });
    } catch (error) {
      console.error('Google sign-in failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (this.accessToken) {
      window.google.accounts.oauth2.revoke(this.accessToken);
      this.accessToken = null;
      window.gapi.client.setToken(null);
    }
  }

  isSignedIn(): boolean {
    return this.accessToken !== null;
  }

  async createEvent(event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: { email: string }[];
    reminders?: { useDefault: boolean; overrides?: { method: string; minutes: number }[] };
    location?: string;
  }): Promise<any> {
    if (!this.isSignedIn()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    await this.initializeGoogleAPI();
    
    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
      return response.result;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, event: any): Promise<any> {
    if (!this.isSignedIn()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    await this.initializeGoogleAPI();
    
    try {
      const response = await window.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });
      return response.result;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.isSignedIn()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    await this.initializeGoogleAPI();
    
    try {
      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<any[]> {
    if (!this.isSignedIn()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    await this.initializeGoogleAPI();
    
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  // Get user's calendar info
  async getUserCalendarInfo(): Promise<any> {
    if (!this.isSignedIn()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    await this.initializeGoogleAPI();
    
    try {
      const response = await window.gapi.client.calendar.calendars.get({
        calendarId: 'primary',
      });
      return response.result;
    } catch (error) {
      console.error('Error fetching calendar info:', error);
      throw error;
    }
  }

  // Check if user has granted calendar permissions
  async checkPermissions(): Promise<boolean> {
    try {
      if (!this.isSignedIn()) {
        return false;
      }
      
      await this.getUserCalendarInfo();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Extend window object for TypeScript
declare global {
  interface Window {
    gapi: any;
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
          revoke: (token: string) => void;
        };
      };
    };
  }
}
