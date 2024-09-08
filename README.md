# Logic Gates Lab

Цей проєкт створено з використанням [Vite](https://vitejs.dev/) та [React](https://reactjs.org/). Це мінімальне налаштування для початку роботи з React у Vite з підтримкою Hot Module Replacement (HMR) та базовими правилами ESLint.

## Використовувані технології

- [Vite](https://vitejs.dev/) – швидкий frontend-білдер.
- [React](https://reactjs.org/) – JavaScript бібліотека для створення UI.
- [ESLint](https://eslint.org/) – лінтер для коду.
- [Babel](https://babeljs.io/) або [SWC](https://swc.rs/) для Fast Refresh.

## Плагіни

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) – використовує Babel для Fast Refresh.
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) – використовує SWC для Fast Refresh.

## Як запустити проєкт

### Кроки для запуску

1. Клонувати репозиторій:
    ```bash
    git clone https://github.com/DenysOlkhovykNure/logic-gates-lab.git
    ```

2. Перейти в директорію проєкту:
    ```bash
    cd logic-gates-lab
    ```

3. Встановити залежності:
    ```bash
    npm install
    ```

4. Запустити локальний сервер розробки:
    ```bash
    npm run dev
    ```

5. Відкрити браузер і перейти за адресою:
    ```
    http://localhost:3000
    ```

## Команди

- `npm run dev` – запуск локального сервера розробки.
- `npm run build` – білд проєкту для продакшну.
- `npm run preview` – попередній перегляд білду.
- `npm run lint` – запуск ESLint для перевірки коду.

## Вибір плагіна для Fast Refresh

- Для використання Babel, проєкт вже налаштований з плагіном `@vitejs/plugin-react`. Це рекомендується, якщо ти звик працювати з Babel.
- Якщо хочеш використовувати [SWC](https://swc.rs/) для більш швидкої компіляції, можеш замінити плагін `@vitejs/plugin-react` на `@vitejs/plugin-react-swc` в конфігураційному файлі Vite (`vite.config.js`):

    ```js
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react-swc'; // Заміни @vitejs/plugin-react на @vitejs/plugin-react-swc

    export default defineConfig({
      plugins: [react()],
    });
    ```

## Вимоги

- Node.js v14 або вище
- npm або yarn

## Ліцензія

Цей проєкт ліцензовано під [MIT ліцензією](https://opensource.org/licenses/MIT).
