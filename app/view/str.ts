import { lcFirst, toClass, toDisplay, toRoute, toVar, ucFirst } from './rename'

class Str extends String
{

	lcFirst   = () => lcFirst(this.toString())
	toClass   = () => toClass(this.toString())
	toDisplay = () => toDisplay(this.toString())
	toRoute   = () => toRoute(this.toString())
	toVar     = () => toVar(this.toString())
	ucFirst   = () => ucFirst(this.toString())

}

export default Str
