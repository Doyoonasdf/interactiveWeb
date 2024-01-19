const banner = document.querySelector('.banner');
const list = banner.querySelector('ul');
//const [btnPrev, btnNext] = document.querySelector('.btns').children;
const btnPrev = document.querySelector('.prev');
const btnNext = document.querySelector('.next');
const btnPlay = document.querySelector('.play');
const btnPause = document.querySelector('.pause');
const tits = document.querySelectorAll('.tits h2');
// const vids = document.querySelectorAll('.bgs video');
const mask = document.querySelector('.mask');
const bgFrame = document.querySelector('.bgs');
const paging = document.querySelector('.paging');
const [counter, total] = paging.children; //strong과 span태그
const vidData = ['vid1.mp4', 'vid2.mp4', 'vid3.mp4', 'vid4.mp4', 'vid5.mp4'];
const showNum = 3; //전체 패널갯수는 5개지만 화면에 보이는 패널은 3개니깐
const speed = 500;
const interval = 3000; //자동으로 전환되는 간격
const len = list.children.length; //전체 패널의 갯수
let enableClick = true; //재이벤트방지구문
//버튼클릭할때 모션중 재이벤트방지해야함 왜? 일반 css이용해서 append prepend이용해서 싸스로만 동작이되는거면 굳이 재이벤트방지 안해도 흐트러지는게 없는데 좌우버튼 클릭할때마다 css가 아닌 requestAnimationFrame으로 만든  anime.js를 이용해서 동작할거기때문에 광클하면 모션이 엉킴

let vids = null;
let vidCount = 0;
let currentNum = 0; //현재 활성화 된 패널의 인덱스를 나타냄

let timer = null; //전역으로 필요한 이유 : setInterval에 timer 값을 넣어서 clearInterval로 자동정지 롤링풀수있게

init();
//패널이 양옆으로 배치되도록 처리
createVid();
setTimeout(startRolling, interval); //setTimeout는 특정 작업이 나중에 실행되도록 예약할 때 사용
//startRolling(); <- 이렇게 하면 처음 로딩됐을때 바로 2번이 넘어가서 보기 안좋으니깐 스타트롤링자체를 Interval 간격뒤에 실행이 되도록 해야함

//클릭 이벤트가 발생했을 때, 콜백 함수(() => { next(); })가 실행 콜백 함수 내에서 next() 함수가 호출되므로, 실제 클릭 이벤트가 발생할 때 next 함수가 실행됩니다.
btnNext.addEventListener('click', () => {
	next();
	stopRolling(); //좌우버튼을 클릭할때도 정지가 되어야하니깐
});

// btnNext.addEventListener('click', next()); // next() 함수가 즉시 호출되고, 그 반환값이 이벤트 리스너로 전달됨 실제로 클릭 이벤트가 발생할 때는 아무런 일도 일어나지 않습니다. 왜냐하면 next() 함수가 이미 즉시 호출되어 버렸기 때문

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
	total.innerText = len < 10 ? '0' + len : len;
}
//동적으로 비디오 태그 생성
function createVid() {
	let tags = '';
	vidData.forEach((vid) => (tags += `<video src='vids/${vid}' loop muted autoplay></video>>`));
	//vid는 vidData 배열의 각 요소 / forEach 메서드의 콜백 함수는 각 배열 요소에 대해 한 번씩 호출되어  이때 해당 요소가 함수의 매개변수 vid로 전달 => HTML 비디오 태그를 생성
	bgFrame.innerHTML = tags; // innerHTML을 사용한 이유 ?  tags에 저장된 문자열이 HTML 태그들을 포함 하고있음 innerText를 쓰면은 , HTML 태그를 텍스트로 취급하여 태그들이 그대로 표시

	//돔이 완성되자마자

	vids = bgFrame.querySelectorAll('video'); //video태그를 vids 변수에 담아놓기
	vids.forEach((vid) => {
		vid.onloadeddata = () => {
			// 비디오의 데이터가 최소한 한 번 로드되고 재생할 수 있는 상태로 변했을 때 발생 + 비디오가 로드된 후에 특정 동작을 수행하고자 할 때 사용
			// oonloadeddata 이벤트는 비디오가 로드되어 재생 가능한 상태로 변했을 때의 시점을 가리키며, 이때 브라우저는 해당 비디오 데이터를 캐시에 저장 / 캐싱은 데이터나 리소스를 임시로 저장하여 나중에 동일한 데이터에 대한 요청이 있을 때 빠르게 응답할 수 있도록 하는 메커니즘 /영상소스를 캐싱한다는 것은 비디오 파일을 한 번 로드하고 난 후, 해당 파일을 브라우저의 캐시에 저장하여 다음에 동일한 비디오에 대한 요청이 있을 때 다시 서버에서 다운로드하지 않고 캐시에서 가져와 사용하는 것을 의미
			vidCount++; //각 비디오 데이터가 로드될때마다 증가시켜서 로드된 비디오의 수를 추적한다.
			console.log(vidCount);

			if (vidCount === vidData.length) {
				new Anim(mask, {
					prop: 'opacity',
					value: 0, //투명도가없음 / 1은 투명도 100%
					duration: 1000,
					callback: () => mask.remove(), //DOM에서 완전히 제거.
				});
			}
		};
	});

	vids[0].classList.add('on'); //처음에 빈 비디오화면이 떠서, 첫번째 vid영상에 on추가 => on 클래스가 추가되지 않으면, 초기에는 비디오에 어떠한 스타일이나 표시 설정이 없는 상태가 되어 빈 비디오 화면이 나타남. on 클래스는 초기에 비디오를 화면에 표시하도록함.
}

//현재활성화되어있는 패널을 기점으로 다음 활성화될 패널 순번을 구한다.
//클릭을 하면은 enableClick이 false

function next() {
	if (!enableClick) return; //트루가 아니면 모션중인거니깐 리턴
	enableClick = false; //이미지 전환 중에는 클릭을 비활성화해야하니깐

	//다음 이미지 인덱스 계산 및 현재 이미지 인덱스 업데이트
	let nextNum = null;
	currentNum !== len - 1 ? (nextNum = currentNum + 1) : (nextNum = 0);
	//만약에 커렌트넘값이 마지막 순번값이 아니면은 더 증가할게 있는거니깐 current_num에서 1을더함 그런게아니면은 넥스트넘은 마지막이여서 할게없는거니깐 처음순번값인 0으로 초기화한다.
	currentNum = nextNum; //이제 순번이 바꼈으니깐 nextNum값이 currentNum값이되야함
	activation(currentNum);
	setCounter(currentNum);
	new Anim(list, {
		//그와동시에 anime로 list의 위치값을 바꿔준다.
		prop: 'left',
		value: (-100 / showNum) * 2 + '%',
		// -100/showNum은 한 번에 이미지 하나의 크기만큼 왼쪽으로 이동하는 비율이고 *2를 하는이유는 다음 이미지가 현재 보이는 이미지의 크기만큼 완전히 슬라이딩 되어야함
		duration: speed,
		callback: () => {
			//애니메이션이 완료된 후에 실행되는걸 정의
			list.append(list.firstElementChild); //현재 화면에는 [1, 2, 3] 실행되면 1 번째 이미지가 맨 뒤로 이동하여 이미지 목록은 [2, 3, 1] 됨 .
			list.style.left = -100 / showNum + '%'; // 이미지 목록을 한 번에 한 이미지씩 왼쪽으로 이동시키면서, 다시 초기 위치로 되돌리는 역할 그 결과, 화면에는 [2, 3, 1]의 이미지가 보임
			enableClick = true; // enableClick(true) 라고 하면 동작안됨
		},
	});
}

function prev() {
	if (!enableClick) return;
	enableClick = false;
	let prevNum = null;
	currentNum !== 0 ? (prevNum = currentNum - 1) : (prevNum = len - 1);
	// 현재 이미지의 인덱스가 0이 아니라면 이전 이미지의 인덱스를 currentNum - 1로 설정하고, 현재 이미지의 인덱스가 0이면 마지막 이미지의 인덱스로 설정
	currentNum = prevNum;
	activation(currentNum);
	setCounter(currentNum);
	new Anim(list, {
		prop: 'left',
		value: (-100 / showNum) * 0 + '%', //  이동 크기를 0으로 설정하여 이미지를 초기 위치로 되돌리는 역할로 이미지를 원래 위치로 되돌려서 이전 이미지가 다시 보이게끔 하는 것  즉 현재가 [1,2,3] 이면 실행하면 [3,1,2]
		duration: speed,
		callback: () => {
			list.prepend(list.lastElementChild); // [1, 2, 3]에서 실행하면 [3, 1, 2]
			list.style.left = -100 / showNum + '%';
			enableClick = true;
		},
	});
}
//2024-01-11 activation함수 수정한 이유 : 현재 1번째를 기준으로 활성화되는 순번을 기억하고있다가 전체페이지갯수대비 현재 몇번째 페이지가 보이는지  카운터 값계산하거나 영상 5개를 깔아놓고나서 5개의 순번에 맞는 영상 출력하기위한 순번을 구현할때 => 순서가 바뀌지않는 고정되어있는 list의 순서값을 계산하기 위해서 activation함수가 필요한것임 (append,prepend로 순서가 계속바뀌는것은 배너인데 배너는 nth-of-type으로 활성화시키고있어서임)

function activation(index) {
	// const currentList = banner.querySelector('ul');
	//왜 list 변수를 쓰지않고 ul을 찾냐면은. const list = banner.querySelector('ul'); 값을 쓰면 처음에 로딩된 시점에서의 리스트로 고정이 되기때문에 값을 활용하지못함. 그래서 배너에서 ul을 다시 찾아야 좌우버튼을 클릭할때마다 li순번이 바뀌게된다. 즉 바뀐순번 li를 다시 찾으려면은 activation함수가 호출될때마다 새롭게 갱신된 ul을 찾아야할 필요가있다.

	for (const el of tits) el.classList.remove('on');
	for (const el of vids) el.classList.remove('on');
	tits[index].classList.add('on');
	vids[index].classList.add('on');
}

//play와 pause버튼을 눌렀을때 자동으로 롤링시작/정지하는 기능
function startRolling() {
	next(); //스타트롤링이 시작되면 자동으로 한 번 넘어가고

	//setInterval은 일정한 시간 간격마다 지정된 함수를 반복적으로 실행
	timer = setInterval(next, interval); //	 그 후에 next함수가  interval 시간간격대로 넘어가게
	//로딩바가 그어지는 @keyframes ani 는 2초로 했는데, 여기서는 3초로하는이유? 3초가 정밀하지 않아서 3초로 걸어도 실제로는 2.5초정도임 선이 빨리 그어지는게 중요하니깐 2초 그 후에 작업되도록
	btnPlay.classList.add('on'); //스타트롤링이 시작되면 자동적으로 재생버튼 활성화되도록
	btnPause.classList.remove('on');
}

function stopRolling() {
	//clearInterval는 setInterval 함수에 의해 설정된 타이머를 종료하고 더 이상 함수가 반복적으로 호출되지 않도록
	clearInterval(timer); //자동롤링 끊어줌
	btnPause.classList.add('on');
	btnPlay.classList.remove('on');
}

function setCounter(num) {
	counter.innerText = '0' + (num + 1);
}
