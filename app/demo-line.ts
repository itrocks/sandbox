import Demo    from './demo'
import Uses    from './class/uses'
import Store   from './dao/store'
import HasName from './core/has-name'

@Store() @Uses(HasName)
export default class DemoLine
{

	demo?: Demo

	number = 1

}
