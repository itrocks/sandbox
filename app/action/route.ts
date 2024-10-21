import { ObjectOrType }          from '../class/type'
import { decorate, decoratorOf } from '../decorator/class'

const ROUTE = Symbol('route')

export const objectRouteOf = (target: object) => routeOf(target) + (('id' in target) ? ('/' + target.id) : '')

export const Route = (route: string) => decorate(ROUTE, route)
export default Route

export const routeOf = (target: ObjectOrType) => decoratorOf(target, ROUTE, '')
