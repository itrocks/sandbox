import mariadb                              from 'mariadb'
import ReflectClass                         from '../class/reflect'
import { AnyObject, KeyOf, Type }           from '../class/type'
import { componentOf }                      from '../orm/component'
import { PROTECT_GET }                      from '../orm/orm'
import { PropertyDescriptorWithProtectGet } from '../orm/orm'
import { applyFilter, IGNORE }              from '../property/filter/filter'
import { READ, SAVE, SQL }                  from '../property/filter/filter'
import ReflectProperty                      from '../property/reflect'
import { CollectionType }                   from '../property/type'
import { Dao, HasEntity, MayEntity }        from './dao'
import { Identifier, SearchType }           from './dao'
import Function                             from './functions'
import { storeOf }                          from './store'

const DEBUG = true

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

	async delete<T extends object>(object: HasEntity<T>, property: KeyOf<HasEntity<T>> = 'id')
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

		const values = await this.valuesToDb(object)
		const sql    = this.propertiesToSql(values)
		const query  = 'INSERT INTO `' + storeOf(object) + '` SET '  + sql
		if (DEBUG) console.log(query, JSON.stringify(Object.values(values)))
		const result = await connection.query(query, Object.values(values))

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
		const rows: HasEntity<T>[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '` WHERE id = ?',
			[id]
		)

		return this.valuesFromDb(rows[0], type)
	}

	async readCollection<T extends object, PT extends object>(
		object:   HasEntity<T>,
		property: KeyOf<T>,
		type = (new ReflectProperty(object, property).type as CollectionType).elementType as Type<PT>
	) {
		const connection  = this.connection ?? await this.connect()
		const objectTable = storeOf(object)
		const table       = storeOf(type)
		let query: string
		if (componentOf(object, property)) {
			query = 'SELECT * FROM `' + table + '` WHERE ' + objectTable + '_id = ?'
		}
		else {
			const joinTable = [objectTable, table].sort().join('_')
			query = 'SELECT `' + table + '`.* FROM `' + table + '`'
				+ ' INNER JOIN `' + joinTable + '` ON `' + joinTable + '`.' + table + '_id = `' + table + '`.id'
				+ ' WHERE `' + joinTable + '`.' + objectTable + '_id = ?'
		}
		const rows: HasEntity<PT>[] = await connection.query(query, [object.id])
		return await Promise.all(rows.map(async row => this.valuesFromDb(row, type)))
	}

	async save<T extends object>(object: MayEntity<T>)
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
		const values = await this.valuesToDb(searchValues)
		if (DEBUG) console.log('SELECT * FROM `' + storeOf(type) + '`' + sql, '[', values, ']')
		const rows: HasEntity<T>[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '`' + sql,
			values
		)

		return await Promise.all(rows.map(async row => this.valuesFromDb(row, type)))
	}

	async update<T extends object>(object: HasEntity<T>)
	{
		const connection = this.connection ?? await this.connect()

		const id           = object.id
		const disconnected = this.disconnectObject(object)
		const values       = await this.valuesToDb(disconnected)
		const sql          = this.propertiesToSql(values)
		const query        = 'UPDATE `' + storeOf(object) + '` SET '  + sql + ' WHERE id = ?'
		if (DEBUG) console.log(query, JSON.stringify(Object.values(values).concat([id])))
		await connection.query(query, Object.values(values).concat([id]))

		return this.connectObject(disconnected, id)
	}

	async valuesFromDb<T extends object>(row: HasEntity<T>, type: Type<T>)
	{
		const object = (new type) as HasEntity<T>
		let property: KeyOf<HasEntity<T>>
		for (property in row) {
			const value = await applyFilter(row[property], object, property, SQL, READ, row)
			if (value === IGNORE) continue
			object[property] = value
		}
		return object
	}

	async valuesToDb<T extends object>(object: T)
	{
		const values: AnyObject = {}
		for (const property of new ReflectClass(object).propertyNames) {
			const descriptor = Object.getOwnPropertyDescriptor(object, property) as PropertyDescriptorWithProtectGet
			let value        = descriptor?.[PROTECT_GET] ? undefined : object[property]
			value            = await applyFilter(value, object, property, SQL, SAVE, values)
			if (value === IGNORE) continue
			values[property] = value
		}
		return values
	}

}
