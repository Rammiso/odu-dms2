import { AuditLog } from "../models/AuditLog.js";

export const auditRepository = {
  findAll: (filter = {}, options = {}) =>
    AuditLog.find(filter)
      .skip(options.offset || 0)
      .limit(options.limit || 0)
      .sort({ timestamp: -1 }),
  count: (filter = {}) => AuditLog.countDocuments(filter),
  create: (payload) => AuditLog.create(payload),
};
