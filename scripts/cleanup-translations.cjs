/**
 * Clean up unused translation keys from DB and add missing ones.
 * Run: node scripts/cleanup-translations.cjs
 */
const { createClient } = require("@supabase/supabase-js");
const { resolve } = require("path");
require("dotenv").config({ path: resolve(process.cwd(), ".env") });
require("dotenv").config({ path: resolve(process.cwd(), ".env.local"), override: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(url, key);

// Keys confirmed UNUSED (checked against actual code usage)
const DELETE_KEYS = [
  // Duplicate hero keys (code uses hero.title.line1/2/3)
  "hero.title1", "hero.title2", "hero.title3",
  "hero.badge", "hero.howItWorks",
  // Deleted island-scene component (src/components/island-scene.tsx removed)
  "islandScene.arrived.badge", "islandScene.arrived.description", "islandScene.arrived.title",
  "islandScene.crossing.badge", "islandScene.crossing.description", "islandScene.crossing.title",
  "islandScene.departed.badge", "islandScene.departed.description", "islandScene.departed.title",
  // Old hardcoded plans (now fetched from DB)
  "planSelector.premium.f1", "planSelector.premium.f2", "planSelector.premium.f3",
  "planSelector.premium.f4", "planSelector.premium.f5", "planSelector.premium.name",
  "planSelector.temel.f1", "planSelector.temel.f2", "planSelector.temel.f3",
  "planSelector.temel.f4", "planSelector.temel.name",
  // Old howItWorks pattern (code uses .description, not .desc)
  "howItWorks.step1.desc", "howItWorks.step2.desc", "howItWorks.step3.desc",
  "howItWorks.step4.description", "howItWorks.step4.number",
  "howItWorks.cta", "howItWorks.ready", "howItWorks.readyDesc", "howItWorks.stepLabel",
  // Old finalCta duplicates
  "finalCta.tag", "finalCta.title1", "finalCta.title2",
  // Old Turkish action names (not used in code)
  "action.faturalar", "action.kabul", "action.musteriler",
  // Old sidebar keys (replaced by user/dashboard sidebar)
  "sidebar.actions", "sidebar.consolidate", "sidebar.home",
  "sidebar.packages", "sidebar.payment", "sidebar.profile",
  // Old checkout keys
  "checkout.payAll", "checkout.paySelected",
  "checkout.summary.pendingCount", "checkout.summary.selectedCount",
  // Old consolidate
  "consolidate.acceptFeeLine", "consolidate.packageCount", "consolidate.savings",
  // Old contact keys (replaced with new pattern)
  "contact.error", "contact.mapTitle", "contact.required",
  "contact.success", "contact.successMessage", "contact.warehouse",
  // Old dashboard keys (greeting, welcome, demurrageDesc, pendingInvoiceDesc are unused)
  "dashboard.greeting", "dashboard.welcome", "dashboard.demurrageDesc",
  "dashboard.pendingInvoiceDesc",
  // Old package status (Turkish)
  "packages.status.bekleniyor", "packages.status.birlestirildi",
  "packages.status.teslim_edildi", "packages.status.yolda",
  // Old invoices
  "invoices.acceptFee", "invoices.consolidationFee", "invoices.count",
  "invoices.createModal.acceptFee", "invoices.createModal.createButton",
  "invoices.demurrageFee", "invoices.detail.packets", "invoices.packageCount",
  // Old pricing
  "pricing.acceptFee", "pricing.acceptFeeInfo", "pricing.demurrageFee",
  "pricing.demurrageFeeLabel", "pricing.fee.acceptUnit", "pricing.freeStorage",
  "pricing.basic.price", "pricing.basic.pricePeriod", "pricing.premium.badge",
  "pricing.savings",
  // Old settings (now dynamic via system-settings)
  "settings.demurrage_abandoned_days", "settings.demurrage_abandoned_daysDesc",
  "settings.demurrage_warning_days", "settings.demurrage_warning_daysDesc",
  "settings.fee_accept", "settings.fee_acceptDesc",
  "settings.fee_consolidation", "settings.fee_consolidationDesc",
  "settings.fee_daily_demurrage", "settings.fee_daily_demurrageDesc",
  "settings.free_storage_days", "settings.free_storage_daysDesc",
  "settings.max_invoice_amount", "settings.max_invoice_amountDesc",
  "settings.max_package_weight_kg", "settings.max_package_weight_kgDesc",
  "settings.min_consolidation_packages", "settings.min_consolidation_packagesDesc",
  "settings.pickup_code_expiry_minutes", "settings.pickup_code_expiry_minutesDesc",
  "settings.plan_price_premium", "settings.plan_price_premiumDesc",
  "settings.plan_price_temel", "settings.plan_price_temelDesc",
  "settings.storage_warning_days", "settings.storage_warning_daysDesc",
  "settings.warehouse_address", "settings.warehouse_addressDesc",
  // Misc dead keys
  "faq.noQuestions", "register.emailNotReceived", "register.smsNotReceived",
  "profile.addressLabel", "profile.addressPlaceholder",
  "packages.daysFree", "customers.count", "customers.packageCount",
  "intake.notes", "intake.shelfPrefix",
  "store.error.packagesLoadFailed", "store.error.generic", "store.error.deleteFailed",
  "store.error.intakeFailed", "store.error.deliveryFailed", "store.error.discardFailed",
  "store.error.registerFailed",
  "api.error.loginRequired", "api.error.unauthorized", "api.error.authCheckFailed",
  "api.error.rateLimited",
  "adminTranslations.deleteFromAllConfirm",
];

// Missing editor keys to ADD
const ADD_ENTRIES = {
  tr: {
    "editor.redo": "Yinele",
    "editor.undo": "Geri Al",
    "action.intake": "Teslim Al",
    "editor.bold": "Kalın",
    "editor.italic": "İtalik",
    "editor.heading": "Başlık",
    "editor.paragraph": "Paragraf",
    "editor.link": "Bağlantı Ekle",
    "editor.unlink": "Bağlantıyı Kaldır",
    "editor.bulletList": "Madde İşaretli Liste",
    "editor.orderedList": "Numaralı Liste",
    "editor.blockquote": "Alıntı",
    "editor.code": "Kod",
    "editor.strikethrough": "Üstü Çizili",
  },
  en: {
    "editor.redo": "Redo",
    "editor.undo": "Undo",
    "action.intake": "Intake",
    "editor.bold": "Bold",
    "editor.italic": "Italic",
    "editor.heading": "Heading",
    "editor.paragraph": "Paragraph",
    "editor.link": "Add Link",
    "editor.unlink": "Remove Link",
    "editor.bulletList": "Bullet List",
    "editor.orderedList": "Numbered List",
    "editor.blockquote": "Blockquote",
    "editor.code": "Code",
    "editor.strikethrough": "Strikethrough",
  },
  de: {
    "editor.redo": "Wiederholen",
    "editor.undo": "Rückgängig",
    "action.intake": "Annahme",
    "editor.bold": "Fett",
    "editor.italic": "Kursiv",
    "editor.heading": "Überschrift",
    "editor.paragraph": "Absatz",
    "editor.link": "Link hinzufügen",
    "editor.unlink": "Link entfernen",
    "editor.bulletList": "Aufzählungsliste",
    "editor.orderedList": "Nummerierte Liste",
    "editor.blockquote": "Zitat",
    "editor.code": "Code",
    "editor.strikethrough": "Durchgestrichen",
  }
};

async function main() {
  // 1. Delete unused keys (batch per language)
  const LANGS = ["tr", "en", "de"];
  let totalDeleted = 0;

  for (const lang of LANGS) {
    for (let i = 0; i < DELETE_KEYS.length; i += 100) {
      const batch = DELETE_KEYS.slice(i, i + 100);
      const { error, count } = await supabase
        .from("translations")
        .delete({ count: "exact" })
        .eq("language_code", lang)
        .in("key", batch);

      if (error) {
        console.error(`Delete error [${lang}]:`, error.message);
      } else if (count) {
        totalDeleted += count;
        console.log(`Deleted ${count} keys from ${lang} (batch ${i / 100 + 1})`);
      }
    }
  }

  console.log(`\nTotal deleted: ${totalDeleted} rows`);

  // 2. Add missing keys
  let totalAdded = 0;
  for (const lang of LANGS) {
    const entries = ADD_ENTRIES[lang];
    const rows = Object.entries(entries).map(([key, value]) => ({
      language_code: lang,
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    // Upsert in batches of 200
    for (let i = 0; i < rows.length; i += 200) {
      const batch = rows.slice(i, i + 200);
      const { error } = await supabase
        .from("translations")
        .upsert(batch, { onConflict: "language_code,key" });

      if (error) {
        console.error(`Add error [${lang}]:`, error.message);
      } else {
        totalAdded += batch.length;
      }
    }
    console.log(`Added ${rows.length} keys to ${lang}`);
  }
  console.log(`\nTotal added: ${totalAdded} rows`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
