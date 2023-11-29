import Representative from '../view/class/representative'
import Required from '../property/validate/required'
import Store from '../dao/store'

@Representative() @Store()
class Account
{

    @Required()
    login = ''

    password = ''

}

export default Account
