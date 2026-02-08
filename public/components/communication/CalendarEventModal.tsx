'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarEvent } from '@/types/communication';
import { Lead } from '@/types/lead';
import { GoogleCalendarService } from '@/lib/googleCalendar';
import { Calendar, Clock, Users, Bell, MapPin, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

interface CalendarEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  event?: CalendarEvent;
  onEventCreated?: (event: CalendarEvent) => void;
  onEventUpdated?: (event: CalendarEvent) => void;
}

export function CalendarEventModal({
  open,
  onOpenChange,
  lead,
  event,
  onEventCreated,
  onEventUpdated,
}: CalendarEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    // location: '', // Removed location from formData as per request
    attendees: [] as string[],
    reminders: [10] as number[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');

  const calendarService = GoogleCalendarService.getInstance();
  const { createNotification } = useNotifications();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const currentUserId = user?.id; 

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      // location: '', // Removed location from formData as per request
      attendees: [],
      reminders: [10],
    });
    setErrorMessage('');
    setConnectionStatus('checking'); 
    setIsGoogleConnected(false);
  }, []);

  useEffect(() => {
    if (event) {
      const startDate = new Date(event.startDateTime);
      const endDate = new Date(event.endDateTime);

      setFormData({
        title: event.title,
        description: event.description || '',
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        // location: '', // Removed initialization from event.location
        attendees: event.attendees || [],
        reminders: event.reminders && event.reminders.length > 0 ? event.reminders : [10],
      });
    } else if (lead) {
      setFormData(prev => ({
        ...prev,
        title: `Follow-up with ${lead.name}`,
        attendees: [lead.primaryEmail].filter(Boolean) as string[],
      }));
    } else {
      resetForm();
    }
  }, [event, lead, resetForm]);

  const checkGoogleConnection = useCallback(async () => {
    if (!currentUserId && !authLoading) {
      setConnectionStatus('error');
      setErrorMessage('User not authenticated. Cannot check Google Calendar connection.');
      return;
    }

    try {
      setConnectionStatus('checking');
      setErrorMessage('');

      await calendarService.initializeGoogleAPI();
      const hasPermissions = await calendarService.checkPermissions();

      if (hasPermissions) {
        setIsGoogleConnected(true);
        setConnectionStatus('connected');
      } else {
        setIsGoogleConnected(false);
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Failed to check Google connection:', error);
      setIsGoogleConnected(false);
      setConnectionStatus('error');
      const msg = 'Failed to initialize Google Calendar connection. Please check your internet connection.';
      setErrorMessage(msg);
      if (currentUserId) {
        createNotification({
          userId: currentUserId,
          title: 'Google Calendar Connection Error',
          message: msg,
          type: 'system_alert',
          priority: 'high',
        });
      }
    }
  }, [createNotification, calendarService, currentUserId, authLoading]);

  useEffect(() => {
    if (open) {
      checkGoogleConnection();
    } else {
      resetForm();
    }
  }, [open, checkGoogleConnection, resetForm]);

  const handleGoogleConnect = useCallback(async () => {
    if (!currentUserId) {
      setErrorMessage('User not authenticated. Please log in to connect Google Calendar.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const success = await calendarService.signIn();

      if (success) {
        setIsGoogleConnected(true);
        setConnectionStatus('connected');
        createNotification({
          userId: currentUserId,
          title: 'Google Calendar Connected',
          message: 'You are now connected to Google Calendar. You can create and sync events.',
          type: 'system_alert', 
          priority: 'low',
        });
      } else {
        const msg = 'Failed to connect to Google Calendar. Please try again.';
        setErrorMessage(msg);
        createNotification({
          userId: currentUserId,
          title: 'Google Calendar Connection Failed',
          message: msg,
          type: 'system_alert',
          priority: 'high',
        });
      }
    } catch (error) {
      console.error('Failed to connect to Google Calendar:', error);
      const msg = 'Failed to connect to Google Calendar. Please ensure you grant the necessary permissions.';
      setErrorMessage(msg);
      if (currentUserId) {
        createNotification({
          userId: currentUserId,
          title: 'Google Calendar Connection Error',
          message: msg,
          type: 'system_alert',
          priority: 'high',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [createNotification, calendarService, currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      setErrorMessage('User not authenticated. Please log in to save events.');
      return;
    }

    if (!isGoogleConnected) {
      await handleGoogleConnect();
      if (!calendarService.isSignedIn()) {
          setErrorMessage('You must connect to Google Calendar to save events. Please click "Connect Google Calendar".');
          return;
      }
    }

    if (!formData.title.trim() || !formData.date || !formData.startTime || !formData.endTime) {
      const msg = 'Please fill in all required fields (Title, Date, Start Time, End Time).';
      setErrorMessage(msg);
      createNotification({
        userId: currentUserId,
        title: 'Missing Event Details',
        message: msg,
        type: 'system_alert',
        priority: 'medium',
      });
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        const msg = 'End time must be after start time.';
        setErrorMessage(msg);
        setIsLoading(false);
        createNotification({
          userId: currentUserId,
          title: 'Invalid Event Time',
          message: msg,
          type: 'system_alert',
          priority: 'medium',
        });
        return;
      }

      const eventData = {
        summary: formData.title,
        description: formData.description,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: formData.attendees.length > 0 ? formData.attendees.map(email => ({ email })) : undefined,
        reminders: {
          useDefault: formData.reminders.length === 0, 
          overrides: formData.reminders.map(minutes => ({
            method: 'popup',
            minutes,
          })),
        },
        // location: formData.location || undefined, // Removed location from eventData
      };

      let result;
      const isUpdating = !!event?.googleEventId;

      if (isUpdating) {
        result = await calendarService.updateEvent(event.googleEventId!, eventData);
        createNotification({
          userId: currentUserId,
          title: 'Calendar Event Updated',
          message: `"${formData.title}" event has been updated in your Google Calendar.`,
          type: 'calendar_event',
          priority: 'medium',
          actionUrl: result.htmlLink, 
          actionLabel: 'View in Google Calendar',
        });
      } else {
        result = await calendarService.createEvent(eventData);
        createNotification({
          userId: currentUserId,
          title: 'New Calendar Event Added',
          message: `"${formData.title}" has been added to your Google Calendar.`,
          type: 'calendar_event',
          priority: 'medium',
          actionUrl: result.htmlLink, 
          actionLabel: 'View in Google Calendar',
        });
      }

      const newEvent: CalendarEvent = {
        id: event?.id || `event-${Date.now()}`, 
        title: formData.title,
        description: formData.description,
        startDateTime,
        endDateTime,
        attendees: formData.attendees,
        reminders: formData.reminders,
        // location: formData.location || undefined, // Removed location from newEvent
        leadId: lead?.id, 
        googleEventId: result.id, 
        createdBy: currentUserId, 
        createdAt: event?.createdAt || new Date(), 
        updatedAt: new Date(),
      };

      if (isUpdating) {
        onEventUpdated?.(newEvent);
      } else {
        onEventCreated?.(newEvent);
      }

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to create/update event:', error);
      const apiErrorMessage = error.result?.error?.message || error.message;
      const userErrorMessage = `Failed to save event to Google Calendar. ${apiErrorMessage ? `Details: ${apiErrorMessage}` : 'Please try again.'}`;
      setErrorMessage(userErrorMessage);
      if (currentUserId) { 
        createNotification({
          userId: currentUserId,
          title: 'Calendar Event Save Failed',
          message: `Failed to save "${formData.title}". ${userErrorMessage}`,
          type: 'system_alert',
          priority: 'high',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addAttendee = () => {
    const email = prompt('Enter attendee email:');
    if (email && email.includes('@') && email.includes('.') && !formData.attendees.includes(email)) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, email],
      }));
    } else if (email) {
      setErrorMessage('Please enter a valid email address.');
    }
  };

  const removeAttendee = (email: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== email),
    }));
  };

  const toggleReminder = (minutes: number) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.includes(minutes)
        ? prev.reminders.filter(r => r !== minutes)
        : [...prev.reminders, minutes].sort((a,b) => a - b), 
    }));
  };

  const getConnectionStatusAlert = () => {
    switch (connectionStatus) {
      case 'checking':
        return (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertTitle>Checking Connection</AlertTitle>
            <AlertDescription>
              Checking Google Calendar connection...
            </AlertDescription>
          </Alert>
        );
      case 'connected':
        return (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Connected</AlertTitle>
            <AlertDescription>
              Connected to Google Calendar. You can create and sync events.
            </AlertDescription>
          </Alert>
        );
      case 'disconnected':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              Not connected to Google Calendar. Click (Connect Google Calendar) to enable event creation.
            </AlertDescription>
          </Alert>
        );
      case 'error':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Error connecting to Google Calendar. Please try again.'}
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>{event ? 'Edit Event' : 'Schedule New Event'}</span>
          </DialogTitle>
          <DialogDescription>
            {lead ? `Create a calendar event for ${lead.name}` : 'Create a new calendar event'}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          {getConnectionStatusAlert()}
        </div>

        {errorMessage && connectionStatus !== 'error' && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                placeholder="e.g., Property viewing with John"
              />
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                min={new Date().toISOString().split('T')[0]} 
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* <div className="md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., 123 Main St, Property Office"
              />
            </div> */} {/* Removed location input field */}

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add event details, agenda, or notes..."
                rows={3}
              />
            </div>
          </div>

          <div>
            <Label className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4" />
              <span>Attendees</span>
            </Label>
            <div className="space-y-2">
              {formData.attendees.map((email, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{email}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttendee(email)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttendee}
                className="w-full"
              >
                Add Attendee
              </Button>
            </div>
          </div>

          <div>
            <Label className="flex items-center space-x-2 mb-2">
              <Bell className="h-4 w-4" />
              <span>Reminders</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[5, 10, 15, 30, 60, 120, 24 * 60].map(minutes => ( 
                <div key={minutes} className="flex items-center space-x-2">
                  <Checkbox
                    id={`reminder-${minutes}`}
                    checked={formData.reminders.includes(minutes)}
                    onCheckedChange={() => toggleReminder(minutes)}
                  />
                  <Label htmlFor={`reminder-${minutes}`} className="text-sm">
                    {minutes < 60 ? `${minutes}m` : (minutes % 60 === 0 ? `${minutes / 60}h` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`)} before
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            {!isGoogleConnected ? (
              <Button
                type="button"
                onClick={handleGoogleConnect}
                disabled={isLoading || connectionStatus === 'checking' || !currentUserId} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
                  </>
                ) : (
                  'Connect Google Calendar'
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !currentUserId} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  event ? 'Update Event' : 'Create Event'
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
