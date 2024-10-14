import config     from '../../local/dao'
import { Object } from '../class/type'
import Type       from '../class/type'

export interface Dao
{

	delete<T extends Object>(object: T & Entity, property?: string): Promise<T>

	read<T extends object>(type: Type<T>, id: Identifier): Promise<T & Entity>

	save<T extends object>(object: T | (T & Entity)): Promise<T & Entity>

	search<T extends object>(type: Type<T>, search?: object): Promise<(T & Entity)[]>

}

export interface Entity { id: Identifier }

export type Identifier = bigint | string

const { engine: _, ...daoConfig } = config
export const dao: Dao = new (require('./' + config.engine).default)(daoConfig)
export default dao
