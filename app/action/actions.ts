import { decorate, decoratorOf } from '../decorator/class'
import Type from '../class/type'

const ACTIONS = Symbol('actions')

const Actions = (value: string[] = []) => decorate(ACTIONS, value)

const actionsOf = (target: Type) => decoratorOf(
	target,
	ACTIONS,
	['add', 'delete', 'edit', 'json', 'list', 'output', 'save']
)

export { Actions, actionsOf }

export default Actions
