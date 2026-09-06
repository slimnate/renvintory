export type SortableListOptions = {
	enabled?: boolean;
	onReorder: (orderedIds: string[]) => void;
};

type DragState = {
	pointerId: number;
	fromIndex: number;
	toIndex: number;
	startY: number;
	startScrollY: number;
	height: number;
	row: HTMLElement;
	lastClientY: number;
	scrollRaf: number;
};

function getRows(node: HTMLElement): HTMLElement[] {
	return Array.from(node.children).filter(
		(el): el is HTMLElement => el instanceof HTMLElement && Boolean(el.dataset.sortableId)
	);
}

function clearItemStyles(rows: HTMLElement[]) {
	for (const row of rows) {
		row.style.transform = '';
		row.style.transition = '';
		row.style.zIndex = '';
		row.style.position = '';
		row.style.boxShadow = '';
		row.style.background = '';
		row.removeAttribute('data-dragging-row');
	}
}

export function sortableList(node: HTMLElement, options: SortableListOptions) {
	let currentOptions = options;
	let drag: DragState | null = null;
	const previousPosition = node.style.position;
	const previousTouchAction = node.style.touchAction;
	if (!node.style.position) {
		node.style.position = 'relative';
	}

	function applyShift(fromIndex: number, toIndex: number, height: number, dragged: HTMLElement) {
		const rows = getRows(node);
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			if (!row || row === dragged) continue;
			let shift = 0;
			if (fromIndex < toIndex && i > fromIndex && i <= toIndex) {
				shift = -height;
			} else if (fromIndex > toIndex && i >= toIndex && i < fromIndex) {
				shift = height;
			}
			row.style.transition = 'transform 140ms ease';
			row.style.transform = shift ? `translateY(${shift}px)` : '';
		}
	}

	function targetIndexForY(clientY: number): number {
		const rows = getRows(node);
		if (rows.length === 0) return 0;
		const y = clientY - node.getBoundingClientRect().top;
		let index = 0;
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			if (!row) continue;
			const mid = row.offsetTop + row.offsetHeight / 2;
			if (y < mid) {
				return i;
			}
			index = i;
		}
		return index;
	}

	function dragOffsetY(clientY: number): number {
		if (!drag) return 0;
		return clientY - drag.startY + (window.scrollY - drag.startScrollY);
	}

	function tickAutoScroll() {
		if (!drag) return;
		const topMargin = 80;
		const bottomMargin = 148;
		const y = drag.lastClientY;
		let delta = 0;
		if (y < topMargin) {
			delta = Math.max(-18, (y - topMargin) / 3);
		} else if (y > window.innerHeight - bottomMargin) {
			delta = Math.min(18, (y - (window.innerHeight - bottomMargin)) / 3);
		}
		if (delta !== 0) {
			window.scrollBy(0, delta);
			drag.row.style.transition = 'none';
			drag.row.style.transform = `translateY(${dragOffsetY(drag.lastClientY)}px)`;
		}
		drag.scrollRaf = requestAnimationFrame(tickAutoScroll);
	}

	function unbindWindow() {
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerUp);
		window.removeEventListener('pointercancel', onPointerCancel);
	}

	function endDrag(cancelled: boolean) {
		if (!drag) return;
		const { pointerId, fromIndex, toIndex, row, scrollRaf } = drag;
		cancelAnimationFrame(scrollRaf);
		unbindWindow();
		try {
			if (row.hasPointerCapture(pointerId)) {
				row.releasePointerCapture(pointerId);
			}
		} catch {
			// Pointer capture may already be released.
		}

		const rows = getRows(node);
		const ids = rows
			.map((itemRow) => itemRow.dataset.sortableId)
			.filter((id): id is string => Boolean(id));
		clearItemStyles(rows);
		document.body.style.userSelect = '';
		document.body.style.cursor = '';
		document.body.style.overscrollBehavior = '';
		node.style.touchAction = previousTouchAction;
		node.removeAttribute('data-sorting');
		drag = null;

		if (cancelled || fromIndex === toIndex) return;

		const next = [...ids];
		const [moved] = next.splice(fromIndex, 1);
		if (!moved) return;
		next.splice(toIndex, 0, moved);
		currentOptions.onReorder(next);
	}

	function onPointerDown(event: PointerEvent) {
		if (!currentOptions.enabled) return;
		if (event.button !== 0) return;
		const target = event.target;
		if (!(target instanceof Element)) return;
		const handle = target.closest('[data-drag-handle]');
		if (!handle || !node.contains(handle)) return;
		const row = handle.closest('[data-sortable-id]');
		if (!(row instanceof HTMLElement) || !node.contains(row)) return;

		const rows = getRows(node);
		const fromIndex = rows.indexOf(row);
		if (fromIndex < 0 || rows.length < 2) return;

		event.preventDefault();
		event.stopPropagation();
		try {
			row.setPointerCapture(event.pointerId);
		} catch {
			// Untrusted/synthetic pointer events cannot capture; window listeners still track the drag.
		}
		document.body.style.userSelect = 'none';
		document.body.style.cursor = 'grabbing';
		document.body.style.overscrollBehavior = 'none';
		node.style.touchAction = 'none';
		node.setAttribute('data-sorting', 'true');
		row.setAttribute('data-dragging-row', 'true');
		row.style.position = 'relative';
		row.style.zIndex = '20';
		row.style.boxShadow = '0 8px 20px rgba(36, 26, 16, 0.28)';
		row.style.background = '#f7efdd';

		drag = {
			pointerId: event.pointerId,
			fromIndex,
			toIndex: fromIndex,
			startY: event.clientY,
			startScrollY: window.scrollY,
			height: row.offsetHeight,
			row,
			lastClientY: event.clientY,
			scrollRaf: requestAnimationFrame(tickAutoScroll)
		};

		window.addEventListener('pointermove', onPointerMove, { passive: false });
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerCancel);
	}

	function onPointerMove(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.pointerId) return;
		event.preventDefault();
		drag.lastClientY = event.clientY;
		drag.row.style.transition = 'none';
		drag.row.style.transform = `translateY(${dragOffsetY(event.clientY)}px)`;
		const nextIndex = targetIndexForY(event.clientY);
		if (nextIndex !== drag.toIndex) {
			drag.toIndex = nextIndex;
			applyShift(drag.fromIndex, drag.toIndex, drag.height, drag.row);
		}
	}

	function onPointerUp(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.pointerId) return;
		endDrag(false);
	}

	function onPointerCancel(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.pointerId) return;
		endDrag(true);
	}

	node.addEventListener('pointerdown', onPointerDown);

	return {
		update(newOptions: SortableListOptions) {
			currentOptions = newOptions;
			if (!currentOptions.enabled && drag) {
				endDrag(true);
			}
		},
		destroy() {
			if (drag) endDrag(true);
			unbindWindow();
			node.style.position = previousPosition;
			node.removeEventListener('pointerdown', onPointerDown);
		}
	};
}
