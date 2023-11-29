import config from '../../local/dao'

interface Dao
{

	read<T extends object>(type: new()=>T, id: number): Promise<T>

	search<T extends object>(type: new()=>T, search?: object): Promise<T[]>

}

const { engine: _, ...daoConfig } = config
const dao: Dao = new (require('./' + config.engine).default)(daoConfig)

export default dao
export { dao, Dao }
