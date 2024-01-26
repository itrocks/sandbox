import { lcFirst, toClass, toDisplay, toRoute, toVar, ucFirst } from './rename'

export default class Str extends String
{

	lcFirst()   { return lcFirst(this.toString()) }
	toClass()   { return toClass(this.toString()) }
	toDisplay() { return toDisplay(this.toString()) }
	toRoute()   { return toRoute(this.toString()) }
	toVar()     { return toVar(this.toString()) }
	ucFirst()   { return ucFirst(this.toString()) }

}
