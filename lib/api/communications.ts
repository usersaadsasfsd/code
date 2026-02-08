// project/lib/api/communications.ts

import { getDatabase } from '@/lib/mongodb';
import { CommunicationActivity, CalendarEvent, WhatsAppMessage } from '@/types/communication';
import { ObjectId } from 'mongodb';

export class CommunicationsAPI {
  private static async getCollection(collectionName: string) {
    const db = await getDatabase();
    return db.collection(collectionName);
  }

  // --- EXISTING METHODS (keep these) ---
  static async createActivity(activity: Omit<CommunicationActivity, 'id'>): Promise<CommunicationActivity> {
    try {
      const collection = await this.getCollection('communication_activities');
      const now = new Date();
      
      const newActivity = {
        ...activity,
        timestamp: activity.timestamp || now,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(newActivity);
      
      return {
        ...newActivity,
        id: result.insertedId.toString(),
      } as CommunicationActivity;
    } catch (error) {
      console.error('Error creating communication activity:', error);
      throw new Error('Failed to create communication activity');
    }
  }

  static async getActivitiesByLead(leadId: string): Promise<CommunicationActivity[]> {
    try {
      const collection = await this.getCollection('communication_activities');
      const activities = await collection.find({ leadId }).sort({ timestamp: -1 }).toArray();
      
      return activities.map(activity => ({
        id: activity._id.toString(),
        leadId: activity.leadId,
        type: activity.type,
        action: activity.action,
        content: activity.content,
        eventId: activity.eventId,
        timestamp: activity.timestamp instanceof Date ? activity.timestamp : new Date(activity.timestamp),
        agent: activity.agent,
        metadata: activity.metadata,
        createdAt: activity.createdAt instanceof Date ? activity.createdAt : new Date(activity.createdAt),
        updatedAt: activity.updatedAt instanceof Date ? activity.updatedAt : new Date(activity.updatedAt),
      })) as CommunicationActivity[];
    } catch (error) {
      console.error('Error fetching communication activities:', error);
      return [];
    }
  }

  static async createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      const collection = await this.getCollection('calendar_events');
      const now = new Date();
      const newEvent = {
        ...event,
        createdAt: now,
        updatedAt: now,
      };
      const result = await collection.insertOne(newEvent);
      return {
        ...newEvent,
        id: result.insertedId.toString(),
      } as CalendarEvent;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  static async getCalendarEvents(userId?: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    try {
      const collection = await this.getCollection('calendar_events');
      const query: any = {};
      if (userId) {
        // Assuming 'createdBy' field holds the user ID for events
        query.createdBy = userId;
      }
      if (startDate) {
        query.startDateTime = { $gte: startDate };
      }
      if (endDate) {
        query.endDateTime = { ...(query.endDateTime || {}), $lte: endDate };
      }
      
      const events = await collection.find(query).sort({ startDateTime: 1 }).toArray();
      
      return events.map(event => ({
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        startDateTime: event.startDateTime instanceof Date ? event.startDateTime : new Date(event.startDateTime),
        endDateTime: event.endDateTime instanceof Date ? event.endDateTime : new Date(event.endDateTime),
        attendees: event.attendees,
        reminders: event.reminders,
        leadId: event.leadId,
        googleEventId: event.googleEventId,
        createdBy: event.createdBy,
        createdAt: event.createdAt instanceof Date ? event.createdAt : new Date(event.createdAt),
        updatedAt: event.updatedAt instanceof Date ? event.updatedAt : new Date(event.updatedAt),
      })) as CalendarEvent[];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }

  static async updateCalendarEvent(id: string, updateData: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }
      const collection = await this.getCollection('calendar_events');
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } },
        { returnDocument: 'after' } // Return the updated document
      );
      if (!result?.value) return null;
      const updatedEvent = result.value;
      return {
        id: updatedEvent._id.toString(),
        title: updatedEvent.title,
        description: updatedEvent.description,
        startDateTime: updatedEvent.startDateTime instanceof Date ? updatedEvent.startDateTime : new Date(updatedEvent.startDateTime),
        endDateTime: updatedEvent.endDateTime instanceof Date ? updatedEvent.endDateTime : new Date(updatedEvent.endDateTime),
        attendees: updatedEvent.attendees,
        reminders: updatedEvent.reminders,
        leadId: updatedEvent.leadId,
        googleEventId: updatedEvent.googleEventId,
        createdBy: updatedEvent.createdBy,
        createdAt: updatedEvent.createdAt instanceof Date ? updatedEvent.createdAt : new Date(updatedEvent.createdAt),
        updatedAt: updatedEvent.updatedAt instanceof Date ? updatedEvent.updatedAt : new Date(updatedEvent.updatedAt),
      } as CalendarEvent;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  static async deleteCalendarEvent(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }
      const collection = await this.getCollection('calendar_events');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  static async createWhatsAppMessage(message: Omit<WhatsAppMessage, 'id'>): Promise<WhatsAppMessage> {
    try {
      const collection = await this.getCollection('whatsapp_messages');
      const now = new Date();
      const newMessage = {
        ...message,
        sentAt: message.sentAt || now, // Ensure sentAt is set
        createdAt: now,
        updatedAt: now,
      };
      const result = await collection.insertOne(newMessage);
      return {
        ...newMessage,
        id: result.insertedId.toString(),
      } as WhatsAppMessage;
    } catch (error) {
      console.error('Error creating WhatsApp message:', error);
      throw new Error('Failed to create WhatsApp message');
    }
  }

  static async getWhatsAppMessagesByLead(leadId: string): Promise<WhatsAppMessage[]> {
    try {
      const collection = await this.getCollection('whatsapp_messages');
      const messages = await collection.find({ leadId }).sort({ sentAt: -1 }).toArray();
      
      return messages.map(message => ({
        id: message._id.toString(),
        leadId: message.leadId,
        message: message.message,
        sentBy: message.sentBy,
        status: message.status,
        sentAt: message.sentAt instanceof Date ? message.sentAt : new Date(message.sentAt),
        createdAt: message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt),
        updatedAt: message.updatedAt instanceof Date ? message.updatedAt : new Date(message.updatedAt),
      })) as WhatsAppMessage[];
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error);
      return [];
    }
  }

  static async updateWhatsAppMessageStatus(id: string, status: WhatsAppMessage['status']): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }
      
      const collection = await this.getCollection('whatsapp_messages');
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            status,
            updatedAt: new Date()
          } 
        }
      );
      
      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error updating WhatsApp message status:', error);
      return false;
    }
  }

  // --- METHODS Filtered by userId (from route handler) ---

  // New method for global communication statistics, filtered by userId if provided
  static async getCommunicationStats(userId?: string): Promise<{
    totalMessages: number;
    scheduledEvents: number;
    emailsSent: number;
    callsMade: number;
  }> {
    try {
      const whatsappMessagesCollection = await this.getCollection('whatsapp_messages');
      const communicationActivitiesCollection = await this.getCollection('communication_activities');
      const calendarEventsCollection = await this.getCollection('calendar_events');

      // Apply userId filter if provided
      const whatsappQuery = userId ? { sentBy: userId } : {};
      const activityQuery = userId ? { agent: userId } : {}; // Assuming 'agent' field for activities
      const calendarQuery = userId ? { createdBy: userId } : {}; // Assuming 'createdBy' field for calendar events

      const totalMessages = await whatsappMessagesCollection.countDocuments(whatsappQuery);
      const scheduledEvents = await calendarEventsCollection.countDocuments(calendarQuery);
      const emailsSent = await communicationActivitiesCollection.countDocuments({ ...activityQuery, type: 'email', action: 'sent' });
      const callsMade = await communicationActivitiesCollection.countDocuments({ ...activityQuery, type: 'call', action: 'completed' }); // Assuming 'completed' for calls

      return {
        totalMessages,
        scheduledEvents,
        emailsSent,
        callsMade,
      };
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      return { totalMessages: 0, scheduledEvents: 0, emailsSent: 0, callsMade: 0 };
    }
  }

  // New method for global recent activities, filtered by userId if provided
  static async getAllRecentActivities(limit: number = 20, userId?: string): Promise<any[]> {
    try {
      const communicationActivitiesCollection = await this.getCollection('communication_activities');
      const whatsappMessagesCollection = await this.getCollection('whatsapp_messages');
      const calendarEventsCollection = await this.getCollection('calendar_events');

      const recentActivities: any[] = [];

      // Apply userId filter if provided
      const activityFilter = userId ? { agent: userId } : {};
      const whatsappFilter = userId ? { sentBy: userId } : {};
      const calendarFilter = userId ? { createdBy: userId } : {};

      // Fetch recent communication activities (emails, calls)
      const activities = await communicationActivitiesCollection.find(activityFilter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      activities.forEach(activity => {
        recentActivities.push({
          id: activity._id.toString(),
          type: activity.type, // 'email' | 'call'
          message: activity.content || `A ${activity.type} activity was ${activity.action}.`,
          timestamp: activity.timestamp instanceof Date ? activity.timestamp : new Date(activity.timestamp),
          leadId: activity.leadId,
          agent: activity.agent,
        });
      });

      // Fetch recent WhatsApp messages
      const whatsappMessages = await whatsappMessagesCollection.find(whatsappFilter)
        .sort({ sentAt: -1 })
        .limit(limit)
        .toArray();
      whatsappMessages.forEach(message => {
        recentActivities.push({
          id: message._id.toString(),
          type: 'whatsapp',
          message: `WhatsApp message: "${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}"`,
          timestamp: message.sentAt instanceof Date ? message.sentAt : new Date(message.sentAt),
          leadId: message.leadId,
          sentBy: message.sentBy,
          status: message.status,
        });
      });

      // Fetch recent Calendar Events
      const calendarEvents = await calendarEventsCollection.find(calendarFilter)
        .sort({ startDateTime: -1 })
        .limit(limit)
        .toArray();
      calendarEvents.forEach(event => {
        recentActivities.push({
          id: event._id.toString(),
          type: 'calendar',
          message: `Calendar event: ${event.title} - ${event.description || 'No description'}`,
          timestamp: event.startDateTime instanceof Date ? event.startDateTime : new Date(event.startDateTime),
          leadId: event.leadId,
          createdBy: event.createdBy,
        });
      });

      // Sort all combined activities by timestamp in descending order
      recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Limit the final result
      return recentActivities.slice(0, limit);

    } catch (error) {
      console.error('Error fetching all recent activities:', error);
      return [];
    }
  }
}
