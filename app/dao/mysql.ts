import { createConnection, Connection } from 'mariadb'
import { Dao }                          from './dao'
import { storeOf }                      from './store'

export default class Mysql implements Dao
{

	connection?: Connection

	constructor(config: { host: string, user: string, password: string, database: string })
	{
		createConnection(config).then(connection => this.connection = connection)
	}

	async read<T extends object>(type: new() => T, id: bigint|string): Promise<T>
	{
		if (!this.connection) {
			throw 'Not connected'
		}
		const rows: object[] = await this.connection.query(
			'SELECT * FROM `' + storeOf(type) + '` WHERE id = ?',
			[id]
		)
		return Object.assign(new type, rows[0])
	}

	async search<T extends object>(type: new() => T, search: object = {}): Promise<T[]>
	{
		if (!this.connection) {
			throw 'Not connected'
		}
		let sql = Object.keys(search).map(name => '`' + name + '` = ?').join(', ')
		let searchValues = Object.values(search)
		if (sql.length) {
			sql = ' WHERE ' + sql
		}
		const rows: object[] = await this.connection.query(
			'SELECT * FROM `' + storeOf(type) + '`' + sql,
			searchValues
		)
		return rows.map(row => Object.assign(new type, row))
	}

}
