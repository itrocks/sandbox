import { displayOf } from './display'
import { representativeValueOf } from './representative'
import Type from '../../class/type'

const outputOf = (target: object|Type) => (typeof target === 'object')
	? (displayOf(target) + ' ' + representativeValueOf(target))
	: displayOf(target)

export default outputOf
export { outputOf }
