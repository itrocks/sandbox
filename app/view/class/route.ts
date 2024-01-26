import Type from '../../class/type'

const routeOf = (target: object|Type) => (typeof target === 'object')
	? 'gna/gna/yes'
	: 'gna/gna/no'

export { routeOf }

export default routeOf
