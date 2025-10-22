import mongoose from "mongoose";

const StoreSettingsSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  email: String,
  gstin: String,
  fssaiNumber: String,
  ownerName: String,
  currency: { type: String, default: "INR" },
  timezone: { type: String, default: "Asia/Kolkata" },
}, { _id: false });

const AppSettingsSchema = new mongoose.Schema({
  autoRefresh: { type: Boolean, default: true },
  refreshInterval: { type: String, default: "5" },
  defaultView: { type: String, default: "pos" }, // dashboard | pos | kitchen | tables
  enableOfflineMode: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: false },
  soundNotifications: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: false },
  smsNotifications: { type: Boolean, default: true },
  language: { type: String, default: "en" },
  dateFormat: { type: String, default: "DD/MM/YYYY" },
  timeFormat: { type: String, default: "24h" },
}, { _id: false });

const InvoiceSettingsSchema = new mongoose.Schema({
  showLogo: { type: Boolean, default: true },
  logoUrl: { type: String, default: "" },
  includeHSN: { type: Boolean, default: true },
  includeGST: { type: Boolean, default: true },
  showQRCode: { type: Boolean, default: false },
  termsAndConditions: { type: String, default: "1. All prices are inclusive of GST\n2. No returns or exchanges\n3. Thank you for your business" },
  footerText: { type: String, default: "Thank you for your business!" },
  invoicePrefix: { type: String, default: "INV" },
  invoiceStartNumber: { type: Number, default: 1001 },
  printAfterOrder: { type: Boolean, default: true },
  emailInvoice: { type: Boolean, default: false },
}, { _id: false });

const TaxSettingsSchema = new mongoose.Schema({
  enableGST: { type: Boolean, default: true },
  gstRate: { type: Number, default: 18 },
  cgstRate: { type: Number, default: 9 },
  sgstRate: { type: Number, default: 9 },
  igstRate: { type: Number, default: 18 },
  taxInclusive: { type: Boolean, default: true },
  hsnRequired: { type: Boolean, default: true },
  serviceChargePercent: { type: Number, default: 0 }, // optional, common in dine-in
}, { _id: false });

const PaymentSettingsSchema = new mongoose.Schema({
  enableCash: { type: Boolean, default: true },
  enableOnline: { type: Boolean, default: true },
  enableUPI: { type: Boolean, default: true },
  enableCard: { type: Boolean, default: true },
  defaultPaymentMethod: { type: String, default: "cash" },
  roundOffBills: { type: Boolean, default: true },
  minimumOrderValue: { type: Number, default: 0 },
}, { _id: false });

const SettingsSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", unique: true, index: true, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },

  store: { type: StoreSettingsSchema, default: () => ({}) },
  app: { type: AppSettingsSchema, default: () => ({}) },
  invoice: { type: InvoiceSettingsSchema, default: () => ({}) },
  tax: { type: TaxSettingsSchema, default: () => ({}) },
  payment: { type: PaymentSettingsSchema, default: () => ({}) },

  // for atomic invoice numbering
  invoiceSeq: { type: Number, default: 1000 } // last issued number
}, { timestamps: true, collection: "settings" });

export default mongoose.model("Settings", SettingsSchema);
