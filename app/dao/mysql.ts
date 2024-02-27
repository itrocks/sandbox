import { Connection, ConnectionConfig, createConnection } from 'mariadb'
import { Dao }                                            from './dao'
import { storeOf }                                        from './store'

export default class Mysql implements Dao
{

	connection?: Connection

	constructor(protected config: { host: string, user: string, password: string, database: string })
	{}

	async connect()
	{
		const mariaDbConfig = this.config as ConnectionConfig
		mariaDbConfig.allowPublicKeyRetrieval = true
		return createConnection(mariaDbConfig).then(connection => this.connection = connection)
	}

	async read<T extends object>(type: new() => T, id: bigint | string): Promise<T>
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		const rows: object[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '` WHERE id = ?',
			[id]
		)

		return Object.assign(new type, rows[0])
	}

	async search<T extends object>(type: new() => T, search: object = {}): Promise<T[]>
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		let sql = Object.keys(search).map(name => '`' + name + '` = ?').join(', ')
		let searchValues = Object.values(search)
		if (sql.length) {
			sql = ' WHERE ' + sql
		}
		const rows: object[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '`' + sql,
			searchValues
		)

		return rows.map(row => Object.assign(new type, row))
	}

}
