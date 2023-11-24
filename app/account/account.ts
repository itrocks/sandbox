import required from '../property/validate/required'
import store from '../dao/store'

@store()
class Account
{

    @required()
    login = ''

    @required()
    password = ''

}

export default Account
