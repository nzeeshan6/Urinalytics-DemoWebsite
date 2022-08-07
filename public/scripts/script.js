const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');
allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});
// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');
let flag=true
function resize(){
	if(window.innerWidth<768 && flag){
		flag=false;
		sidebar.classList.toggle('hide');
		console.log('hi2')
	}
}
menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
	flag=true;
})
window.onresize=resize;