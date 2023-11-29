import { decorateCallback, decoratorOfCallback } from '../../decorator/property'
import { toDisplay } from '../rename'
import Type from '../../class/type'

const Display = (name: string = '') => decorateCallback(
	'display',
	(_target, property) => (name === '') ? toDisplay(property) : name
)

const displayOf = (target: object|Type, property: string) => decoratorOfCallback<string>(
	target,
	property,
	'display',
	(_target, property) => toDisplay(property)
)

export default Display
export { Display, displayOf }
