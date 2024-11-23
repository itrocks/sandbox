import config          from '../../local/dao'
import { KeyOf, Type } from '../class/type'

export type SearchType<T extends object = object> = Partial<Record<KeyOf<T & Entity>, any>> & { [key: string]: any }

export abstract class Dao
{

	connectObject<T extends object>(object: T, id: Identifier)
	{
		(object as Entity).id = id
		return object as T & Entity
	}

	abstract delete<T extends object>(object: T & Entity, property?: KeyOf<T & Entity>): Promise<T>

	disconnectObject<T extends object>(object: T & Entity)
	{
		delete (object as Partial<Entity>).id
		return object as T
	}

	isObjectConnected<T extends object>(object: T | (T & Entity)): object is (T & Entity)
	{
		return Boolean(('id' in object) && object.id)
	}

	abstract read<T extends object>(type: Type<T>, id: Identifier): Promise<T & Entity>

	abstract save<T extends object>(object: T): Promise<T & Entity>

	abstract search<T extends object>(type: Type<T>, search?: SearchType<T>): Promise<(T & Entity)[]>

}

export interface Entity { id: Identifier }

export type Identifier = bigint | number | string

const { engine: _, ...daoConfig } = config
export const dao: Dao = new (require('./' + config.engine).default)(daoConfig)
export default dao
