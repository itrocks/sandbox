import build from '../build.js'

build('main article #div #active', active => {
	active.setAttribute('title', 'Title dynamically added')
})

document.getElementById('change')?.addEventListener('click', () => {
	const div = document.getElementById('div')
	if (!div) return
	//div.innerHTML = '<div><div id="active">This is active content</div></div><div>Another one</div>'
	const el1 = document.createElement('div')
	const el2 = document.createElement('div')
	el1.appendChild(el2)
	div.appendChild(el1)
})
