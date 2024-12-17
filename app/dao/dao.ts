import { KeyOf, Type } from '@itrocks/class-type'
import config          from '../../local/dao'

export type SearchType<T extends object = object> = Partial<Record<KeyOf<T>, any>> & Record<string, any>

export abstract class Dao
{

	connectObject<T extends object>(object: MayEntity<T>, id: Identifier)
	{
		(object as HasEntity<T>).id = id
		return object as HasEntity<T>
	}

	abstract delete<T extends object>(object: HasEntity<T>, property?: KeyOf<HasEntity<T>>): Promise<T>

	abstract deleteId<T extends object>(type: Type<T>, id: Identifier): void

	abstract deleteLink<T extends HasEntity>(object: T, property: KeyOf<T>, id: Identifier): void

	disconnectObject<T extends object>(object: HasEntity<T>): T
	{
		delete (object as Partial<Entity>).id
		return object
	}

	abstract insertLink<T extends HasEntity>(object: T, property: KeyOf<T>, id: Identifier): void

	isObjectConnected<T extends object>(object: MayEntity<T>): object is HasEntity<T>
	{
		return ('id' in object) && !!object.id
	}

	abstract read<T extends object>(type: Type<T>, id: Identifier): Promise<HasEntity<T>>

	abstract readCollection<T extends object, PT extends object>(
		object: HasEntity<T>, property: KeyOf<T>, type?: Type<PT>
	): Promise<HasEntity<PT>[]>

	abstract readCollectionIds<T extends object, PT extends object>(
		object: HasEntity<T>, property: KeyOf<T>, type?: Type<PT>
	): Promise<Identifier[]>

	abstract readMultiple<T extends object>(type: Type<T>, ids: Identifier[]): Promise<HasEntity<T>[]>

	abstract save<T extends object>(object: MayEntity<T>): Promise<HasEntity<T>>

	abstract search<T extends object>(type: Type<T>, search?: SearchType<T>): Promise<HasEntity<T>[]>

}

export interface Entity { id: Identifier }

export type Identifier = bigint | number | string

export type MayEntity<T extends object = object> = T | HasEntity<T>
export type HasEntity<T extends object = object> = T & Entity

const { engine: _, ...daoConfig } = config
export const dao: Dao = new (require('./' + config.engine).default)(daoConfig)
export default dao
