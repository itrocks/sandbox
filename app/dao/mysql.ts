import { Dao } from './dao'
import mysql from 'mysql2/promise'
import { storeOf } from './store'
import { Connection, RowDataPacket } from 'mysql2/promise'

class Mysql implements Dao
{

	connection: Connection|undefined

	constructor(config: { host:string, user: string, password: string, database: string })
	{
		mysql.createConnection(config).then(connection => this.connection = connection)
	}

	read<T extends object>(type: new()=>T, id: number): Promise<T>
	{
		return this.connection
			? this.connection.execute('SELECT * FROM `' + storeOf(type) + '` WHERE id = ?', [id])
				// @ts-ignore execute('SELECT') always sends RowDataPacket[][]
				.then((data: RowDataPacket[][]) => Object.assign(new type(), data[0][0] ?? {}))
			: Promise.reject('not connected')
	}

	search<T extends object>(type: new()=>T, search: object = {}): Promise<T[]>
	{
		let sql    = Object.keys(search).map(name => '`' + name + '` = ?').join(', ')
		let values = Object.values(search)
		if (sql.length) {
			sql = ' WHERE ' + sql
		}
		return this.connection
			? this.connection.execute('SELECT * FROM `' + storeOf(type) + '`' + sql, values)
				// @ts-ignore execute('SELECT') always sends RowDataPacket[][]
				.then((data: RowDataPacket[][]) => data[0].map(data => Object.assign(new type(), data)))
			: Promise.reject('not connected')
	}

}

export default Mysql
