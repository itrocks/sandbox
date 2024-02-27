import Type                      from '../../class/type'
import { displayOf }             from './display'
import { representativeValueOf } from './representative'

export const outputOf = (target: object | Type) => (typeof target === 'object')
	? (displayOf(target) + ' ' + representativeValueOf(target))
	: displayOf(target)
