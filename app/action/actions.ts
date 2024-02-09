import { decorate, decoratorOf } from '../decorator/class'
import Type from '../class/type'

const ACTIONS = Symbol('actions')

export const Actions = (value: string[] = []) => decorate(ACTIONS, value)
export default Actions

export const actionsOf = (target: Type) => decoratorOf(
	target,
	ACTIONS,
	['add', 'delete', 'edit', 'json', 'list', 'output', 'save']
)
