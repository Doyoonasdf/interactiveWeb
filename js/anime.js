class Anim {
	constructor(selector, option) {
		this.selector = selector;
		this.option = option;
		this.startTime = performance.now();
		option.duration == undefined ? (this.speed = 500) : (this.speed = option.duration);
		this.currentValue; //초기값 설정 ( 현재값)
		this.timer;

		// 속성에 따라 현재값을 얻는 로직
		if (this.option.prop === 'scroll') {
			this.currentValue = parseInt(window.scrollY || window.pageYOffset);
		} else if (this.selector.style[this.option.prop]) {
			if (this.option.prop === 'opacity') {
				//직접적으로 인라인 스타일 가져온다
				this.currentValue = parseFloat(this.selector.style[this.option.prop]);
			} else {
				this.currentValue = parseInt(this.selector.style[this.option.prop]);
			}
		} else {
			//인라인 스타일 못가져오면 계산된 스타일에서 가져온다
			if (this.option.prop === 'opacity') {
				this.currentValue = parseFloat(getComputedStyle(this.selector)[this.option.prop]);
			} else {
				this.currentValue = parseInt(getComputedStyle(this.selector)[this.option.prop]);
			}
		}
		//문자열이면 부동 소수점 숫자로 변환 및 변환된 값과 현재값이 다르면 run 호출해서 동작 예약
		this.isString = typeof this.option.value;
		if (this.isString == 'string') this.option.value = parseFloat(this.option.value);
		if (this.option.value !== this.currentValue)
			requestAnimationFrame((time) => {
				this.run(time);
			});
	}

	run(time) {
		let timeLast = time - this.startTime; //경과된시간
		let progress = timeLast / this.speed; // 애니메이션 속도에 따라 진행률 계산

		if (progress < 0) progress = 0; //진행률이 음수인 경우를 방지
		if (progress > 1) progress = 1; // 진행률이 1보다 큰 경우를 방지

		if (progress < 1) {
			//아직 애니메이션이 완료되지 않았으면, run메서드 다시 호출
			this.timer = requestAnimationFrame((time) => {
				this.run(time);
			});
		} else {
			//애니메이션이 완료되면 프레임 요청 취소 및 콜백함수 지정되어있으면 비동기적으로 콜백함수실행
			cancelAnimationFrame(this.timer);
			if (this.option.callback) {
				setTimeout(() => {
					this.option.callback();
				}, 0);
			}
		}
		//시작 값에서 목표값으로 진행률을 고려해서 얼마나 이동해야하는지 계산
		let result = this.currentValue + (this.option.value - this.currentValue) * progress;

		// result 값을 적절한 형태로 스타일에 설정해서 애니메이션의 현재 프레임에서의 값이 화면에 적용
		if (this.option.prop === 'opacity') {
			this.selector.style[this.option.prop] = result;
		} else if (this.option.prop === 'scroll') {
			window.scroll(0, result);
		} else if (this.isString == 'string') {
			this.selector.style[this.option.prop] = result + '%';
		} else {
			this.selector.style[this.option.prop] = result + 'px';
		}
	}
}
