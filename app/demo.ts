import Store from './dao/store'

@Store()
export default class Demo
{

	age?: number

	birthday?: Date = new Date

	name: string = ''

}
