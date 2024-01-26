import { decorate, decoratorOf } from '../decorator/class'

const Actions = (value: string[] = []) => decorate('actions', value)

const actionsOf = (target: any) => decoratorOf(
	target,
	'actions',
	['add', 'delete', 'edit', 'json', 'list', 'output', 'save']
)

export { Actions, actionsOf }

export default Actions
