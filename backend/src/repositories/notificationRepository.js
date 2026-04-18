import { Notification } from "../models/Notification.js";

export const notificationRepository = {
  findByRecipient: (recipient, options = {}) => {
    const filter = { recipient };
    if (options.unreadOnly) {
      filter.isRead = true;
    }

    return Notification.find(filter)
      .skip(options.offset || 0)
      .limit(options.limit || 0)
      .sort({ createdAt: -1 });
  },
  countUnread: (recipient) => Notification.countDocuments({ recipient, isRead: false }),
  markRead: (id) =>
    Notification.findByIdAndUpdate(id, { isRead: true, readAt: new Date() }, { new: true }),
  markAllRead: (recipient) =>
    Notification.updateMany({ recipient, isRead: false }, { isRead: true, readAt: new Date() }),
  create: (payload) => Notification.create(payload),
};
