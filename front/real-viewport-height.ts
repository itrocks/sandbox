
const realViewportHeight = () => {
	document.documentElement.style.setProperty('--real-vh', `${window.innerHeight}px`)
}

addEventListener('orientationchange', realViewportHeight)
addEventListener('resize', realViewportHeight)
realViewportHeight()
