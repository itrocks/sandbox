import Type                      from '../../class/type'
import { decorate, decoratorOf } from '../../decorator/property'

const PASSWORD = Symbol('password')

export const Password = () => decorate(PASSWORD, true)
export default Password

export const passwordOf = (target: object | Type, property: string) =>
	decoratorOf<boolean>(target, property, PASSWORD, false)
