import config          from '../../local/dao'
import { KeyOf, Type } from '../class/type'

export type SearchType<T extends object = object> = Partial<Record<KeyOf<T>, any>> & { [key: string]: any }

export abstract class Dao
{

	connectObject<T extends object>(object: T, id: Identifier)
	{
		(object as HasEntity<T>).id = id
		return object as HasEntity<T>
	}

	abstract delete<T extends object>(object: HasEntity<T>, property?: KeyOf<HasEntity<T>>): Promise<T>

	disconnectObject<T extends object>(object: HasEntity<T>)
	{
		delete (object as Partial<Entity>).id
		return object as T
	}

	isObjectConnected<T extends object>(object: MayEntity<T>): object is HasEntity<T>
	{
		return Boolean(('id' in object) && object.id)
	}

	abstract read<T extends object>(type: Type<T>, id: Identifier): Promise<HasEntity<T>>

	abstract readCollection<T extends object, PT extends object>(object: T, property: KeyOf<T>, type?: Type<PT>):
		Promise<HasEntity<PT>[]>

	abstract save<T extends object>(object: T): Promise<HasEntity<T>>

	abstract search<T extends object>(type: Type<T>, search?: SearchType<T>): Promise<HasEntity<T>[]>

}

export interface Entity { id: Identifier }

export type Identifier = bigint | number | string

export type MayEntity<T extends object = object> = T | HasEntity<T>
export type HasEntity<T extends object = object> = T & Entity

const { engine: _, ...daoConfig } = config
export const dao: Dao = new (require('./' + config.engine).default)(daoConfig)
export default dao
