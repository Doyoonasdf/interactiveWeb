const banner = document.querySelector('.banner');
const list = banner.querySelector('ul');
const btnPrev = document.querySelector('.prev');
const btnNext = document.querySelector('.next');
const btnPlay = document.querySelector('.play');
const btnPause = document.querySelector('.pause');
const showNum = 3; //전체 패널갯수는 5개지만 화면에 보이는 패널은 3개니깐
const speed = 500;
const interval = 3000;
const len = list.children.length; //전체 패널의 갯수
let enableClick = true; //재이벤트방지구문
//버튼클릭할때 모션중 재이벤트방지해야함 왜? 일반 css이용해서 append prepend이용해서 싸스로만 동작이되는거면 굳이 재이벤트방지 안해도 흐트러지는게 없는데 좌우버튼 클릭할때마다 css가 아닌 requestAnimationFrame으로 만든  anime.js를 이용해서 동작할거기때문에 광클하면 모션이 엉킴
let currentNum = 0; //현재 활성화 된 패널

let timer = null; //전역으로 필요한 이유 : setInterval에 timer 값을 넣어서 clearInterval로 자동정지 롤링풀수있게

init();
//패널이 양옆으로 배치되도록 처리

setTimeout(startRolling, interval);
//startRolling(); <- 이렇게 하면 처음 로딩됐을때 바로 2번이 넘어가서 보기 안좋으니깐 스타트롤링자체를 Interval 간격뒤에 실행이 되도록 해야함

btnNext.addEventListener('click', () => {
	next();
	stopRolling(); //좌우버튼을 클릭할때도 정지가 되어야하니깐
});

// btnNext.addEventListener('click', next());
btnPrev.addEventListener('click', () => {
	prev();
	stopRolling(); //좌우버튼을 클릭할때도 정지가 되어야하니깐
});
//패널에서 슬라이더 구현할때 보면 양옆에 여분의 패널이 있어야함 실제로 화면에 창을 올리게되면 2번째 패널이 활성화됨(목록상에서는 2번째지만 실제 화면상에선 첫번째인 활성화) 그래서 위치값을  스크립트가 로딩되면 li 넓이값을 계산해서 리스트 자체를 앞으로 뺄수있게 init을 이용해서 앞쪽으로 빠져있게 만들어야함

btnPlay.addEventListener('click', startRolling); //인수 전달할게없으니깐 바로 클릭하면 바로 호출되게
btnPause.addEventListener('click', stopRolling);
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

	currentNum = nextNum; //이제 순번이 바꼈으니깐 nextNum값이 currentNum값이되야함

	new Anim(list, {
		//그와동시에 anime로 list의 위치값을 바꿔준다.
		prop: 'left',
		value: (-100 / showNum) * 2 + '%',
		// 현재 위치값이 (-100/showNum) *1 만큼 마이너스 간 상태니깐 그 상태에서 한 번 더 앞으로 가려면은 *2
		duration: speed,
		callback: () => {
			//모든 모션이 끝나면 초기화 시켜줘야해서 콜백으로 처리
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
//2024-01-11 activation함수 수정한 이유 : 현재 1번째를 기준으로 활성화되는 순번을 기억하고있다가 전체페이지갯수대비 현재 몇번째 페이지가 보이는지  카운터 값계산하거나 영상 5개를 깔아놓고나서 5개의 순번에 맞는 영상 출력하기위한 순번을 구현할때 => 순서가 바뀌지않는 고정되어있는 list의 순서값을 계산하기 위해서 activation함수가 필요한것임 (append,prepend로 순서가 계속바뀌는것은 배너인데 배너는 nth-of-type으로 활성화시키고있어서임)

function activation(index) {
	const currentList = banner.querySelector('ul');
	//왜 list 변수를 쓰지않고 ul을 찾냐면은. const list = banner.querySelector('ul'); 값을 쓰면 처음에 로딩된 시점에서의 리스트로 고정이 되기때문에 값을 활용하지못함. 그래서 배너에서 ul을 다시 찾아야 좌우버튼을 클릭할때마다 li순번이 바뀌게된다. 즉 바뀐순번 li를 다시 찾으려면은 activation함수가 호출될때마다 새롭게 갱신된 ul을 찾아야할 필요가있다.

	for (const el of currentList.children) el.classList.remove('on');
	currentList.children[index].classList.add('on');
}

//play와 pause버튼을 눌렀을때 자동으로 롤링시작/정지하는 기능
function startRolling() {
	next(); //스타트롤링이 시작되면 자동으로 한 번 넘어가고
	timer = setInterval(next, interval); //	 그 후에 interval간격대로 넘어가게
	//로딩바가 그어지는 @keyframes ani 는 2초로 했는데, 여기서는 3초로하는이유? 3초가 정밀하지 않아서 3초로 걸어도 실제로는 2.5초정도임 선이 빨리 그어지는게 중요하니깐 2초 그 후에 작업되도록
	btnPlay.classList.add('on'); //스타트롤링이 시작되면 자동적으로 재생버튼 활성화되도록
	btnPause.classList.remove('on');
}

function stopRolling() {
	clearInterval(timer); //자동롤링 끊어줌
	btnPause.classList.add('on');
	btnPlay.classList.remove('on');
}
