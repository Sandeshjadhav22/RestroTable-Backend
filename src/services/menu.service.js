import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import MenuCategory from "../models/MenuCategory.js";
import MenuItem from "../models/MenuItem.js";

// List all categories WITH their items for a store
export async function listCategoriesWithItems(ownerId, storeId) {
  if (!mongoose.isValidObjectId(storeId)) throw new AppError("Invalid storeId", 400);

  const categories = await MenuCategory.find({ ownerId, storeId, isActive: true })
    .select("_id name storeId")
    .sort({ createdAt: 1 });

  const catIds = categories.map(c => c._id);
  const items = await MenuItem.find({ ownerId, storeId, categoryId: { $in: catIds }, isActive: true })
    .select("_id itemName price imageUrl available taxable hsnCode categoryId")
    .sort({ createdAt: 1 });

  const itemsByCat = items.reduce((acc, it) => {
    const k = it.categoryId.toString();
    (acc[k] ||= []).push({
      menuItemId: it._id,
      itemName: it.itemName,
      price: it.price,
      imageUrl: it.imageUrl,
      available: it.available,
      taxable: it.taxable,
      hsnCode: it.hsnCode,
    });
    return acc;
  }, {});

  return categories.map(c => ({
    menuCategoryId: c._id,
    name: c.name,
    menuItems: itemsByCat[c._id.toString()] || [],
  }));
}

export async function addCategory(ownerId, { name, storeId }) {
  if (!name || !storeId) throw new AppError("name and storeId are required", 400);
  const doc = await MenuCategory.create({ name, storeId, ownerId });
  return { menuCategoryId: doc._id, name: doc.name };
}

export async function deleteCategory(ownerId, categoryId) {
  if (!mongoose.isValidObjectId(categoryId)) throw new AppError("Invalid category id", 400);
  const cat = await MenuCategory.findOne({ _id: categoryId, ownerId, isActive: true });
  if (!cat) throw new AppError("Category not found", 404);

  // soft-delete category + its items
  await MenuCategory.updateOne({ _id: cat._id }, { $set: { isActive: false } });
  await MenuItem.updateMany({ categoryId: cat._id, ownerId }, { $set: { isActive: false } });
  return true;
}

export async function addItem(ownerId, payload) {
  const { itemName, price, imageUrl, available, taxable, hsnCode, menuCategoryId } = payload || {};
  if (!itemName || typeof price !== "number" || price < 0 || !menuCategoryId)
    throw new AppError("itemName, price, menuCategoryId are required", 400);

  const cat = await MenuCategory.findOne({ _id: menuCategoryId, ownerId, isActive: true });
  if (!cat) throw new AppError("Category not found", 404);

  const doc = await MenuItem.create({
    itemName,
    price,
    imageUrl: imageUrl || "",
    available: available ?? true,
    taxable: taxable ?? true,
    hsnCode: hsnCode || "",
    categoryId: menuCategoryId,
    storeId: cat.storeId,
    ownerId,
  });

  return {
    menuItemId: doc._id,
    itemName: doc.itemName,
    price: doc.price,
    imageUrl: doc.imageUrl,
    available: doc.available,
    taxable: doc.taxable,
    hsnCode: doc.hsnCode,
    category: { id: menuCategoryId }, // compatibility for your update mapping
  };
}

export async function updateItem(ownerId, itemId, patch) {
  if (!mongoose.isValidObjectId(itemId)) throw new AppError("Invalid item id", 400);
  const item = await MenuItem.findOne({ _id: itemId, ownerId, isActive: true });
  if (!item) throw new AppError("Item not found", 404);

  // allow category change
  if (patch.menuCategoryId) {
    const cat = await MenuCategory.findOne({ _id: patch.menuCategoryId, ownerId, isActive: true });
    if (!cat) throw new AppError("Category not found", 404);
    item.categoryId = cat._id;
    item.storeId = cat.storeId; // keep in sync
  }

  if (patch.itemName !== undefined) item.itemName = patch.itemName;
  if (patch.price !== undefined)   item.price    = Number(patch.price);
  if (patch.imageUrl !== undefined) item.imageUrl = patch.imageUrl || "";
  if (patch.available !== undefined) item.available = !!patch.available;
  if (patch.taxable !== undefined) item.taxable = !!patch.taxable;
  if (patch.hsnCode !== undefined) item.hsnCode = patch.hsnCode || "";

  await item.save();

  return {
    menuItemId: item._id,
    itemName: item.itemName,
    price: item.price,
    imageUrl: item.imageUrl,
    available: item.available,
    taxable: item.taxable,
    hsnCode: item.hsnCode,
    category: { id: item.categoryId }, // your frontend expects category.id
  };
}

export async function deleteItem(ownerId, itemId) {
  if (!mongoose.isValidObjectId(itemId)) throw new AppError("Invalid item id", 400);
  const item = await MenuItem.findOne({ _id: itemId, ownerId, isActive: true });
  if (!item) throw new AppError("Item not found", 404);
  item.isActive = false;
  await item.save();
  return true;
}
