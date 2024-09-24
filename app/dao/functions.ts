
export default class Function
{
	constructor(public name: string, public sql: string, public value: any) {}
}

export const equal          = (value: any) => new Function(equal.name,          ' = ?',    value)
export const greater        = (value: any) => new Function(greater.name,        ' < ?',    value)
export const greaterOrEqual = (value: any) => new Function(greaterOrEqual.name, ' <= ?',   value)
export const less           = (value: any) => new Function(less.name,           ' < ?',    value)
export const lessOrEqual    = (value: any) => new Function(lessOrEqual.name,    ' <= ?',   value)
export const like           = (value: any) => new Function(like.name,           ' LIKE ?', value)
