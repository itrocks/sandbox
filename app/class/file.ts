import { decorate, decoratorOf } from '../decorator/class'
import { ObjectOrType }          from './type'

const FILE = Symbol('file')

export const File = (file: string) => decorate(FILE, file)
export default File

export const fileOf = (target: ObjectOrType) => decoratorOf(target, FILE, '')
