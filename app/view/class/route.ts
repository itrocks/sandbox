import Type from '../../class/type'

export const routeOf = (target: object | Type) => (typeof target === 'object')
	? 'gna/gna/yes'
	: 'gna/gna/no'
export default routeOf
