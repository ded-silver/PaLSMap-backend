# MOPS Backend

Backend приложение для системы управления картой объектов и путей (MOPS / PaLSMap).

## Технологии

NestJS, Prisma, PostgreSQL, JWT, TypeScript

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Настройка .env
DATABASE_URL="postgresql://user:password@localhost:5432/mops_db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
PORT=4201

# Миграции и генерация Prisma клиента
npx prisma migrate dev
npx prisma generate

# Запуск
npm run start:dev
```

## Роли пользователей

- **user** - просмотр карт
- **admin** - редактирование, история
- **superAdmin** - управление пользователями

## Основные модули

- `/auth` - аутентификация
- `/user` - профиль пользователя
- `/node` - ноды на карте
- `/edge` - связи между нодами
- `/node-history` - история изменений (только для админов)
- `/dictionary` - словарь терминов
- `/country`, `/path-area` - страны и области путей
- `/admin` - управление пользователями (только для superAdmin)

## Скрипты

```bash
npm run start:dev      # Разработка
npm run build          # Сборка
npm run start:prod     # Production
npm run prisma:studio  # GUI для БД
npm run seed:perf-nodes # Тестовые данные
```

