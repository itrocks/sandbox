import Type                      from '../class/type'
import { decorate, decoratorOf } from '../decorator/class'

const FILE = Symbol('file')

export const File = (file: string) => decorate(FILE, file)
export default File

export const fileOf = (target: object | Type) => decoratorOf(target, FILE, '')
