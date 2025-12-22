# Реализация поведения верхнего меню (Header)

## Обзор

Фиксированный header с умным поведением: скрывается при прокрутке вниз, появляется при прокрутке вверх, становится полупрозрачным с эффектом размытия фона при скролле.

## Критические уроки (избегайте наших ошибок!)

### ⚠️ Проблема #1: Tailwind purging динамических классов
**Что пошло не так:** Изначально использовали Tailwind классы `bg-white/95` (белый с 95% непрозрачностью), которые добавлялись через JavaScript. В dev режиме всё работало, но в production Tailwind **удалял (purge) эти классы**, потому что их не было в статической разметке.

**Симптом:** На мобильных устройствах после refresh и небольшого скролла header становился **полностью прозрачным** вместо полупрозрачного.

**Решение:** 
```javascript
// ❌ НЕ ДЕЛАЙТЕ ТАК - Tailwind удалит класс в production
header?.classList.add('bg-white/95');

// ✅ ПРАВИЛЬНО - используйте inline стили
header.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
```

### ⚠️ Проблема #2: Конфликт статических и динамических стилей
**Что пошло не так:** В HTML был класс `bg-white`, а JavaScript пытался добавить inline `backgroundColor`. Класс имел приоритет, inline стили игнорировались.

**Решение:**
```javascript
// Сначала УДАЛЯЕМ конфликтующие классы
header?.classList.remove('border-gray-200', 'bg-white');
// Затем добавляем новые классы
header?.classList.add('backdrop-blur-md', 'border-white/20');
// И только потом устанавливаем inline стили
header.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
```

### ⚠️ Проблема #3: Safari/iOS не поддерживает backdrop-filter без префикса
**Решение:** Добавьте `-webkit-` префикс в глобальных стилях:
```css
.backdrop-blur-md {
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
```

## Структура компонента

### 1. HTML разметка (Header.astro)

```astro
<header id="main-header" class="fixed w-full bg-white shadow-sm z-50 transition-all duration-500 ease-in-out border-b border-gray-200">
  <div class="container mx-auto px-4 py-4 flex justify-between items-center">
    <!-- Логотип и навигация -->
  </div>
</header>
```

**Ключевые классы:**
- `fixed w-full` - фиксированное позиционирование на всю ширину
- `bg-white` - начальный белый фон (удаляется при скролле)
- `z-50` - высокий z-index, чтобы быть поверх контента
- `transition-all duration-500 ease-in-out` - плавные переходы (500ms)
- `border-b border-gray-200` - нижняя рамка (меняется при скролле)

### 2. JavaScript логика

```javascript
const header = document.getElementById('main-header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  // === Состояние 1: В самом верху страницы ===
  if (currentScroll <= 0) {
    header?.classList.remove('-translate-y-full', 'opacity-0', 'backdrop-blur-md', 'border-white/20');
    header?.classList.add('border-gray-200', 'bg-white');
    if (header) {
      header.style.backgroundColor = ''; // Убираем inline стиль
    }
    lastScroll = currentScroll;
    return;
  }

  // === Состояние 2: Прокрутка вниз - скрываем header ===
  if (currentScroll > lastScroll && !header?.classList.contains('-translate-y-full')) {
    header?.classList.add('-translate-y-full', 'opacity-0');
  } 
  // === Состояние 3: Прокрутка вверх - показываем header ===
  else if (currentScroll < lastScroll && header?.classList.contains('-translate-y-full')) {
    header?.classList.remove('-translate-y-full', 'opacity-0');
  }

  // === Состояние 4: Любой скролл (не в верху) - делаем полупрозрачным ===
  // КРИТИЧНО: сначала удаляем конфликтующие классы!
  header?.classList.remove('border-gray-200', 'bg-white');
  header?.classList.add('backdrop-blur-md', 'border-white/20');
  if (header) {
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
  }

  lastScroll = currentScroll;
});
```

## Детальное объяснение поведения

### Состояние 1: В самом верху (scroll = 0)
- **Внешний вид:** Полностью непрозрачный белый фон
- **Классы:** `bg-white`, `border-gray-200`
- **Видимость:** Полностью видимый

### Состояние 2: Прокрутка вниз
- **Поведение:** Header плавно уезжает вверх и исчезает
- **Классы:** Добавляются `-translate-y-full` (сдвиг вверх на 100% высоты) и `opacity-0`
- **Transition:** `duration-500` обеспечивает плавность (500ms)

### Состояние 3: Прокрутка вверх
- **Поведение:** Header плавно появляется сверху
- **Классы:** Удаляются `-translate-y-full` и `opacity-0`
- **Эффект:** Полупрозрачный фон с размытием

### Состояние 4: Скроллед + полупрозрачность
- **Фон:** `rgba(255, 255, 255, 0.75)` - белый с 75% непрозрачностью
- **Эффект размытия:** `backdrop-blur-md` - размытие фона на 12px
- **Рамка:** `border-white/20` - белая рамка с 20% непрозрачностью
- **ВАЖНО:** Используется **inline style**, НЕ Tailwind класс!

## Глобальные стили (Layout.astro)

```css
/* Поддержка Safari/iOS */
.backdrop-blur-md {
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

/* Анимация пульсации для кнопок */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 10px rgba(255, 107, 0, 0.1);
  }
}

.pulse-cta {
  animation: pulse-glow 2s infinite;
}
```

## Настройка Tailwind

Убедитесь, что transition классы настроены:

```javascript
// tailwind.config.mjs
export default {
  theme: {
    extend: {
      transitionDuration: {
        '500': '500ms',
      },
    },
  },
}
```

## Чеклист для внедрения

- [ ] Header должен иметь `id="main-header"` для доступа из JS
- [ ] Начальные классы: `fixed w-full bg-white transition-all duration-500 ease-in-out`
- [ ] Добавить `-webkit-backdrop-filter` в глобальные стили
- [ ] **НЕ использовать** Tailwind классы для динамической прозрачности
- [ ] **Использовать** inline `backgroundColor` стили
- [ ] **Удалять** конфликтующие классы ПЕРЕД установкой новых
- [ ] Сохранять `lastScroll` для определения направления
- [ ] Тестировать на мобильных устройствах (особенно Safari/iOS)

## Тестирование

### Desktop
1. Прокрутите вниз → header должен исчезнуть
2. Прокрутите вверх → header должен появиться полупрозрачным
3. Прокрутите в самый верх → header должен стать непрозрачным

### Mobile (КРИТИЧНО!)
1. Откройте в Safari на iOS
2. Обновите страницу (F5/Refresh)
3. Слегка прокрутите вниз (10-50px)
4. Header должен быть **полупрозрачным с размытием**, НЕ полностью прозрачным
5. Прокрутите обратно вверх → header должен стать непрозрачным

## Альтернативы и вариации

### Вариант 1: Без скрытия при прокрутке вниз
Удалите эту часть из JS:
```javascript
// Удалить этот блок
if (currentScroll > lastScroll && !header?.classList.contains('-translate-y-full')) {
  header?.classList.add('-translate-y-full', 'opacity-0');
} else if (currentScroll < lastScroll && header?.classList.contains('-translate-y-full')) {
  header?.classList.remove('-translate-y-full', 'opacity-0');
}
```

### Вариант 2: Другая степень прозрачности
```javascript
// Измените значение alpha (последнее число)
header.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // Менее прозрачный
header.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; // Более прозрачный
```

### Вариант 3: Другой цвет фона
```javascript
// Темный header
header.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
// Или с цветом
header.style.backgroundColor = 'rgba(232, 93, 0, 0.75)'; // Оранжевый
```

## Производительность

- `scroll` event может вызываться часто - текущая реализация оптимизирована
- Используется проверка наличия классов перед их добавлением/удалением
- Transition GPU-ускоренные (`transform`, `opacity`)
- `backdrop-filter` может быть требовательным - используйте умеренно

## Поддержка браузеров

- ✅ Chrome/Edge - полная поддержка
- ✅ Firefox - полная поддержка
- ✅ Safari/iOS - требует `-webkit-backdrop-filter`
- ⚠️ IE11 - не поддерживается (backdrop-filter)

---

**Последнее обновление:** 26 ноября 2025
**Протестировано на:** Chrome 119, Firefox 120, Safari 17 (iOS 17)
