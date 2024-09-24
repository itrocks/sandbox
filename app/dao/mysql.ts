import { Connection, ConnectionConfig, createConnection } from 'mariadb'
import { Dao, Entity }                                    from './dao'
import Function                                           from './functions'
import { storeOf }                                        from './store'

const DEBUG = false

export default class Mysql implements Dao
{

	connection?: Connection

	constructor(public config: { host: string, user: string, password: string, database: string })
	{}

	async connect()
	{
		const mariaDbConfig = this.config as ConnectionConfig
		mariaDbConfig.allowPublicKeyRetrieval = true
		return createConnection(mariaDbConfig).then(connection => this.connection = connection)
	}

	async delete<T extends { [index: string]: any }>(object: T & Entity, property = 'id'): Promise<T>
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		if (DEBUG) console.log('DELETE FROM `' + storeOf(object) + '` WHERE ' + property + ' = ?', [object[property]])
		await connection.query(
			'DELETE FROM `' + storeOf(object) + '` WHERE ' + property + ' = ?',
			[object[property]]
		)
		delete (object as any).id

		return object
	}

	async read<T extends object>(type: new() => T, id: bigint | string)
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		if (DEBUG) console.log('SELECT * FROM `' + storeOf(type) + '` WHERE id = ?', [id])
		const rows: (T & Entity)[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '` WHERE id = ?',
			[id]
		)

		return Object.assign(new type, rows[0])
	}

	async update<T extends object>(object: T & Entity)
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		const id        = object.id
		const valObject = object as T
		delete (valObject as any).id
		const sql    = Object.keys(valObject).map(name => '`' + name + '` = ?').join(', ')
		const values = Object.values(valObject).map(this.valueToDb).concat([id])
		const query  = 'UPDATE `' + storeOf(object) + '` SET '  + sql + ' WHERE id = ?'
		if (DEBUG) console.log(query, values)
		await connection.query(query, values)
		object.id = id

		return object
	}

	async insert<T extends object>(object: T)
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		const sql    = Object.keys(object).map(name => '`' + name + '` = ?').join(', ')
		const values = Object.values(object).map(this.valueToDb)
		const query  = 'INSERT INTO `' + storeOf(object) + '` SET '  + sql
		if (DEBUG) console.log(query, values)
		const result = await connection.query(query, values);
		(object as Entity).id = result.insertId

		return object as T & Entity
	}

	async save<T extends object>(object: T | (T & Entity))
	{
		return (('id' in object) && object.id)
			? this.update(object)
			: this.insert(object)
	}

	async search<T extends object>(type: new() => T, search: { [index: string]: any } = {})
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		let sql = Object
			.entries(search)
			.map(([name, value]) => {
				let sql: string
				if (value instanceof Function) {
					search[name] = value.value
					sql          = value.sql
				}
				else {
					sql = ' = ?'
				}
				return '`' + name + '`' + sql
			})
			.join(' AND ')
		let searchValues = Object.values(search).map(this.valueToDb)
		if (sql.length) {
			sql = ' WHERE ' + sql
		}
		if (DEBUG) console.log('SELECT * FROM `' + storeOf(type) + '`' + sql, searchValues)
		const rows: (T & Entity)[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '`' + sql,
			searchValues
		)

		return rows.map(row => Object.assign(new type, row))
	}

	valueToDb(value: any): any
	{
		if (typeof value === 'object') {
			if (value instanceof Date) {
				return value.toISOString().replace('T', ' ').substring(0, 19)
			}
			return value.id ?? value.toString()
		}
		return value
	}

}
