let START = new Date();
const STEP = 50;
const TICK_MS = 500;
const MAX_TIME_MS = 6000;
const COLOR_SCHEME = [
	'#FB000D',
	'#009D91',
	'#8AB32D'
];

const timelineTemplate = document.getElementById('timeline-template');

function createElementWithClass(className) {
	const element = document.createElement('div');

	element.classList.add(className);

	return element;
}

function createTimelineElement() {
	const element = timelineTemplate.content.cloneNode(true);
	return element.querySelector('.timeline');
}

function createEntryElement() {
	return createElementWithClass('entry');
}

function getTimeDiff() {
	return (new Date() - START) / TICK_MS;
}

function renderNext(value, timelineElement) {
	const newElement = createEntryElement();

	newElement.textContent = value;
	newElement.style.left = getTimeDiff() * STEP + 'px';

	timelineElement.appendChild(newElement);
}

function renderComplete(timelineElement) {
	timelineElement.style.width = getTimeDiff() * STEP + 'px';
	timelineElement.style.transitionDuration = '0s';
}

function setTimeline(parentElement) {
	parentElement.appendChild(createTimelineElement());

	const timelineElement = parentElement.lastElementChild;
	const index = (parentElement.childNodes.length - 1) % COLOR_SCHEME.length;

	// timelineElement.style.transitionDuration = MAX_TIME_MS + 'ms';
	timelineElement.style.color = COLOR_SCHEME[index];

	setTimeout(() => {
		timelineElement.style.width = '0px';
	}, 0);

	setTimeout(() => {
		timelineElement.style.width = (((MAX_TIME_MS) / TICK_MS) * STEP) + 'px';
	}, 100);


	parentElement.appendChild(timelineElement);

	return timelineElement;
}

function startStream(parentElement, input$, delay = 0) {
	const timelineElement = setTimeline(parentElement);

	const subscription = Rx.Observable.of(null)
		.delay(delay)
		.switchMap(() => input$)
		.takeUntil(Rx.Observable.of(null).delay(MAX_TIME_MS))
		.subscribe({
			next: (value) => {
				console.log('--- value', value);
				renderNext(value, timelineElement);
			},
		});

	const unsubscribe = subscription.unsubscribe;

	subscription.unsubscribe = function (...args) {
		renderComplete(timelineElement);

		unsubscribe.apply(this, args);
	};

	return subscription;
}

let isRunning = false;

function run(stepFn, btnElement) {
	if (isRunning) {
		return;
	}

	START = new Date();
	isRunning = true;
	btnElement.disabled = true;
	stepFn();

	setTimeout(() => {
		isRunning = false;
		btnElement.disabled = false;
	}, MAX_TIME_MS);
}
