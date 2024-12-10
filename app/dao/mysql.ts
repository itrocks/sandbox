import mariadb                       from 'mariadb'
import ReflectClass                  from '../class/reflect'
import { AnyObject, isAnyFunction }  from '../class/type'
import { KeyOf, ObjectOrType, Type } from '../class/type'
import { componentOf }               from '../orm/component'
import { PROTECT_GET }               from '../orm/orm'
import { applyFilter, IGNORE }       from '../property/filter/filter'
import { READ, SAVE, SQL }           from '../property/filter/filter'
import { ReflectProperty }           from '../property/reflect'
import { CollectionType }            from '../property/type'
import { Dao, HasEntity, MayEntity } from './dao'
import { Identifier, SearchType }    from './dao'
import DaoFunction                   from './functions'
import { storeOf }                   from './store'

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

	async delete<T extends object>(object: HasEntity<T>, property: KeyOf<HasEntity<T>> = 'id')
	{
		await this.deleteId(object, object[property], property)
		return this.disconnectObject(object)
	}

	async deleteId<T extends object>(type: ObjectOrType<T>, id: any, property: KeyOf<HasEntity<T>> = 'id')
	{
		const connection = this.connection ?? await this.connect()
		if (DEBUG) console.log('DELETE FROM `' + storeOf(type) + '` WHERE ' + property + ' = ?', [id])
		await connection.query('DELETE FROM `' + storeOf(type) + '` WHERE ' + property + ' = ?', [id])
	}

	async deleteLink<T extends HasEntity>(object: T, property: KeyOf<T>, id: Identifier)
	{
		const connection = this.connection ?? await this.connect()

		const objectTable   = storeOf(object)
		const propertyTable = storeOf((new ReflectProperty(object, property).type as CollectionType).elementType as Type)
		const joinTable     = [objectTable, propertyTable].sort().join('_')

		const query  = 'DELETE FROM `' + joinTable + '` WHERE ' + objectTable + '_id = ? AND ' + propertyTable + '_id = ?'
		const values = [object.id, id]
		if (DEBUG) console.log(query, JSON.stringify(values))
		connection.query(query, values)
	}

	async insert<T extends object>(object: T)
	{
		const connection = this.connection ?? await this.connect()

		const [values, deferred] = await this.valuesToDb(object)
		const sql   = this.propertiesToSql(values)
		const query = 'INSERT INTO `' + storeOf(object) + '` SET '  + sql
		if (DEBUG) console.log(query, JSON.stringify(Object.values(values)))
		const result = await connection.query(query, Object.values(values))
		const id     = result.insertId
		const entity = this.connectObject(
			object,
			((id >= Number.MIN_SAFE_INTEGER) && (id <= Number.MAX_SAFE_INTEGER)) ? Number(id) : id
		)
		for (const callback of deferred) {
			callback(object)
		}

		return entity
	}

	async insertLink<T extends HasEntity>(object: T, property: KeyOf<T>, id: Identifier)
	{
		const connection = this.connection ?? await this.connect()

		const objectTable   = storeOf(object)
		const propertyTable = storeOf((new ReflectProperty(object, property).type as CollectionType).elementType as Type)
		const joinTable     = [objectTable, propertyTable].sort().join('_')

		const query  = 'INSERT INTO `' + joinTable + '` SET ' + objectTable + '_id = ?, ' + propertyTable + '_id = ?'
		const values = [object.id, id]
		if (DEBUG) console.log(query, JSON.stringify(values))
		connection.query(query, values)
	}

	propertiesToSearchSql(search: AnyObject)
	{
		const sql = Object.entries(search)
			.map(([name, value]) => {
				let sql: string
				if (value instanceof DaoFunction) {
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
		const connection = this.connection ?? await this.connect()

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

		return Promise.all(rows.map(row => this.valuesFromDb(row, type)))
	}

	async readCollectionIds<T extends object, PT extends object>(
		object:   HasEntity<T>,
		property: KeyOf<T>,
		type    = (new ReflectProperty(object, property).type as CollectionType).elementType as Type<PT>
	) {
		const connection = this.connection ?? await this.connect()

		const objectTable   = storeOf(object)
		const propertyTable = storeOf(type)

		let query: string
		if (componentOf(object, property)) {
			query = 'SELECT id FROM `' + propertyTable + '` WHERE ' + objectTable + '_id = ?'
		}
		else {
			const joinTable = [objectTable, propertyTable].sort().join('_')
			query = 'SELECT ' + propertyTable + '_id id FROM `' + joinTable + '`'
				+ ' WHERE `' + joinTable + '`.' + objectTable + '_id = ?'
		}
		const rows: { id: Identifier }[] = await connection.query(query, [object.id])

		return Promise.all(rows.map(row => row.id))
	}

	async readMultiple<T extends object>(type: Type<T>, ids: Identifier[])
	{
		if (!ids.length) return []
		const connection = this.connection ?? await this.connect()

		const questionMarks = Array(ids.length).fill('?').join(', ')
		if (DEBUG) console.log('SELECT * FROM `' + storeOf(type) + '` WHERE id IN (' + questionMarks + ')', ids)
		const rows: HasEntity<T>[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '` WHERE id IN (' + questionMarks + ')',
			ids
		)

		return Promise.all(rows.map(row => this.valuesFromDb(row, type)))
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

		const sql      = this.propertiesToSearchSql(search)
		const [values] = await this.valuesToDb(search, type)
		if (DEBUG) console.log('SELECT * FROM `' + storeOf(type) + '`' + sql, '[', values, ']')
		const rows: HasEntity<T>[] = await connection.query(
			'SELECT * FROM `' + storeOf(type) + '`' + sql,
			Object.values(values)
		)

		return Promise.all(rows.map(row => this.valuesFromDb(row, type)))
	}

	async update<T extends object>(object: HasEntity<T>)
	{
		const connection = this.connection ?? await this.connect()

		const [values, deferred] = await this.valuesToDb(object)
		const sql   = this.propertiesToSql(values)
		const query = 'UPDATE `' + storeOf(object) + '` SET '  + sql + ' WHERE id = ?'
		if (DEBUG) console.log(query, JSON.stringify(Object.values(values).concat([object.id])))
		await connection.query(query, Object.values(values).concat([object.id]))
		for (const callback of deferred) {
			callback(object)
		}

		return object
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

	async valuesToDb<T extends object>(object: T, type?: Type<T>): Promise<[AnyObject, Function[]]>
	{
		const typeObject = type ? new type : object
		const deferred: Function[] = []
		const values:   AnyObject  = {}
		for (const property of type ? Object.keys(object) as KeyOf<T>[] : new ReflectClass(object).propertyNames) {
			let value = Reflect.getMetadata(PROTECT_GET, typeObject, property) ? undefined : await object[property]
			value     = await applyFilter(value, typeObject, property, SQL, SAVE, values)
			if (value === IGNORE) continue
			if (isAnyFunction(value)) {
				deferred.push(value)
				continue
			}
			values[property] = value
		}
		return [values, deferred]
	}

}
