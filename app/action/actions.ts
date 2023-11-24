import { decorate, decoratorOf } from '../decorator/class'

const actions = (value: string[] = []) => decorate('actions', value)

const actionsOf = (object: any) => decoratorOf(
	object,
	'actions',
	['add', 'delete', 'edit', 'json', 'list', 'output', 'save']
)

export default actions
export { actions, actionsOf }
