import { isObject, ObjectOrType } from '@itrocks/class-type'
import { tr }                     from '@itrocks/translate'
import { displayOf }              from './display'
import { representativeValueOf }  from './representative'

export const outputOf = (target: ObjectOrType) => isObject(target)
	? (displayOf(target) + ' ' + representativeValueOf(target))
	: displayOf(target)

export const trOutputOf = (target: ObjectOrType) => isObject(target)
	? (tr(displayOf(target)) + ' ' + representativeValueOf(target))
	: tr(displayOf(target))
