# Inbox Translation Improvement Plan

## Current Status
- Most of the inbox form strings are already translated to Persian
- The translation system is properly implemented with fallback support
- Some strings in the inbox list component remain untranslated

## Missing Translations
1. Search and Filter UI:
   - "Search items..." → "جستجو موارد..."
   - "Filter by status:" → "فیلتر بر اساس وضعیت:"
   - "All Items" → "همه موارد"

2. Status Values:
   - Need to implement status value translations:
     - "INBOX" → "صندوق ورودی"
     - "NEXT_ACTION" → "اقدام بعدی"
     - "PROJECT" → "پروژه"
     - "SOMEDAY" → "یک روزی"
     - "REFERENCE" → "مرجع"
     - "TRASH" → "حذف شده"

## Implementation Steps

1. Update Translation Files:
   - Add missing translations to src/lib/translations/inbox.ts
   - Create a status translation mapping

2. Modify Components:
   - Update inbox-list.tsx to use translations for search and filter UI
   - Implement status value translation logic

3. Testing:
   - Verify all strings are properly translated
   - Test with different status values
   - Ensure fallbacks work correctly

## Code Changes Required

1. Add to src/lib/translations/inbox.ts:
```typescript
export const inboxTr = {
  // Existing translations...
  SearchItems: "جستجو موارد...",
  FilterByStatus: "فیلتر بر اساس وضعیت:",
  AllItems: "همه موارد",
  // Status translations
  Status: {
    INBOX: "صندوق ورودی",
    NEXT_ACTION: "اقدام بعدی",
    PROJECT: "پروژه",
    SOMEDAY: "یک روزی",
    REFERENCE: "مرجع",
    TRASH: "حذف شده"
  }
};
```

2. Update inbox-list.tsx to use translations:
```typescript
// Replace hardcoded strings with translations
placeholder={inboxTr['SearchItems']}
// ...
{inboxTr['FilterByStatus']}
// ...
{statusValue === "all" ? inboxTr['AllItems'] : inboxTr.Status[statusValue] || statusValue}
```

## Next Steps
After approval of this plan, we should:
1. Implement the changes in Code mode
2. Test the translations in the application
3. Document any additional translation needs discovered during implementation