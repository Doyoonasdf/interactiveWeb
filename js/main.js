const banner = document.querySelector('.banner');
const list = banner.querySelector('ul');
const btnPrev = document.querySelector('.prev');
const btnNext = document.querySelector('.next');
const btnPlay = document.querySelector('.play');
const btnPause = document.querySelector('.pause');
const showNum = 3; //전체 패널갯수는 5개지만 화면에 보이는 패널은 3개니깐
const speed = 500;
const len = list.children.length; //전체 패널의 갯수
let enableClick = true; //재이벤트방지구문
//버튼클릭할때 모션중 재이벤트방지해야함 왜? 일반 css이용해서 append prepend이용해서 싸스로만 동작이되는거면 굳이 재이벤트방지 안해도 흐트러지는게 없는데 좌우버튼 클릭할때마다 css가 아닌 requestAnimationFrame으로 만든  anime.js를 이용해서 동작할거기때문에 광클하면 모션이 엉킴
let currentNum = 0; //현재 활성화 된 패널

init();
//패널이 양옆으로 배치되도록 처리

btnNext.addEventListener('click', () => {
	next();
});

// btnNext.addEventListener('click', next());
btnPrev.addEventListener('click', () => {
	prev();
});
//패널에서 슬라이더 구현할때 보면 양옆에 여분의 패널이 있어야함 실제로 화면에 창을 올리게되면 2번째 패널이 활성화됨(목록상에서는 2번째지만 실제 화면상에선 첫번째인 활성화) 그래서 위치값을  스크립트가 로딩되면 li 넓이값을 계산해서 리스트 자체를 앞으로 뺄수있게 init을 이용해서 앞쪽으로 빠져있게 만들어야함
function init() {
	list.style.left = -100 / showNum + '%';
	list.prepend(list.lastElementChild);
}
//현재활성화되어있는 패널을 기점으로 다음 활성화될 패널 순번을 구한다.
function next() {
	if (!enableClick) return; //트루가 아니면 모션중인거니깐 리턴
	enableClick = false;

	let nextNum = null;
	currentNum !== len - 1 ? (nextNum = currentNum + 1) : (nextNum = 0);
	//만약에 커렌트넘값이 마지막 순번값이 아니면은 더 증가할게 있는거니깐 current_num에서 1을더함 그런게아니면은 넥스트넘은 마지막이여서 할게없는거니깐 처음순번값인 0으로 초기화한다.

	activation(nextNum); //앞으로 활성화될 순번인 nextNum에다가 on 활성화
	currentNum = nextNum; //이제 순번이 바꼈으니깐 nextNum값이 currentNum값이되야함

	//그와동시에 anime로 list의 위치값을 바꿔준다.

	// 현재 위치값이 (-100/showNum) *1 만큼 마이너스 간 상태니깐 그 상태에서 한 번 더 앞으로 가려면은 *2

	//모든 모션이 끝나면 초기화 시켜줘야해서 콜백으로 처리
	new Anim(list, {
		prop: 'left',
		value: (-100 / showNum) * 2 + '%',
		duration: speed,
		callback: () => {
			list.append(list.firstElementChild);
			list.style.left = -100 / showNum + '%';
			enableClick = true; // enableClick(true) 라고 하면 동작안됨
		},
	});
}

function prev() {
	if (!enableClick) return;
	enableClick = false;
	let prevNum = null;
	currentNum !== 0 ? (prevNum = currentNum - 1) : (prevNum = len - 1);
	//현재넘이 0이아니면 받을게 있는거니깐 기존의 커렌트넘에서 1을빼야함
	activation(prevNum);
	currentNum = prevNum;

	new Anim(list, {
		prop: 'left',
		value: (-100 / showNum) * 0 + '%', // *0 ? 0%로 가면되니깐
		duration: speed,
		callback: () => {
			list.prepend(list.lastElementChild);
			list.style.left = -100 / showNum + '%';
			enableClick = true;
		},
	});
}
//현재 활성화 된 것만 on을 붙임
function activation(index) {
	const currentList = banner.querySelector('ul');
	//왜 list 변수를 쓰지않고 ul을 찾냐면은. const list = banner.querySelector('ul'); 값을 쓰면 처음에 로딩된 시점에서의 리스트로 고정이 되기때문에 값을 활용하지못함. 그래서 배너에서 ul을 다시 찾아야 좌우버튼을 클릭할때마다 li순번이 바뀌게된다. 즉 바뀐순번 li를 다시 찾으려면은 activation함수가 호출될때마다 새롭게 갱신된 ul을 찾아야할 필요가있다.

	for (const el of currentList.children) el.classList.remove('on');
	currentList.children[index].classList.add('on');
}
