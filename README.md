# it.rocks sandbox

TypeScript business application development framework

## Pre-requisites

You need a debian/Ubuntu/Mint/etc. Linux operating system.

```bash
curl -fsSL https://bun.sh/install | bash
sudo apt install mysql
```

## Install

To install:

```bash
git clone git@crafter.fr:itrocks/sandbox
cd sandbox
bun install
```

## Database

- You need a mysql server and a database for your app:

```sql
CREATE database ts ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
CREATE USER common@localhost IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON ts.* TO common@localhost;
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

- Create a folder named `local`
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

## Run

To run:

```bash
bun run app/main.ts
```

## Access

To test outputs:

- http://localhost:3000/user/add
- http://localhost:3000/user/edit/1
- http://localhost:3000/user/json/1
- http://localhost:3000/user/list
- http://localhost:3000/user/output/1

To tests changes:

- http://localhost:3000/user/save/1
- http://localhost:3000/user/delete/1/2

## Route errors

- http://localhost:3000/nothing: Action is missing
- http://localhost:3000/nothing/done: Action done not found
- http://localhost:3000/nothing/output: Module nothing not found
- http://localhost:3000/user/edit: Action edit needs an object
- http://localhost:3000/user/output: Action output needs an object
