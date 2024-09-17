import Store          from '../dao/store'
import Password       from '../property/filter/password'
import Required       from '../property/validate/required'
import Representative from '../view/class/representative'

@Representative() @Store()
export default class Account
{

	@Required()
	login = ''

	@Password()
	password = ''

}
