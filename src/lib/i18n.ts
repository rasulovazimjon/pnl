// Lightweight i18n: three locales, a flat key dictionary, and a translate()
// helper with {param} interpolation. UI text only — user data (category names,
// notes) is never translated.

export const LOCALES = ["en", "ru", "uz"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  uz: "O'zbek",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  uz: "UZ",
};

type Dict = Record<string, string>;

const en: Dict = {
  // common
  "common.loading": "Loading…",
  "common.add": "Add",
  "common.save": "Save",
  "common.delete": "Delete",
  "common.rename": "Rename",
  "common.pleaseWait": "Please wait…",
  "common.optional": "optional",

  // nav
  "nav.dashboard": "Dashboard",
  "nav.transactions": "Transactions",
  "nav.pnl": "P&L",
  "nav.budgets": "Budgets",
  "nav.recurring": "Recurring",
  "nav.categories": "Categories",
  "nav.signOut": "Sign out",
  "nav.menu": "Menu",

  // roles
  "role.HUSBAND": "Husband",
  "role.WIFE": "Wife",

  // types
  "type.income": "Income",
  "type.cogs": "Cost of goods",
  "type.cogsFull": "Cost of goods sold",
  "type.expense": "Expense",
  "type.expenses": "Expenses",

  // auth
  "auth.tagline": "Personal P&L — your finances, corporate-style.",
  "auth.signInTitle": "Sign in",
  "auth.createTitle": "Create your account",
  "auth.yourName": "Your name",
  "auth.roleInHousehold": "Role in household",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordHint": "At least 8 characters",
  "auth.householdName": "Household name (optional)",
  "auth.householdNamePlaceholder": "Our household",
  "auth.joinCodeLabel": "Joining your partner? Household code (optional)",
  "auth.joinCodePlaceholder": "Leave blank to start fresh",
  "auth.joinCodeHelp": "Your partner can find this code on the dashboard after signing in.",
  "auth.signInBtn": "Sign in",
  "auth.createBtn": "Create account",
  "auth.newHere": "New here?",
  "auth.createOne": "Create an account",
  "auth.haveAccount": "Already have an account?",
  "auth.genericError": "Something went wrong",
  "auth.networkError": "Network error",

  // dashboard
  "dash.title": "Dashboard",
  "dash.addTransaction": "+ Add transaction",
  "dash.income": "Income",
  "dash.expenses": "Expenses",
  "dash.netProfit": "Net profit",
  "dash.netMargin": "Net margin",
  "dash.netProfit6mo": "Net profit — last 6 months",
  "dash.topExpenses": "Top expenses — {month}",
  "dash.noExpenses": "No expenses recorded yet.",
  "dash.viewFullPnl": "View full P&L →",

  // household card
  "hh.invite": "Invite your partner: share this household code so they can join the same books.",
  "hh.copy": "Copy",
  "hh.copied": "Copied!",

  // transactions
  "txn.title": "Transactions",
  "txn.amount": "Amount (UZS)",
  "txn.category": "Category",
  "txn.date": "Date",
  "txn.note": "Note",
  "txn.allCategories": "All categories",
  "txn.netFor": "Net for {month}:",
  "txn.none": "No transactions this month yet.",
  "txn.recurring": "recurring",
  "txn.confirmDelete": "Delete this transaction?",
  "txn.errAmount": "Enter a valid amount",
  "txn.errCategory": "Pick a category",

  // pnl
  "pnl.title": "Profit & Loss",
  "pnl.lineItem": "Line item",
  "pnl.actual": "Actual",
  "pnl.budget": "Budget",
  "pnl.variance": "Variance",
  "pnl.revenue": "Revenue",
  "pnl.totalRevenue": "Total revenue",
  "pnl.grossProfit": "Gross profit",
  "pnl.operatingExpenses": "Operating expenses",
  "pnl.totalExpenses": "Total expenses",
  "pnl.netProfit": "Net profit",
  "pnl.netMargin": "Net margin",
  "pnl.footer": "All figures in UZS. Variance is favorable (green) / unfavorable (red) vs budget.",

  // budgets
  "bud.title": "Budgets",
  "bud.description": "Set a monthly target per category. Green variance = under budget (or above income target); red = over.",
  "bud.incomeTargets": "Income targets",
  "bud.budget": "Budget (UZS)",

  // recurring
  "rec.title": "Recurring transactions",
  "rec.description": "Fixed monthly items (rent, salary, subscriptions). These post automatically each month on the chosen day.",
  "rec.name": "Name",
  "rec.day": "Day",
  "rec.none": "No recurring rules yet.",
  "rec.dayOf": "day {day} of each month",
  "rec.paused": "(paused)",
  "rec.pause": "Pause",
  "rec.resume": "Resume",
  "rec.namePlaceholder": "Apartment rent",
  "rec.confirmDelete": "Delete recurring rule \"{name}\"? Past posted transactions are kept.",
  "rec.errName": "Enter a name",
  "rec.errDay": "Day must be 1–28",

  // categories
  "cat.title": "Categories",
  "cat.showArchived": "Show archived",
  "cat.new": "New category",
  "cat.type": "Type",
  "cat.archive": "Archive",
  "cat.unarchive": "Unarchive",
  "cat.newPlaceholder": "e.g. Gym membership",
  "cat.renamePrompt": "Rename category",
  "cat.confirmDelete": "Delete \"{name}\"? If it has transactions it will be archived instead.",

  // language
  "lang.label": "Language",
};

const ru: Dict = {
  "common.loading": "Загрузка…",
  "common.add": "Добавить",
  "common.save": "Сохранить",
  "common.delete": "Удалить",
  "common.rename": "Переименовать",
  "common.pleaseWait": "Пожалуйста, подождите…",
  "common.optional": "необязательно",

  "nav.dashboard": "Панель",
  "nav.transactions": "Транзакции",
  "nav.pnl": "P&L",
  "nav.budgets": "Бюджеты",
  "nav.recurring": "Регулярные",
  "nav.categories": "Категории",
  "nav.signOut": "Выйти",
  "nav.menu": "Меню",

  "role.HUSBAND": "Муж",
  "role.WIFE": "Жена",

  "type.income": "Доход",
  "type.cogs": "Себестоимость",
  "type.cogsFull": "Себестоимость продаж",
  "type.expense": "Расход",
  "type.expenses": "Расходы",

  "auth.tagline": "Личный P&L — ваши финансы по-корпоративному.",
  "auth.signInTitle": "Вход",
  "auth.createTitle": "Создайте аккаунт",
  "auth.yourName": "Ваше имя",
  "auth.roleInHousehold": "Роль в семье",
  "auth.email": "Эл. почта",
  "auth.password": "Пароль",
  "auth.passwordHint": "Минимум 8 символов",
  "auth.householdName": "Название семьи (необязательно)",
  "auth.householdNamePlaceholder": "Наша семья",
  "auth.joinCodeLabel": "Присоединяетесь к партнёру? Код семьи (необязательно)",
  "auth.joinCodePlaceholder": "Оставьте пустым, чтобы начать заново",
  "auth.joinCodeHelp": "Ваш партнёр найдёт этот код на панели после входа.",
  "auth.signInBtn": "Войти",
  "auth.createBtn": "Создать аккаунт",
  "auth.newHere": "Впервые здесь?",
  "auth.createOne": "Создать аккаунт",
  "auth.haveAccount": "Уже есть аккаунт?",
  "auth.genericError": "Что-то пошло не так",
  "auth.networkError": "Ошибка сети",

  "dash.title": "Панель",
  "dash.addTransaction": "+ Добавить транзакцию",
  "dash.income": "Доход",
  "dash.expenses": "Расходы",
  "dash.netProfit": "Чистая прибыль",
  "dash.netMargin": "Рентабельность",
  "dash.netProfit6mo": "Чистая прибыль — последние 6 месяцев",
  "dash.topExpenses": "Крупнейшие расходы — {month}",
  "dash.noExpenses": "Расходов пока нет.",
  "dash.viewFullPnl": "Открыть полный P&L →",

  "hh.invite": "Пригласите партнёра: поделитесь этим кодом семьи, чтобы вести общий учёт.",
  "hh.copy": "Копировать",
  "hh.copied": "Скопировано!",

  "txn.title": "Транзакции",
  "txn.amount": "Сумма (UZS)",
  "txn.category": "Категория",
  "txn.date": "Дата",
  "txn.note": "Заметка",
  "txn.allCategories": "Все категории",
  "txn.netFor": "Итог за {month}:",
  "txn.none": "В этом месяце ещё нет транзакций.",
  "txn.recurring": "регулярный",
  "txn.confirmDelete": "Удалить эту транзакцию?",
  "txn.errAmount": "Введите корректную сумму",
  "txn.errCategory": "Выберите категорию",

  "pnl.title": "Прибыль и убытки",
  "pnl.lineItem": "Статья",
  "pnl.actual": "Факт",
  "pnl.budget": "Бюджет",
  "pnl.variance": "Отклонение",
  "pnl.revenue": "Выручка",
  "pnl.totalRevenue": "Итого выручка",
  "pnl.grossProfit": "Валовая прибыль",
  "pnl.operatingExpenses": "Операционные расходы",
  "pnl.totalExpenses": "Итого расходы",
  "pnl.netProfit": "Чистая прибыль",
  "pnl.netMargin": "Рентабельность",
  "pnl.footer": "Все суммы в UZS. Отклонение: выгодное (зелёное) / невыгодное (красное) относительно бюджета.",

  "bud.title": "Бюджеты",
  "bud.description": "Задайте месячную цель для каждой категории. Зелёное отклонение = в рамках бюджета (или выше цели дохода); красное = превышение.",
  "bud.incomeTargets": "Цели по доходам",
  "bud.budget": "Бюджет (UZS)",

  "rec.title": "Регулярные транзакции",
  "rec.description": "Фиксированные ежемесячные операции (аренда, зарплата, подписки). Добавляются автоматически каждый месяц в выбранный день.",
  "rec.name": "Название",
  "rec.day": "День",
  "rec.none": "Регулярных операций пока нет.",
  "rec.dayOf": "каждый месяц {day}-го числа",
  "rec.paused": "(на паузе)",
  "rec.pause": "Пауза",
  "rec.resume": "Возобновить",
  "rec.namePlaceholder": "Аренда квартиры",
  "rec.confirmDelete": "Удалить регулярную операцию «{name}»? Ранее добавленные транзакции сохранятся.",
  "rec.errName": "Введите название",
  "rec.errDay": "День должен быть от 1 до 28",

  "cat.title": "Категории",
  "cat.showArchived": "Показать архив",
  "cat.new": "Новая категория",
  "cat.type": "Тип",
  "cat.archive": "В архив",
  "cat.unarchive": "Из архива",
  "cat.newPlaceholder": "напр. Абонемент в зал",
  "cat.renamePrompt": "Переименовать категорию",
  "cat.confirmDelete": "Удалить «{name}»? Если есть транзакции, категория будет отправлена в архив.",

  "lang.label": "Язык",
};

const uz: Dict = {
  "common.loading": "Yuklanmoqda…",
  "common.add": "Qo'shish",
  "common.save": "Saqlash",
  "common.delete": "O'chirish",
  "common.rename": "Nomini o'zgartirish",
  "common.pleaseWait": "Iltimos, kuting…",
  "common.optional": "ixtiyoriy",

  "nav.dashboard": "Boshqaruv",
  "nav.transactions": "Tranzaksiyalar",
  "nav.pnl": "P&L",
  "nav.budgets": "Byudjetlar",
  "nav.recurring": "Muntazam",
  "nav.categories": "Kategoriyalar",
  "nav.signOut": "Chiqish",
  "nav.menu": "Menyu",

  "role.HUSBAND": "Er",
  "role.WIFE": "Xotin",

  "type.income": "Daromad",
  "type.cogs": "Tannarx",
  "type.cogsFull": "Sotilgan mahsulot tannarxi",
  "type.expense": "Xarajat",
  "type.expenses": "Xarajatlar",

  "auth.tagline": "Shaxsiy P&L — moliyangiz korporativ uslubda.",
  "auth.signInTitle": "Kirish",
  "auth.createTitle": "Hisob yarating",
  "auth.yourName": "Ismingiz",
  "auth.roleInHousehold": "Oiladagi rol",
  "auth.email": "Email",
  "auth.password": "Parol",
  "auth.passwordHint": "Kamida 8 ta belgi",
  "auth.householdName": "Oila nomi (ixtiyoriy)",
  "auth.householdNamePlaceholder": "Bizning oila",
  "auth.joinCodeLabel": "Turmush o'rtog'ingizga qo'shilyapsizmi? Oila kodi (ixtiyoriy)",
  "auth.joinCodePlaceholder": "Yangi boshlash uchun bo'sh qoldiring",
  "auth.joinCodeHelp": "Turmush o'rtog'ingiz bu kodni kirgandan so'ng boshqaruv panelida topadi.",
  "auth.signInBtn": "Kirish",
  "auth.createBtn": "Hisob yaratish",
  "auth.newHere": "Bu yerda yangimisiz?",
  "auth.createOne": "Hisob yarating",
  "auth.haveAccount": "Hisobingiz bormi?",
  "auth.genericError": "Nimadir xato ketdi",
  "auth.networkError": "Tarmoq xatosi",

  "dash.title": "Boshqaruv paneli",
  "dash.addTransaction": "+ Tranzaksiya qo'shish",
  "dash.income": "Daromad",
  "dash.expenses": "Xarajatlar",
  "dash.netProfit": "Sof foyda",
  "dash.netMargin": "Sof marja",
  "dash.netProfit6mo": "Sof foyda — oxirgi 6 oy",
  "dash.topExpenses": "Eng katta xarajatlar — {month}",
  "dash.noExpenses": "Hozircha xarajatlar yo'q.",
  "dash.viewFullPnl": "To'liq P&L ni ko'rish →",

  "hh.invite": "Turmush o'rtog'ingizni taklif qiling: umumiy hisob yuritish uchun ushbu oila kodini ulashing.",
  "hh.copy": "Nusxa olish",
  "hh.copied": "Nusxa olindi!",

  "txn.title": "Tranzaksiyalar",
  "txn.amount": "Summa (UZS)",
  "txn.category": "Kategoriya",
  "txn.date": "Sana",
  "txn.note": "Izoh",
  "txn.allCategories": "Barcha kategoriyalar",
  "txn.netFor": "{month} uchun natija:",
  "txn.none": "Bu oyda hali tranzaksiyalar yo'q.",
  "txn.recurring": "muntazam",
  "txn.confirmDelete": "Ushbu tranzaksiya o'chirilsinmi?",
  "txn.errAmount": "To'g'ri summa kiriting",
  "txn.errCategory": "Kategoriyani tanlang",

  "pnl.title": "Foyda va zarar",
  "pnl.lineItem": "Modda",
  "pnl.actual": "Haqiqiy",
  "pnl.budget": "Byudjet",
  "pnl.variance": "Farq",
  "pnl.revenue": "Tushum",
  "pnl.totalRevenue": "Jami tushum",
  "pnl.grossProfit": "Yalpi foyda",
  "pnl.operatingExpenses": "Operatsion xarajatlar",
  "pnl.totalExpenses": "Jami xarajatlar",
  "pnl.netProfit": "Sof foyda",
  "pnl.netMargin": "Sof marja",
  "pnl.footer": "Barcha summalar UZS da. Farq byudjetga nisbatan: ijobiy (yashil) / salbiy (qizil).",

  "bud.title": "Byudjetlar",
  "bud.description": "Har bir kategoriya uchun oylik maqsad belgilang. Yashil farq = byudjet ichida (yoki daromad maqsadidan yuqori); qizil = oshib ketgan.",
  "bud.incomeTargets": "Daromad maqsadlari",
  "bud.budget": "Byudjet (UZS)",

  "rec.title": "Muntazam tranzaksiyalar",
  "rec.description": "Belgilangan oylik to'lovlar (ijara, oylik, obunalar). Har oy tanlangan kunda avtomatik qo'shiladi.",
  "rec.name": "Nomi",
  "rec.day": "Kun",
  "rec.none": "Hozircha muntazam to'lovlar yo'q.",
  "rec.dayOf": "har oy {day}-kuni",
  "rec.paused": "(to'xtatilgan)",
  "rec.pause": "To'xtatish",
  "rec.resume": "Davom ettirish",
  "rec.namePlaceholder": "Kvartira ijarasi",
  "rec.confirmDelete": "\"{name}\" muntazam to'lovi o'chirilsinmi? Ilgari qo'shilgan tranzaksiyalar saqlanadi.",
  "rec.errName": "Nom kiriting",
  "rec.errDay": "Kun 1–28 oralig'ida bo'lishi kerak",

  "cat.title": "Kategoriyalar",
  "cat.showArchived": "Arxivni ko'rsatish",
  "cat.new": "Yangi kategoriya",
  "cat.type": "Turi",
  "cat.archive": "Arxivlash",
  "cat.unarchive": "Arxivdan chiqarish",
  "cat.newPlaceholder": "masalan, Sport zali obunasi",
  "cat.renamePrompt": "Kategoriya nomini o'zgartirish",
  "cat.confirmDelete": "\"{name}\" o'chirilsinmi? Agar tranzaksiyalari bo'lsa, arxivga o'tkaziladi.",

  "lang.label": "Til",
};

const DICTS: Record<Locale, Dict> = { en, ru, uz };

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
  let str = dict[key] ?? DICTS[DEFAULT_LOCALE][key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

const MONTHS: Record<Locale, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  uz: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"],
};

// Short month names for compact charts.
const MONTHS_SHORT: Record<Locale, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  uz: ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"],
};

/** "2026-08" -> "August 2026" (localized). */
export function monthLabelIntl(locale: Locale, key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[locale][m - 1]} ${y}`;
}

/** "2026-08" -> "Aug" (localized short). */
export function monthShort(locale: Locale, key: string): string {
  const m = Number(key.split("-")[1]);
  return MONTHS_SHORT[locale][m - 1];
}
