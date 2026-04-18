import { inventoryRepository } from "../repositories/inventoryRepository.js";

export const inventoryService = {
  getRoomFurniture: async (roomId) => ({ items: await inventoryRepository.getFurnitureByRoom(roomId) }),

  addFurniture: (payload) => inventoryRepository.addFurniture(payload),

  updateFurniture: (itemId, payload) => inventoryRepository.updateFurniture(itemId, payload),

  issueLinen: (payload, userId) => inventoryRepository.issueLinen({ ...payload, issuedBy: userId }),

  returnLinen: (payload, userId) =>
    inventoryRepository.returnLinen(payload.recordId, {
      dateReturned: new Date(),
      damages: payload.damages,
      receivedBy: userId,
    }),

  issueKey: (payload, userId) => inventoryRepository.issueKey({ ...payload, issuedBy: userId }),

  returnKey: (payload, userId) =>
    inventoryRepository.returnKey(payload.recordId, {
      dateReturned: new Date(),
      condition: payload.condition,
      status: payload.condition === "Missing" ? "Missing" : "Returned",
      receivedBy: userId,
    }),

  getMissingKeys: async () => ({ missingKeys: await inventoryRepository.getMissingKeys() }),
};
