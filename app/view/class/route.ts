import Type from '../../class/type'

const routeOf = (target: object|Type) => (typeof target === 'object')
	? 'gna/gna'
	: 'gna/gna'

export default routeOf
export { routeOf }
