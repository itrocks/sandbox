import { Composite }  from '@itrocks/composition'
import Uses           from './class/uses'
import Store          from './dao/store'
import HasName        from './core/has-name'
import Demo           from './demo'
import Representative from './view/class/representative'

@Representative('number') @Store() @Uses(HasName)
export default class DemoLine
{

	caption = ''

	@Composite()
	demo?: Demo

	number = 1

}
