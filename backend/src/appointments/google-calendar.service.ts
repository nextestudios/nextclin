import { Injectable, Logger } from '@nestjs/common';

/**
 * Google Calendar Sync Service
 * Syncs appointments with Google Calendar via OAuth2.
 * Configure: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
 */
@Injectable()
export class GoogleCalendarService {
    private readonly logger = new Logger(GoogleCalendarService.name);
    private readonly clientId = process.env.GOOGLE_CLIENT_ID;
    private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    private readonly redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/appointments/calendar/callback';

    /** Check if Google Calendar is configured */
    isConfigured(): boolean {
        return !!(this.clientId && this.clientSecret);
    }

    /** Generate OAuth2 authorization URL */
    getAuthUrl(tenantId: string): string {
        if (!this.isConfigured()) return '';
        const scopes = 'https://www.googleapis.com/auth/calendar.events';
        return `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${this.clientId}` +
            `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(scopes)}` +
            `&access_type=offline` +
            `&state=${tenantId}`;
    }

    /** Exchange authorization code for tokens */
    async exchangeCode(code: string): Promise<any> {
        if (!this.isConfigured()) return { error: 'Google Calendar não configurado' };
        try {
            const res = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: this.clientId!,
                    client_secret: this.clientSecret!,
                    redirect_uri: this.redirectUri,
                    grant_type: 'authorization_code',
                }),
            });
            return await res.json();
        } catch (err: any) {
            this.logger.error(`OAuth error: ${err.message}`);
            return { error: err.message };
        }
    }

    /** Create event in Google Calendar */
    async createEvent(accessToken: string, event: {
        summary: string; description: string; start: string; end: string; location?: string;
    }): Promise<any> {
        try {
            const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    summary: event.summary,
                    description: event.description,
                    start: { dateTime: event.start, timeZone: 'America/Sao_Paulo' },
                    end: { dateTime: event.end, timeZone: 'America/Sao_Paulo' },
                    location: event.location,
                    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 }] },
                }),
            });
            const data = await res.json();
            this.logger.log(`[GCAL ✅] Event created: ${(data as any).id}`);
            return data;
        } catch (err: any) {
            this.logger.error(`[GCAL ❌] ${err.message}`);
            return { error: err.message };
        }
    }

    /** Delete event from Google Calendar */
    async deleteEvent(accessToken: string, eventId: string): Promise<boolean> {
        try {
            await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            return true;
        } catch { return false; }
    }

    /** Update event in Google Calendar */
    async updateEvent(accessToken: string, eventId: string, updates: any): Promise<any> {
        try {
            const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });
            return await res.json();
        } catch (err: any) {
            return { error: err.message };
        }
    }
}
