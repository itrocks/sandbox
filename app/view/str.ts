import { lcFirst, toClass, toDisplay, toFunction, toRoute, toVar, ucFirst } from './rename'

export default class Str extends String
{

	lcFirst()    { return lcFirst(this + '')    }
	toClass()    { return toClass(this + '')    }
	toDisplay()  { return toDisplay(this + '')  }
	toFunction() { return toFunction(this + '') }
	toRoute()    { return toRoute(this + '')    }
	toVar()      { return toVar(this + '')      }
	ucFirst()    { return ucFirst(this + '')    }

}
