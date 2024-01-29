import { decorate, decoratorOf } from '../decorator/class'
import Type from '../class/type'

const ACTIONS = Symbol('actions')

const Actions = (value: string[] = []) => decorate<string[]>(ACTIONS, value)

const actionsOf = (target: Type) => decoratorOf<string[]>(
	target,
	ACTIONS,
	['add', 'delete', 'edit', 'json', 'list', 'output', 'save']
)

export { Actions, actionsOf }

export default Actions
