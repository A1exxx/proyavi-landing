# Прояви — пространство для проявления

Лендинг проекта раскрытия проявленности через голос. Один обезличенный сайт, MVP / V1 — отправная точка проекта.

## Что это

Не курс вокала. Не онлайн-школа. Пространство, где человек раскрывает себя через работу с голосом + телом + психикой + публичностью. 6 направлений вокруг голоса:

- Вокал
- Сценическая речь
- Работа перед камерой
- Психология проявленности
- Тело и практики
- Запись своей песни *(апсейл)*

## Запуск локально

```bash
python -m http.server 8080
```

Открыть http://localhost:8080

## Структура

```
proyavlennost/
├── index.html              # главная и единственная страница
├── styles/
│   ├── tokens.css          # design tokens (colors oklch, type, spacing, easing)
│   ├── base.css            # reset, typography, body
│   ├── components.css      # buttons, cards, forms
│   ├── sections.css        # стили блоков
│   └── animations.css      # keyframes, scroll-driven, @starting-style
├── scripts/
│   ├── main.js             # инициализация
│   ├── waveform.js         # Canvas hero waveform
│   ├── scroll.js           # Lenis smooth scroll
│   ├── reveal.js           # scroll-triggered reveal
│   └── form.js             # клиентская валидация + View Transition
├── assets/
│   ├── images/             # изображения
│   └── icons/              # SVG-иконки
└── docs/
    ├── brand-direction.md      # палитра, типографика, тон
    ├── content-brief.md        # весь копирайт
    ├── diagnostika-checklist.md # скрипт менеджера
    └── strategy-leadgen.md     # стратегия трафика
```

## Стек

Vanilla HTML + CSS + JS. Внешние библиотеки по CDN:

- **GSAP 3.13+** (ScrollTrigger, SplitText) — анимации
- **Lenis 1.2+** — smooth scroll
- **Lottie-web** — микро-анимации (опционально)

Используем нативные браузерные возможности:

- `oklch()` + `color-mix()` — современная цветовая система
- CSS Scroll-Driven Animations
- View Transitions API
- `@starting-style` для появлений
- `:has()` для состояний
- Container Queries
- `text-wrap: balance / pretty`

## Статус

V1 — отправная точка. Все placeholder-данные подсвечены через `data-placeholder="true"` атрибут и желтую подложку — пользователь дозаполнит реальной информацией о команде, кейсах, фото.

## Бренд

«Прояви» — глагол-якорь, бренд-голос. Слоган: «Прояви — пространство для проявления.»

Палитра: тёплый бордо + индиго на кремовом — премиум-творческий, яркий но не напрягающий.

Типографика: Cormorant (заголовки) + Inter (тело) + Editorial New (акценты, опц.).

См. `docs/brand-direction.md` для полной спецификации.
