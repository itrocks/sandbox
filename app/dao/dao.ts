import config from '../../local/dao'

export interface Dao
{

	read<T extends object>(type: new() => T, id: Identifier): Promise<T & Entity>

	save<T extends object>(object: T | (T & Entity)): Promise<T & Entity>

	search<T extends object>(type: new() => T, search?: object): Promise<(T & Entity)[]>

}

export interface Entity
{
	id: Identifier
}

export type Identifier = bigint | string

const { engine: _, ...daoConfig } = config
export const dao: Dao = new (require('./' + config.engine).default)(daoConfig)
export default dao
