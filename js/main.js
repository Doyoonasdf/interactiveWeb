const banner = document.querySelector('.banner');
const list = banner.querySelector('ul');
const showNum = 3; //전체 패널갯수는 5개지만 화면에 보이는 패널은 3개니깐

init();
//패널이 양옆으로 배치되도록 처리

//패널에서 슬라이더 구현할때 보면 양옆에 여분의 패널이 있어야함 실제로 화면에 창을 올리게되면 2번째 패널이 활성화됨(목록상에서는 2번째지만 실제 화면상에선 첫번째인 활성화) 그래서 위치값을  스크립트가 로딩되면 li 넓이값을 계산해서 리스트 자체를 앞으로 뺄수있게 init을 이용해서 앞쪽으로 빠져있게 만들어야함
function init() {
	list.style.left = -100 / showNum + '%';
	list.prepend(list.lastElementChild);
}
