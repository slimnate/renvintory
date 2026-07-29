/** Lock a scroll container to one axis per gesture (touch or wheel). */
export function axisLockScroll(node: HTMLElement) {
	type Axis = 'x' | 'y';

	let touchAxis: Axis | null = null;
	let startX = 0;
	let startY = 0;
	let startScrollLeft = 0;
	let startScrollTop = 0;

	let wheelAxis: Axis | null = null;
	let wheelReset: ReturnType<typeof setTimeout> | null = null;
	let wheelAccumX = 0;
	let wheelAccumY = 0;

	const TOUCH_THRESHOLD = 8;
	const WHEEL_THRESHOLD = 4;
	const previousTouchAction = node.style.touchAction;
	node.style.touchAction = 'none';

	function pickAxis(dx: number, dy: number): Axis {
		return Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
	}

	function onTouchStart(event: TouchEvent) {
		const touch = event.touches[0];
		if (!touch) return;
		touchAxis = null;
		startX = touch.clientX;
		startY = touch.clientY;
		startScrollLeft = node.scrollLeft;
		startScrollTop = node.scrollTop;
	}

	function onTouchMove(event: TouchEvent) {
		const touch = event.touches[0];
		if (!touch) return;

		// Stop native scrolling entirely; we drive scrollLeft/Top ourselves.
		event.preventDefault();

		const totalDx = touch.clientX - startX;
		const totalDy = touch.clientY - startY;

		if (!touchAxis) {
			if (Math.abs(totalDx) < TOUCH_THRESHOLD && Math.abs(totalDy) < TOUCH_THRESHOLD) {
				return;
			}
			touchAxis = pickAxis(totalDx, totalDy);
		}

		if (touchAxis === 'x') {
			node.scrollLeft = startScrollLeft - totalDx;
			node.scrollTop = startScrollTop;
		} else {
			node.scrollTop = startScrollTop - totalDy;
			node.scrollLeft = startScrollLeft;
		}
	}

	function onTouchEnd() {
		touchAxis = null;
	}

	function onWheel(event: WheelEvent) {
		let deltaX = event.deltaX;
		let deltaY = event.deltaY;

		if (event.shiftKey && deltaX === 0 && deltaY !== 0) {
			deltaX = deltaY;
			deltaY = 0;
		}

		const absX = Math.abs(deltaX);
		const absY = Math.abs(deltaY);
		if (absX < 0.5 && absY < 0.5) return;

		event.preventDefault();

		if (wheelReset) clearTimeout(wheelReset);
		wheelReset = setTimeout(() => {
			wheelAxis = null;
			wheelAccumX = 0;
			wheelAccumY = 0;
			wheelReset = null;
		}, 160);

		if (!wheelAxis) {
			wheelAccumX += deltaX;
			wheelAccumY += deltaY;
			if (
				Math.abs(wheelAccumX) < WHEEL_THRESHOLD &&
				Math.abs(wheelAccumY) < WHEEL_THRESHOLD
			) {
				return;
			}
			wheelAxis = pickAxis(wheelAccumX, wheelAccumY);
		}

		if (wheelAxis === 'x') {
			node.scrollLeft += deltaX;
		} else {
			node.scrollTop += deltaY;
		}
	}

	node.addEventListener('touchstart', onTouchStart, { passive: true });
	node.addEventListener('touchmove', onTouchMove, { passive: false });
	node.addEventListener('touchend', onTouchEnd);
	node.addEventListener('touchcancel', onTouchEnd);
	node.addEventListener('wheel', onWheel, { passive: false });

	return {
		destroy() {
			node.style.touchAction = previousTouchAction;
			node.removeEventListener('touchstart', onTouchStart);
			node.removeEventListener('touchmove', onTouchMove);
			node.removeEventListener('touchend', onTouchEnd);
			node.removeEventListener('touchcancel', onTouchEnd);
			node.removeEventListener('wheel', onWheel);
			if (wheelReset) clearTimeout(wheelReset);
		}
	};
}
