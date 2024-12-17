import Type                      from '@itrocks/class-type'
import { decorate, decoratorOf } from '../decorator/class'

const ACTIONS = Symbol('actions')

export const Actions = (value: string[] = []) => decorate(ACTIONS, value)
export default Actions

export const actionsOf = (target: Type) => decoratorOf(
	target,
	ACTIONS,
	['add', 'delete', 'edit', 'json', 'list', 'output', 'save']
)
