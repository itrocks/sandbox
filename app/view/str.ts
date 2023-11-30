import { lcFirst, toClass, toDisplay, toRoute, toVar, ucFirst } from './rename'

class Str extends String
{

	lcFirst()   { return lcFirst(this.toString()) }
	toClass()   { return toClass(this.toString()) }
	toDisplay() { return toDisplay(this.toString()) }
	toRoute()   { return toRoute(this.toString()) }
	toVar()     { return toVar(this.toString()) }
	ucFirst()   { return ucFirst(this.toString()) }

}

export default Str
