/**
 * The two languages the page is written in, and the rule for picking one.
 *
 * A plain dictionary rather than a message-format plugin: one document, two
 * languages, forty keys. A plugin would be machinery for that, and machinery
 * that has to be reconfigured when the wording changes is machinery that will
 * be reconfigured badly.
 *
 * The `ru` table is typed as a total record over the keys of `en`. That is the
 * whole safety net: add a key in one language and forget the other and the
 * build stops, rather than a sentence quietly turning English in front of a
 * Russian reader. test-lang.cjs checks the same thing at runtime, for the case
 * where the table was edited without the build ever being run.
 */

export type Lang = 'en' | 'ru'

/** What the button draws once a language has been chosen. */
export const LANG_CODE: Record<Lang, string> = { en: 'EN', ru: 'RU' }

/**
 * How each language writes its own dates.
 *
 * Kept beside the button code rather than guessed at the call site, so the two
 * things that say "Russian" come from one place.
 */
export const LOCALE: Record<Lang, string> = { en: 'en-US', ru: 'ru-RU' }

/**
 * The visitor's answer, if it is one.
 *
 * `en-GB` and `ru-RU` count: the value can arrive from a browser that sends its
 * own language tag, not only from our own button.
 */
export function normalizeLang(value: unknown): Lang | null {
  const v = String(value ?? '').trim().toLowerCase()
  if (v === 'en' || v.startsWith('en-')) return 'en'
  if (v === 'ru' || v.startsWith('ru-')) return 'ru'
  return null
}

/**
 * The language the browser asks for, read from the request.
 *
 * Accept-Language is a weighted list - `ru-RU,ru;q=0.9,en;q=0.8` - and the
 * weight decides, not the order. Reading only the first tag would take
 * `en;q=0.5` over `ru;q=0.9` in the one case where the browser sent them
 * unsorted, which is a real case and not a hypothetical one.
 *
 * Anything that is not Russian is English. That is not a judgement about the
 * other languages the world writes in; it is that the page is written in two,
 * and a reader whose language is neither gets the one the page is written in.
 */
export function detectLang(header?: string | null): Lang {
  if (!header) return 'en'

  const best = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const weight = params.reduce((w, p) => {
        const [key, value] = p.trim().split('=')
        return key === 'q' ? Number(value) || 0 : w
      }, 1)
      return { tag: tag.trim().toLowerCase(), weight }
    })
    .filter(({ tag }) => tag && tag !== '*')
    .sort((a, b) => b.weight - a.weight)[0]

  return normalizeLang(best?.tag) ?? 'en'
}

const en = {
  'meta.title': 'SpikyMC - Custom Minecraft Launcher',
  'meta.description':
    'SpikyMC is a custom Minecraft launcher that lets you easily manage multiple Minecraft installations at once. Download for Windows and Linux.',

  'nav.themeLabel': 'Toggle theme',
  'nav.langLabel': 'Change language',
  'nav.langChanged': 'Language changed to English',

  'hero.lead': 'A free, open-source Minecraft launcher.',
  'hero.cta': 'Get SpikyMC',

  'why.title': 'Why SpikyMC',
  'why.sub': 'Six reasons to choose our launcher',
  'why.e1.title': 'Ely.by built-in',
  'why.e1.body':
    'Your Ely.by account and custom skins work everywhere. Patch is bundled - no setup needed.',
  'why.e2.title': 'Portable builds for Windows and Linux',
  'why.e2.body':
    'Unpack and run. No install, nothing outside the folder. Fits on a USB stick.',
  'why.e3.title': 'Own infrastructure',
  'why.e3.body':
    'All metadata, translations, wiki, libraries, Maven, Java runtimes and releases served from our machine - no third-party API that can rate-limit or disappear.',
  'why.e4.title': 'Multiple instances & modpacks',
  'why.e4.body':
    'Create unlimited instances with own mods, settings and Java version. Install and update modpacks from Modrinth, CurseForge, ATLauncher in one click.',
  'why.e5.title': 'Mod management from Modrinth & CurseForge',
  'why.e5.body':
    'Install, update or remove mods directly from Modrinth and CurseForge inside the launcher. No manual file juggling.',
  'why.e6.title': 'Per-instance Java & arguments',
  'why.e6.body':
    'Each instance gets its own Java version (auto-downloaded) and custom JVM arguments. No version conflicts between modpacks.',

  'dl.title': 'Download',
  'dl.cardSetup': 'Setup',
  'dl.cardPortable': 'Portable',
  'dl.download': 'Download',
  'dl.noBuild': 'No build',
  'dl.noteSetup': 'Installer',
  'dl.noteSetupBody':
    'The .exe walks you through the setup and leaves a shortcut behind. It needs permission to write to Program Files, which is why there is a portable build as well.',
  'dl.notePortable': 'Portable',
  'dl.notePortableBody':
    'Unpack the .zip anywhere and run the exe inside. Nothing is installed and nothing is written outside the folder - which also means nothing to uninstall.',
  'dl.noteAppImage': 'AppImage',
  'dl.noteAppImageBody':
    'One file, no install. The first run needs the executable bit, and some distributions need FUSE; if you see an error about that, the portable archive below avoids both.',
  'dl.notePortableBodyLinux': 'Unpack the .tar.gz and run the binary inside. Nothing touches the system, so it is the safest choice on a locked-down machine.',
  'dl.noteFirstRun': 'First run',
  'dl.noteFirstRunBody': 'Or open it in a file manager and tick "Allow executing file as program".',

  'rel.title': 'Releases',
  'rel.sub': 'Every published build, with what changed in it.',
  'rel.preview': 'Preview',
  'rel.latest': 'Latest',
  'rel.stable': 'Stable',
  'rel.view': 'View on GitHub',
  'rel.empty': 'No releases in the cache yet - they are refreshed by the server.',
  'rel.noBody': 'No description provided.',

  'tabs.label': 'Platform',

  'foot.forkPre': 'SpikyMC is a fork of',
  'foot.forkMid': ', which in turn is a fork of',
  'foot.forkPost': '.',
  'foot.claim':
    '. Not approved by, associated with, or supported by Prism Launcher or MultiMC.',
}

export type StringKey = keyof typeof en

type Table = Record<StringKey, string>

const ru: Table = {
  'meta.title': 'SpikyMC - лаунчер Minecraft',
  'meta.description':
    'SpikyMC - лаунчер Minecraft, который позволяет удобно управлять несколькими установками Minecraft сразу. Скачать для Windows и Linux.',

  'nav.themeLabel': 'Сменить тему',
  'nav.langLabel': 'Сменить язык',
  'nav.langChanged': 'Язык изменён на русский',

  'hero.lead': 'Бесплатный лаунчер Minecraft с открытым исходным кодом.',
  'hero.cta': 'Скачать SpikyMC',

  'why.title': 'Почему SpikyMC',
  'why.sub': 'Шесть причин выбрать наш лаунчер',
  'why.e1.title': 'Ely.by встроен',
  'why.e1.body':
    'Аккаунт Ely.by и свои скины работают везде. Патч встроен - настройка не нужна.',
  'why.e2.title': 'Портативные сборки для Windows и Linux',
  'why.e2.body':
    'Распакуйте и запустите. Никакой установки, ничего за пределами папки. Влезает на флешку.',
  'why.e3.title': 'Своя инфраструктура',
  'why.e3.body':
    'Все метаданные, переводы, вики, библиотеки, Maven, Java-рантаймы и релизы - с нашего сервера. Никакого стороннего API, которое может ограничить или исчезнуть.',
  'why.e4.title': 'Множественные инстансы и модпаки',
  'why.e4.body':
    'Создавайте сколько угодно инстансов, у каждого свои моды, настройки и версия Java. Модпаки с Modrinth, CurseForge, ATLauncher ставятся в один клик.',
  'why.e5.title': 'Управление модами через Modrinth и CurseForge',
  'why.e5.body':
    'Ставьте, обновляйте и удаляйте моды прямо из Modrinth и CurseForge внутри лаунчера. Никакого ручного копирования файлов.',
  'why.e6.title': 'Отдельный Java и аргументы на инстанс',
  'why.e6.body':
    'У каждого инстанса своя версия Java (скачивается сама) и свои JVM-аргументы. Никаких конфликтов версий между модпаками.',

  'dl.title': 'Скачать',
  'dl.cardSetup': 'Установщик',
  'dl.cardPortable': 'Портативная',
  'dl.download': 'Скачать',
  'dl.noBuild': 'Нет сборки',
  'dl.noteSetup': 'Установщик',
  'dl.noteSetupBody':
    '.exe проводит через установку и оставляет ярлык. Ему нужно разрешение писать в Program Files - поэтому есть ещё портативная сборка.',
  'dl.notePortable': 'Портативная',
  'dl.notePortableBody':
    'Распакуйте .zip куда угодно и запустите exe внутри. Ничего не устанавливается и ничего не пишется за пределами папки - а значит, и удалять потом нечего.',
  'dl.noteAppImage': 'AppImage',
  'dl.noteAppImageBody':
    'Один файл, без установки. При первом запуске нужен бит исполнения, а некоторым дистрибутивам ещё FUSE; если увидите ошибку про это, портативный архив ниже не требует ни того, ни другого.',
  'dl.notePortableBodyLinux': 'Распакуйте .tar.gz и запустите бинарник внутри. Ничего не трогает систему, поэтому это самый безопасный вариант на машине с ограничениями.',
  'dl.noteFirstRun': 'Первый запуск',
  'dl.noteFirstRunBody': 'Или откройте него в файловом менеджере и отметьте "Разрешить выполнение файла как программы".',

  'rel.title': 'Релизы',
  'rel.sub': 'Все опубликованные сборки и что в них изменилось.',
  'rel.preview': 'Предпросмотр',
  'rel.latest': 'Новая',
  'rel.stable': 'Стабильная',
  'rel.view': 'Открыть на GitHub',
  'rel.empty': 'Релизы ещё не загружены - их обновляет сервер.',
  'rel.noBody': 'Описание отсутствует.',

  'tabs.label': 'Платформа',

  'foot.forkPre': 'SpikyMC - форк',
  'foot.forkMid': ', а тот в свою очередь форк',
  'foot.forkPost': '.',
  'foot.claim': '. Не одобрен, не связан и не поддерживается Prism Launcher или MultiMC.',
}

export type StringKey = keyof typeof en

type Table = Record<StringKey, string>

export const STRINGS: Record<Lang, Table> = { en, ru }

/** The languages, in the order the button cycles through them. */
export const LANGS: Lang[] = ['en', 'ru']

/**
 * One sentence, in the language in view.
 *
 * Falls back to English and then to the key itself. A missing translation
 * should look like a missing translation - a visible key - and not like a
 * blank space where a sentence should be.
 */
export function translate(lang: Lang, key: StringKey): string {
  return STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
}