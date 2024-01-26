import Type                      from '../../class/type'
import { displayOf }             from './display'
import { representativeValueOf } from './representative'

const outputOf = (target: object|Type) => (typeof target === 'object')
	? (displayOf(target) + ' ' + representativeValueOf(target))
	: displayOf(target)

export { outputOf }

export default outputOf
