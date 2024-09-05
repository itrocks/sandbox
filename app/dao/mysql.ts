import { Connection, ConnectionConfig, createConnection } from 'mariadb'
import { Dao, Entity }                                    from './dao'
import { storeOf }                                        from './store'

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

	async delete<T extends object>(object: T & Entity): Promise<T>
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		await connection.query(
			'DELETE FROM `' + storeOf(object) + '` WHERE id = ?',
			[object.id]
		)
		delete (object as any).id

		return object
	}

	async read<T extends object>(type: new() => T, id: bigint | string)
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

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
		const values = Object.values(valObject).concat([id])
		const query  = 'UPDATE `' + storeOf(object) + '` SET '  + sql + ' WHERE id = ?'
		await connection.query(query, values)
		object.id = id

		return object
	}

	async insert<T extends object>(object: T)
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		const sql    = Object.keys(object).map(name => '`' + name + '` = ?').join(', ')
		const values = Object.values(object)
		const query  = 'INSERT INTO `' + storeOf(object) + '` SET '  + sql
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

	async search<T extends object>(type: new() => T, search: object = {})
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		let sql          = Object.keys(search).map(name => '`' + name + '` = ?').join(', ')
		let searchValues = Object.values(search)
		if (sql.length) {
			sql = ' WHERE ' + sql
		}
		const rows: (T & Entity)[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '`' + sql,
			searchValues
		)

		return rows.map(row => Object.assign(new type, row))
	}

}
