import { ObjectOrType }          from '../../class/type'
import tr                        from '../../locale/translate'
import { displayOf }             from './display'
import { representativeValueOf } from './representative'

export const outputOf = (target: ObjectOrType) => (typeof target === 'object')
	? (displayOf(target) + ' ' + representativeValueOf(target))
	: displayOf(target)

export const trOutputOf = (target: ObjectOrType) => (typeof target === 'object')
	? (tr(displayOf(target)) + ' ' + representativeValueOf(target))
	: tr(displayOf(target))
