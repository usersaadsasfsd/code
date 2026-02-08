// lib/api/notifications.ts

import { getDatabase } from '@/lib/mongodb';
import { Notification } from '@/types/notification'; // Assuming Notification.scheduledFor is string | undefined
import { ObjectId } from 'mongodb';

// Define an input type for createNotification that explicitly expects Date objects for date fields
// This aligns with how the 'scheduledFor' is passed from the API route (as a Date object).
type CreateNotificationInput = Omit<Notification, 'id' | 'createdAt' | 'read' | 'scheduledFor'> & {
  scheduledFor?: Date; // Explicitly expect Date for scheduledFor when creating
};

export class NotificationsAPI {
  private static async getCollection() {
    const db = await getDatabase();
    return db.collection('notifications');
  }

  /**
   * Fetches notifications for a given user, filtered by their role.
   * Agents only receive notifications addressed to them (by userId).
   * Admins receive all notifications.
   * @param userId The ID of the authenticated user.
   * @param userRole The role of the authenticated user ('admin' or 'agent').
   * @returns A promise that resolves to an array of Notification objects.
   */
  static async getUserNotifications(userId: string, userRole: 'admin' | 'agent'): Promise<Notification[]> {
    try {
      const collection = await this.getCollection();
      
      let query: { userId?: string } = {};

      // If the user is an 'agent', they should only see notifications explicitly for their userId.
      // If the user is an 'admin', the query remains empty, fetching all notifications.
      if (userRole === 'agent') {
        query.userId = userId;
      } 
      // For 'admin' role, 'query' remains an empty object, effectively fetching all.

      const notificationsFromDb = await collection
        .find(query) // Use the constructed query based on user role
        .sort({ createdAt: -1 })
        .limit(50) // Limit the number of notifications returned
        .toArray();
      
      return notificationsFromDb.map(doc => {
        // Map MongoDB document to the Notification interface, ensuring correct types
        const notification: Notification = {
          id: doc._id.toString(), // Convert ObjectId to string for 'id'
          userId: doc.userId,
          type: doc.type,
          title: doc.title,
          message: doc.message,
          priority: doc.priority,
          read: doc.read,
          createdAt: new Date(doc.createdAt).toISOString(), // Convert Date to ISO string
          scheduledFor: doc.scheduledFor ? new Date(doc.scheduledFor).toISOString() : undefined,
          actionUrl: doc.actionUrl,
          actionLabel: doc.actionLabel,
          data: doc.data,
        };
        return notification;
      }) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Creates a new notification in the database.
   * @param notificationData The data for the new notification, with 'scheduledFor' as a Date object.
   * @returns A promise that resolves to the created Notification object (with 'scheduledFor' as ISO string).
   */
  static async createNotification(notificationData: CreateNotificationInput): Promise<Notification> {
    try {
      const collection = await this.getCollection();
      const now = new Date();
      
      // Prepare the object for MongoDB insertion. MongoDB can handle Date objects.
      const newNotificationForDb = {
        ...notificationData, // This includes 'scheduledFor' as a Date object from CreateNotificationInput
        read: false, // Notifications are unread by default when created
        createdAt: now,
      };

      const result = await collection.insertOne(newNotificationForDb);
      
      // Return the created notification, ensuring 'scheduledFor' is an ISO string
      return {
        id: result.insertedId.toString(),
        userId: newNotificationForDb.userId,
        type: newNotificationForDb.type,
        title: newNotificationForDb.title,
        message: newNotificationForDb.message,
        priority: newNotificationForDb.priority,
        read: newNotificationForDb.read,
        createdAt: newNotificationForDb.createdAt.toISOString(), // Convert Date to ISO string
        scheduledFor: newNotificationForDb.scheduledFor ? newNotificationForDb.scheduledFor.toISOString() : undefined, // Convert Date to ISO string
        actionUrl: newNotificationForDb.actionUrl,
        actionLabel: newNotificationForDb.actionLabel,
        data: newNotificationForDb.data,
      } as Notification; // Explicitly cast to Notification to match return type
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error; // Re-throw to allow error handling upstream
    }
  }

  /**
   * Marks a specific notification as read for a given user.
   * Ensures a user can only mark their own notifications as read.
   * @param notificationId The ID of the notification to mark as read.
   * @param userId The ID of the user attempting to mark the notification.
   * @returns A promise that resolves to true if the notification was marked, false otherwise.
   */
  static async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(notificationId), userId: userId }, // Ensure user ownership
        { $set: { read: true } }
      );
      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Marks all unread notifications for a specific user as read.
   * @param userId The ID of the user whose notifications should be marked as read.
   * @returns A promise that resolves to true if any notifications were marked, false otherwise.
   */
  static async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateMany(
        { userId: userId, read: false }, // Only mark unread notifications
        { $set: { read: true } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Deletes a specific notification for a given user.
   * Ensures a user can only delete their own notifications.
   * @param notificationId The ID of the notification to delete.
   * @param userId The ID of the user attempting to delete the notification.
   * @returns A promise that resolves to true if the notification was deleted, false otherwise.
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(notificationId), userId: userId }); // Ensure user ownership
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Deletes multiple notifications for a given user.
   * Ensures a user can only delete their own notifications.
   * @param notificationIds An array of notification IDs to delete.
   * @param userId The ID of the user attempting to delete the notifications.
   * @returns A promise that resolves to the number of deleted notifications.
   */
  static async deleteBulkNotifications(notificationIds: string[], userId: string): Promise<number> {
    try {
      const collection = await this.getCollection();
      const objectIds = notificationIds.map(id => new ObjectId(id));
      const result = await collection.deleteMany({ _id: { $in: objectIds }, userId: userId }); // Ensure user ownership for all
      return result.deletedCount;
    } catch (error) {
      console.error('Error deleting bulk notifications:', error);
      return 0;
    }
  }

  /**
   * Creates a specific type of notification for lead updates.
   * @param userId The ID of the user to notify.
   * @param leadId The ID of the lead involved.
   * @param leadName The name of the lead.
   * @param updateType The type of update (e.g., "created", "updated").
   * @returns A promise that resolves to the created Notification or null if an error occurred.
   */
  static async createLeadUpdateNotification(
    userId: string,
    leadId: string,
    leadName: string,
    updateType: string
  ): Promise<Notification | null> {
    try {
      // For createNotification, 'scheduledFor' is optional and not relevant for this type of notification
      return await this.createNotification({
        userId,
        type: 'lead_update',
        title: 'Lead Update',
        message: `Lead "${leadName}" has been ${updateType}.`,
        priority: 'medium',
        data: {
          leadId,
          leadName,
          updateType,
        },
        actionUrl: `/leads/${leadId}`,
        actionLabel: 'View Lead',
      });
    } catch (error) {
      console.error('Error creating lead update notification:', error);
      return null;
    }
  }

  /**
   * Creates a task reminder notification.
   * @param userId The ID of the user to notify.
   * @param taskId The ID of the task.
   * @param taskTitle The title of the task.
   * @param dueDate The due date of the task.
   * @returns A promise that resolves to the created Notification or null if an error occurred.
   */
  static async createTaskReminder(
    userId: string,
    taskId: string,
    taskTitle: string,
    dueDate: Date 
  ): Promise<Notification | null> {
    try {
      const now = new Date();
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursUntilDue = Math.floor(timeDiff / (1000 * 60 * 60));

      let priority: Notification['priority'] = 'low';
      let message = `Task \"${taskTitle}\" is due`;

      if (hoursUntilDue <= 1) {
        priority = 'high';
        message = `Task \"${taskTitle}\" is due in ${Math.max(0, hoursUntilDue)} hour(s)`;
      } else if (hoursUntilDue <= 24) {
        priority = 'medium';
        message = `Task \"${taskTitle}\" is due in ${hoursUntilDue} hours`;
      }

      return await this.createNotification({
        userId,
        type: 'task_reminder',
        title: 'Task Reminder',
        message,
        priority,
        data: {
          taskId,
          taskTitle,
          dueDate: dueDate.toISOString(), 
        },
        actionUrl: '/tasks',
        actionLabel: 'View Tasks',
        scheduledFor: dueDate, // Pass dueDate as a Date object
      });
    } catch (error) {
      console.error('Error creating task reminder:', error);
      return null;
    }
  }
}
