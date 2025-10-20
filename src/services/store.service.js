import Store from "../models/Store.js";
import AppError from "../utils/AppError.js";

export async function listStores(userId) {
  return Store.find({ ownerId: userId, isActive: true }).select("_id name isActive createdAt");
}

export async function createStore(userId, { name, location }) {
  if (!name) throw new AppError("Store name is required", 400);
  const store = await Store.create({ name, ownerId: userId, isActive: true, address: location });
  return store;
}
