# it.rocks sandbox

TypeScript business application development framework.

This project is a monolithic sandbox for all experiments on features waiting to be released into
[itrocks-js](https://github.com/itrocks-js) and [itrocks-ts](https://github.com/itrocks-ts) packages.

You may use it to play, not for production.

## Pre-requisites

You need a Debian/Ubuntu/Mint/etc. Linux operating system.

This may work on Windows too, but this documentation will not tell you everything about how.

You need node v21+, npm, mysql, installed.

## Install

To install:
```bash
mkdir ~/itrocks
cd ~/itrocks
git clone https://github.com/itrocks/sandbox
cd sandbox
npm i
```

## Database

- You need a mysql server and a database for your app:

```sql
CREATE DATABASE ts DEFAULT CHARSET=utf8mb3;
CREATE USER common@localhost IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON ts.* TO common@localhost;
FLUSH PRIVILEGES;
CREATE TABLE ts.user (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  active INT NOT NULL DEFAULT 0,
  email VARCHAR(255) NOT NULL DEFAULT '',
  login VARCHAR(255) NOT NULL DEFAULT '',
  password VARCHAR(255) NOT NULL DEFAULT '',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
INSERT INTO ts.user SET id = 1, active = 1, email = 'happy@email.com', login = 'happy', password = 'xxxx';
INSERT INTO ts.user SET id = 2, active = 0, email = 'friend@email.com', login = 'friend', password = 'xxxx'; 
```

## Configuration

- Create a directory named `local`, into your project root directory.
- Create a file named `local/dao.ts`:
```ts
export default
{
  database: 'ts',
  engine:   'mysql',
  host:     'localhost',
  password: 'password',
  user:     'common'
}
```

## Develop

Install all development dependencies:
```bash
npm i
```

### Commands from the terminal

"Watch mode" restarts automatically the process once any file changes.
You will need both build:watch and start:watch running to have a full watch running environment.

To build in watch mode:
```bash
npm run build:watch
```

To run in watch mode:
```bash
npm run start:watch
```

Tu run tests:
```bash
npm run test
```

### Visual Studio Code integration

If you use Visual Studio Code, you do not need to use those npm run:

The *.vscode/tasks.json* file contains tasks that will automatically start when you open the project.
One console displays the **build** terminal, the other one the **start**.

The *.vscode/launch.json* file contains the configuration to run tests.

It runs in debug mode, so you just have to play with it.

Shortcuts:
- Ctrl+Maj+B shows the Build terminal
- Ctrl+Maj+T opens the Test pane, so you can click on *play* to run/debug tests

### WebStorm integration

If you use WebStorm, you do not need to use those npm run:

- check *Settings > TypeScript > Recompile on changes* to automatically build changed .ts files,
- create a *run/debug configuration* named *watch* with:
  - node parameters: *node_modules/.bin/nodemon*
  - javascript file: *app/main.js*

You can run tests with a right-click+run on the *jest.config.js* file
You can run/debug/test your app using the run panel and the *play* button.

### Run for production

This sandbox project is not really packaged for production use.

You will need to build it before you can run it without its development dependencies.

Build, test, then remove useless dependencies:
```bash
npm i
npm run build
npm run test
rm -rf node_modules
npm i --omit=dev
```

To run the sandbox application:
```bash
npm start
```

This is the theory, but it may not work and throw "Cannot find module" errors...
If so: sorry, you have to keep the devDependencies here, don't ask my why: I don't know:

```bash
npm i
npm start
```

## Playing with the sandbox app

Features available for the user can be accessed from your local browser. Follow these links:

To test outputs:

- http://localhost:3000/user/list
- http://localhost:3000/user/list/json
- http://localhost:3000/user/new
- http://localhost:3000/user/1
- http://localhost:3000/user/1/edit
- http://localhost:3000/user/1,2/json

To test changes:

- http://localhost:3000/user/save
- http://localhost:3000/user/1/save/json
- http://localhost:3000/user/1,2/delete

You can remove the save/delete action if you set the HTTP method to DELETE / PATCH / POST / PUT.

### Route errors

- http://localhost:3000/: Action is missing
- http://localhost:3000/nothing/done: Action done not found
- http://localhost:3000/nothing/output: Module nothing not found
- http://localhost:3000/user/edit: Action edit needs an object
- http://localhost:3000/user/output: Action output needs an object
- http://localhost:3000/user/1/output/bad: Action output unavailable in format bad

### Route rules

A route contains:
- /a/path/to/your/business/module: this may be full path or end of path,
- numeric identifiers when needed, alone or multiple, separated by commas,
- an action, matching any action module stored into the app/action/builtIn/ project folder;
  default may be calculated if no action given using the HTTP method used by the caller,
- a response format: e.g. csv, json. Format names are reserved words that should not be used for modules or actions;
  if no response format is asked, the first valid format in HTTP header Accept is taken; default will be html.

Default action calculation:
- HTTP method DELETE => delete
- HTTP method PATCH, POST, PUT => save
- HTTP method GET: identifier(s) => output; no identifier => list

## Playing with front components

The sandbox embeds front components too.

### WebStorm

You can open any html file into *front/demo*, then click on your browser icon to open it
into your browser. JavaScript files are accessed from the WebStorm embedded web server, you don't need any additional
local web server.

Look at your browser console: demos give you information about what they do.

### Visual Studio Code

I don't know... I suggest you use a local web server as apache (see below)

### Apache local web server

Install apache and configure access to your local computer ~ path:

```bash
apt install apache2 libapache2-mpm-itk
```

libapache2-mpm-itk allow you to set a user group and id for your localhost access, in order to access files easily.

Here is a */etc/apache2/sites-enabled/localhost.conf* configuration file example that work for me (please adapt):
```apacheconf
<VirtualHost *:80>
  ServerName localhost
  ServerAdmin webmaster@pillot.fr
  AssignUserId baptiste baptiste
  
  DocumentRoot /home/baptiste
  <Directory /home/baptiste>
    AllowOverride All
    Options Indexes FollowSymLinks MultiViews
    Require all granted
  </Directory>
  
  CustomLog /var/log/apache2/localhost.log combined
  ErrorLog /var/log/apache2/localhost.err
  LogLevel warn
</VirtualHost>
```

Don't forget to restart apache when it's ready:
```bash
service apache2 restart
```

It is strongly recommended to limit accesses to your local computer using a ~/.htaccess file containing:
```apacheconf
Order deny,allow
Deny From All
Allow From 127.0.0.1
```

Then, you may play with these front scripts. Example:
- http://localhost/itrocks/sandbox/front/demo/build.html
- http://localhost/itrocks/sandbox/front/demo/form-fetch.html
- http://localhost/itrocks/sandbox/front/demo/table.html
- http://localhost/itrocks/sandbox/front/demo/xtarget.html

Look at your browser console: some of these demos may give you information about what they do.
