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
		const mariaDbConfig = Object.assign(this.config as mariadb.ConnectionConfig, {
			allowPublicKeyRetrieval: true,
			dateStrings: false
		})
		return this.connection = await mariadb.createConnection(mariaDbConfig)
	}

	async delete<T extends Object>(object: T & Entity, property = 'id')
	{
		const connection = this.connection ?? await this.connect()

		if (DEBUG) console.log('DELETE FROM `' + storeOf(object) + '` WHERE ' + property + ' = ?', [object[property]])
		await connection.query(
			'DELETE FROM `' + storeOf(object) + '` WHERE ' + property + ' = ?',
			[object[property]]
		)
		delete (object as any).id

		return object as T
	}

	async insert<T extends object>(object: T)
	{
		const connection = this.connection ?? await this.connect()

		const sql    = this.propertiesToSql(object)
		const values = this.valuesToDb(object)
		const query  = 'INSERT INTO `' + storeOf(object) + '` SET '  + sql
		if (DEBUG) console.log(query, values)
		const result = await connection.query(query, values);
		(object as Entity).id = result.insertId

		return object as T & Entity
	}

	propertiesToSearchSql(search: Object)
	{
		const sql = Object.entries(search)
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
		return sql.length
			? ' WHERE ' + sql
			: ''
	}

	propertiesToSql(object: object)
	{
		return Object.keys(object).map(name => '`' + name + '` = ?').join(', ')
	}

	async read<T extends object>(type: Type<T>, id: Identifier)
	{
		const connection = this.connection ?? await this.connect()

		if (DEBUG) console.log('SELECT * FROM `' + storeOf(type) + '` WHERE id = ?', [id])
		const rows: (T & Entity)[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '` WHERE id = ?',
			[id]
		)

		return this.valuesFromDb(rows[0], type)
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

		const sql    = this.propertiesToSearchSql(search)
		const values = this.valuesToDb(search, type)
		if (DEBUG) console.log('SELECT * FROM `' + storeOf(type) + '`' + sql, values)
		const rows: (T & Entity)[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '`' + sql,
			values
		)

		return rows.map(row => this.valuesFromDb(row, type))
	}

	async update<T extends object & Entity>(object: T)
	{
		const connection = this.connection ?? await this.connect()

		const id        = object.id
		const valObject = object as T
		delete (valObject as any).id
		const sql    = this.propertiesToSql(valObject)
		const values = this.valuesToDb(valObject)
		const query  = 'UPDATE `' + storeOf(object) + '` SET '  + sql + ' WHERE id = ?'
		if (DEBUG) console.log(query, values)
		await connection.query(query, values.concat([id]))
		object.id = id

		return object
	}

	valuesFromDb<T extends Object>(row: T & Entity, type: Type<T>)
	{
		const object = new type
		for (const property of Object.keys(row)) {
			object[property as keyof T] = applyFilter(row[property], object, property, SQL, READ)
		}
		return object as T & Entity
	}

	valuesToDb(object: object, type?: Type)
	{
		const properties = Object.keys(object)
		const typeObject = type ? new type : object
		const values     = Object.values(object)
		for (let n = 0; n < properties.length; n ++) {
			const value = applyFilter(values[n], typeObject, properties[n], SQL, SAVE)
			values[n] = ((typeof value === 'object') && (value as Entity).id) ? (value as Entity).id : value
		}
		return values
	}

}
