import { Representative } from '@itrocks/class-view'
import { Composite }      from '@itrocks/composition'
import { HasName }        from '@itrocks/domain-components'
import { Store }          from '@itrocks/store'
import { Uses }           from '@itrocks/uses'
import Demo               from './demo'

@Representative('number') @Store() @Uses(HasName)
export default class DemoLine
{

	caption = ''

	@Composite()
	demo?: Demo

	number = 1

}
