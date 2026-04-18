import { FurnitureItem } from "../models/FurnitureItem.js";
import { KeyRecord } from "../models/KeyRecord.js";
import { LinenRecord } from "../models/LinenRecord.js";

export const inventoryRepository = {
  getFurnitureByRoom: (roomId) => FurnitureItem.find({ roomId }),
  addFurniture: (payload) => FurnitureItem.create(payload),
  updateFurniture: (id, payload) =>
    FurnitureItem.findByIdAndUpdate(id, payload, { new: true, runValidators: true }),

  issueLinen: (payload) => LinenRecord.create(payload),
  returnLinen: (id, payload) =>
    LinenRecord.findByIdAndUpdate(id, payload, { new: true, runValidators: true }),

  issueKey: (payload) => KeyRecord.create(payload),
  returnKey: (id, payload) =>
    KeyRecord.findByIdAndUpdate(id, payload, { new: true, runValidators: true }),
  getMissingKeys: () => KeyRecord.find({ status: "Missing" }).sort({ updatedAt: -1 }),
};
