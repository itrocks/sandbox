import Store          from '../dao/store'
import Required       from '../property/validate/required'
import Representative from '../view/class/representative'

@Representative() @Store()
export default class Account
{

	@Required()
	login = ''

	password = ''

}
