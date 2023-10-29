# Скрипт для пуша случайных коммитов 
## Технические требования
- NodeJS
## Установка, настройка и запуск
1. скачиваем репозиторий ```git clone git@github.com:ResidentTGT/github_pusher.git```
2. переходим в папку проекта и устанавливаем зависимости ```npm i```
3. в файл tokens.txt добавляем токены аккаунтов на гитхабе. создать токен можно [тут](https://github.com/settings/tokens/new) . ставим галочки напротив **repo** и **user**
4. в файл proxies.txt добавляем прокси для покдлючения к гитхабу. формат указан в файле. кол-во прокси должно совпадать с кол-вом токенов.
5. в файле src/index.ts можно настроить, сколько дней скрипт будет пушить коммиты (по умолчанию 30), задержку между днями (по умолчанию ровно 1 день) и задержку между аккаунтами внутри одного дня (по умолчанию 1 минута)
6. запускаем скрипт командой ```npm run start```
## Доп. инфо
- если гитхаб совсем пустой, то скрипт создает сначала репозиторий, а потом пушит в него, т.е. скрипт можно запускать без создания каких-либо репозиториев
- если репозитории в гитхабе есть, то скрипт берет первый
- коммит идет со случайным сообщением. в коммите пуш файла со случайным названием, случайным содержанием и расширением. в логах все видно
- есть сохранение состояния выполнения скрипта. в папке states для каждого аккаунта создается json файл, в котором цифра означает кол-во удачных коммитов (по умолчанию это совпадает с днями)
