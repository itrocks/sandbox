import mariadb                    from 'mariadb'
import { AnyObject, KeyOf, Type } from '../class/type'
import { applyFilter, UNCHANGED } from '../property/filter/filter'
import { READ, SAVE, SQL }        from '../property/filter/filter'
import { Dao, Entity }            from './dao'
import { Identifier, SearchType } from './dao'
import Function                   from './functions'
import { storeOf }                from './store'

const DEBUG = false

export default class Mysql extends Dao
{

	connection?: mariadb.Connection

	constructor(public config: { host: string, user: string, password: string, database: string })
	{
		super()
	}

	async connect()
	{
		const mariaDbConfig = Object.assign(this.config, {
			allowPublicKeyRetrieval: true,
			dateStrings: false
		})
		return this.connection = await mariadb.createConnection(mariaDbConfig)
	}

	async delete<T extends object>(object: T & Entity, property: KeyOf<T & Entity> = 'id')
	{
		const connection = this.connection ?? await this.connect()

		if (DEBUG) console.log('DELETE FROM `' + storeOf(object) + '` WHERE ' + property + ' = ?', [object[property]])
		await connection.query(
			'DELETE FROM `' + storeOf(object) + '` WHERE ' + property + ' = ?',
			[object[property]]
		)

		return this.disconnectObject(object)
	}

	async insert<T extends object>(object: T)
	{
		const connection = this.connection ?? await this.connect()

		const values = this.valuesToDb(object)
		const sql    = this.propertiesToSql(object)
		const query  = 'INSERT INTO `' + storeOf(object) + '` SET '  + sql
		if (DEBUG) console.log(query, values)
		const result = await connection.query(query, values);

		return this.connectObject(object, result.insertId)
	}

	propertiesToSearchSql(search: AnyObject)
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
		return this.isObjectConnected(object)
			? this.update(object)
			: this.insert(object)
	}

	async search<T extends object>(type: Type<T>, search: SearchType<T> = {})
	{
		const connection = this.connection ?? await this.connect()

		const searchValues = Object.values(search).filter(value => value instanceof Function)
			? Object.assign({}, search)
			: search
			const sql    = this.propertiesToSearchSql(searchValues)
			const values = this.valuesToDb(searchValues, type)
		if (DEBUG) console.log('SELECT * FROM `' + storeOf(type) + '`' + sql, values)
		const rows: (T & Entity)[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '`' + sql,
			values
		)

		return await Promise.all(rows.map(async row => this.valuesFromDb(row, type)))
	}

	async update<T extends (object & Entity)>(object: T)
	{
		const connection = this.connection ?? await this.connect()

		const id     = object.id
		object       = this.disconnectObject(object)
		const values = await this.valuesToDb(object)
		const sql    = this.propertiesToSql(object)
		const query  = 'UPDATE `' + storeOf(object) + '` SET '  + sql + ' WHERE id = ?'
		if (DEBUG) console.log(query, JSON.stringify(values))
		await connection.query(query, values.concat([id]))

		return this.connectObject(object, id)
	}

	async valuesFromDb<T extends object>(row: T & Entity, type: Type<T>)
	{
		const object = (new type) as T & Entity
		let property: KeyOf<T & Entity>
		for (property in row) {
			const value = await applyFilter(row[property], object, property, SQL, READ, this)
			if (value === UNCHANGED) continue
			object[property] = value
		}
		return object
	}

	async valuesToDb<T extends object>(object: T, type?: Type<T>)
	{
		const typeObject = type ? new type : object
		const values     = []
		for (const property of Object.keys(object) as KeyOf<T>[]) {
			const value = await applyFilter(object[property], typeObject, property, SQL, SAVE, this)
			if (value === UNCHANGED) continue
			values.push(value)
		}
		return values
	}

}
