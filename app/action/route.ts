import Type                      from '../class/type'
import { decorate, decoratorOf } from '../decorator/class'

const ROUTE = Symbol('route')

export const Route = (route: string) => decorate(ROUTE, route)
export default Route

export const routeOf = (target: object | Type) => decoratorOf(target, ROUTE, '')
