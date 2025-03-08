import { ItemStatus } from "@prisma/client";

export const inboxTr = {
  Inbox: "صندوق ورودی",
  Description: "سریع فکرها، کارها و ایده‌ها رو بگیر. بعدا اونها رو به کارهای منظم تبدیل کن.",
  AddNewItem: "اضافه کردن مورد جدید",
  WhatsOnYourMind: "به چی فکر می‌کنی؟ (مثلا، 'تماس با دندانپزشک'، 'خرید مواد غذایی')",
  AddAdditionalDetails: "جزئیات، زمینه یا افکار اضافی رو اضافه کن... (اختیاری)",
  PriorityLevel: "سطح اولویت",
  SelectPriority: "انتخاب اولویت",
  Low: "کم",
  Medium: "متوسط",
  High: "زیاد",
  Urgent: "فوری",
  EstimatedTimeMinutes: "زمان تخمینی (دقیقه)",
  Between5And480Minutes: "بین 5 تا 480 دقیقه (8 ساعت)",
  RequiresFocusMode: "نیاز به حالت تمرکز",
  EnableForTasksThatNeedConcentratedAttention: "برای کارهایی که نیاز به توجه متمرکز دارند فعال کنید",
  Capture: "ثبت",
  InboxItems: "موارد صندوق ورودی",
  Items: "موارد",
  SearchItems: "جستجو موارد...",
  FilterByStatus: "فیلتر بر اساس وضعیت:",
  AllItems: "همه موارد",
  
  // New translations for improved UI
  CaptureNew: "ثبت جدید",
  ProcessItems: "پردازش موارد",
  RecentlyCaptured: "اخیراً ثبت شده",
  Process: "پردازش",
  ProcessItem: "پردازش مورد",
  TotalItems: "کل موارد",
  Unprocessed: "پردازش نشده",
  Completed: "تکمیل شده",
  ProcessingRate: "نرخ پردازش",
  
  // Additional translations for enhanced inbox list
  ItemsSelected: "مورد انتخاب شده",
  BatchActions: "اقدامات دسته‌ای",
  ChangeStatus: "تغییر وضعیت",
  NoItemsFound: "موردی یافت نشد",
  TryChangingFilters: "فیلترها یا جستجوی خود را تغییر دهید تا آنچه به دنبال آن هستید پیدا کنید.",
  
  // Item card actions
  Edit: "ویرایش",
  Duplicate: "کپی",
  Share: "اشتراک‌گذاری",
  OpenInNewTab: "باز کردن در تب جدید",
  Delete: "حذف",
  
  // Form feedback and time units
  ItemCaptured: "مورد ثبت شد",
  ItemAddedToInbox: "مورد شما به صندوق ورودی اضافه شد",
  Error: "خطا",
  FailedToCreateItem: "ایجاد مورد با شکست مواجه شد. لطفا دوباره تلاش کنید.",
  Minutes: "دقیقه",
  Hour: "ساعت",
  Hours: "ساعت",
  
  // Additional UI elements
  VoiceCapture: "ضبط صوتی",
  GenerateIdeas: "تولید ایده‌ها",
  ShowMoreOptions: "نمایش گزینه‌های بیشتر",
  Capturing: "در حال ثبت...",
  
  Status: {
    INBOX: "صندوق ورودی",
    NEXT_ACTION: "اقدام بعدی",
    PROJECT: "پروژه",
    WAITING_FOR: "در انتظار",
    SOMEDAY_MAYBE: "شاید یک روز",
    REFERENCE: "مرجع",
    COMPLETED: "تکمیل شده",
    DELEGATED: "محول شده",
    TRASHED: "حذف شده"
  } as Record<ItemStatus, string>
};
