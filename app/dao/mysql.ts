import mariadb          from 'mariadb'
import { Object, Type } from '../class/type'
import { applyFilter }  from '../property/filter/filter'
import { READ, SAVE }   from '../property/filter/filter'
import { SQL }          from '../property/filter/filter'
import { Dao, Entity }  from './dao'
import { Identifier }   from './dao'
import Function         from './functions'
import { storeOf }      from './store'

const DEBUG = false

export default class Mysql implements Dao
{

	connection?: mariadb.Connection

	constructor(public config: { host: string, user: string, password: string, database: string })
	{}

	async connect()
	{
		const mariaDbConfig = this.config as mariadb.ConnectionConfig
		mariaDbConfig.allowPublicKeyRetrieval = true
		return this.connection = await mariadb.createConnection(mariaDbConfig)
	}

	async delete<T extends Object>(object: T & Entity, property = 'id'): Promise<T>
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

	async insert<T extends object>(object: T)
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		const { sql, values } = this.valuesToDb(object)
		const query  = 'INSERT INTO `' + storeOf(object) + '` SET '  + sql
		if (DEBUG) console.log(query, values)
		const result = await connection.query(query, values);
		(object as Entity).id = result.insertId

		return object as T & Entity
	}

	async read<T extends object>(type: Type<T>, id: Identifier)
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		if (DEBUG) console.log('SELECT * FROM `' + storeOf(type) + '` WHERE id = ?', [id])
		const rows: (T & Entity)[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '` WHERE id = ?',
			[id]
		)

		return this.valuesFromDb(Object.assign(new type, rows[0])) as (T & Entity)
	}

	async save<T extends object>(object: T | (T & Entity))
	{
		return (('id' in object) && object.id)
			? this.update(object)
			: this.insert(object)
	}

	async search<T extends object>(type: Type<T>, search: Object = {})
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
		let searchValues = this.valuesToDb(search, type).values
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

	async update<T extends object>(object: T & Entity)
	{
		const connection = this.connection ?? await this.connect()
		if (!connection) throw 'Not connected'

		const id        = object.id
		const valObject = object as T
		delete (valObject as any).id
		const { sql, values } = this.valuesToDb(valObject)
		const query  = 'UPDATE `' + storeOf(object) + '` SET '  + sql + ' WHERE id = ?'
		if (DEBUG) console.log(query, values)
		await connection.query(query, values.concat([id]))
		object.id = id

		return object
	}

	valuesFromDb<T extends Object>(object: T & Entity): T & Entity
	{
		for (const [property, value] of Object.entries(object)) {
			object[property as keyof T] = applyFilter(value, object, property, SQL, READ)
		}
		return object
	}

	valuesToDb(object: object, type?: object | Type)
	{
		if (!type) {
			type = object
		}
		const properties = Object.keys(object)
		const sql        = properties.map(name => '`' + name + '` = ?').join(', ')
		const values     = Object.values(object)
		for (let n = 0; n < properties.length; n ++) {
			const value = applyFilter(values[n], type, properties[n], SQL, SAVE)
			values[n] = ((typeof value === 'object') && (value as Entity).id) ? (value as Entity).id : value
		}
		return { sql, values }
	}

}
