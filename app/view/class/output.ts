import Type                      from '../../class/type'
import tr                        from '../../locale/translate'
import { displayOf }             from './display'
import { representativeValueOf } from './representative'

export const outputOf = (target: object | Type) => (typeof target === 'object')
	? (displayOf(target) + ' ' + representativeValueOf(target))
	: displayOf(target)

export const trOutputOf = (target: object | Type) => (typeof target === 'object')
	? (tr(displayOf(target)) + ' ' + representativeValueOf(target))
	: tr(displayOf(target))
