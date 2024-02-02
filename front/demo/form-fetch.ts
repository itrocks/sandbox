import formFetch from '../form-fetch.js'

document.querySelectorAll('form').forEach(form => formFetch(form, response => {
	alert('Response status ' + response.status)
	console.log(response)
}))
