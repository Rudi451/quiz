'use strict';

const nameSection = document.getElementById('name-section');
const timerRender = document.getElementById('time-loader-container');
const timerText = document.getElementById('time');
const resultsScreen = document.getElementsByClassName('result-container')[0];
const loaderSpin = document.getElementById('loaderSpin');
const questionContainer = document.getElementsByClassName('question-container')[0];
const nameInput = document.getElementById('nameInput');
const textElement = document.getElementById('textElement');
const resulttext_element = document.getElementById('text');
const nickname_result_text = document.getElementById('nickname_result_text');

let maxQuestionsNumber = null;
let currentQuestion = null;
let currentAnswer = null;
let currentUserAnswer = null;
const URL = 'http://wifi.1av.at/quiz.php';

const TIME = 8.7;

let timer = null;
let timerIsRunning = false;
let answerCounter = 0; // muss auf 0 stehen
let currentAnswerCounter = 0;

//
const text_variant = [
	`0 Punkte! Dein Quiz-Score ist so undefined wie eine Variable ohne Zuweisung. Zeit, das Debugging zu starten!`,
	`1 Punkt! Der Einstieg ist geschafft, wie ein console.log('Hello, World!');!`,
	`2 Punkte! Fast so zuverlässig wie ein if-Statement ohne else.`,
	`3 Punkte! Halb voll oder halb leer? Egal, Hauptsache du hast Spaß!`,
	`4 von 5 Punkten! Na, fast perfekt! Noch ein bisschen mehr Kaffee und du hast es!`,
	`5 Punkte! Du hast das Quiz wie ein echter try-catch-Profi gemeistert. Keine Fehler weit und breit`,
];
//

//button Restart
const restart = () => {
	timer = null;
	timerIsRunning = false;
	answerCounter = 0; // muss auf 0 stehen
	currentAnswerCounter = 0;
	getQuestion(maxQuestionsNumber);
	resultsScreen.style.display = 'none';
};
//________________________________________________
//beim name eingeben und enter gedrückt ist, startet der quiz
document.getElementById('nameSubmit').addEventListener('click', () => {
	nickname_result_text.innerText = nameInput.value;
	//nickname text stylen__
	const text = nameInput.value;
	textElement.innerHTML = '';

	for (let char of text) {
		const span = document.createElement('span');
		span.textContent = char;
		textElement.appendChild(span);
	}
	//_________________________
	quizStart();
});
//

const quizStart = () => {
	if (document.getElementById('nameInput').value) {
		//kommt eine frage
		if (maxQuestionsNumber) {
			getQuestion(maxQuestionsNumber);
		} else {
			console.log('There is no maxQuestionsNumber. Loading ... ');
			getNumberQuestions();
		}
		//question-container
	}
};
//quizStart() ___ ende

const getQuestion = (max) => {
	//todo:
	//wenn fünfte frage vorbei ist => kommt result container mit Sternen und zwei buttons => neu starten und teilen
	//______________________
	//early return pattern
	if (answerCounter > 4) {
		resultsScreen.style.display = 'grid';

		showStars(currentAnswerCounter);
		return;
	}
	//
	answerCounter += 1;
	nameSection.style.display = 'none';
	loaderSpin.style.display = 'block';
	timerRender.style.display = 'none';
	questionContainer.style.display = 'none';
	//
	timer = null;
	//formdata bilden
	const form = new FormData();
	form.append('type', 'getquestion');
	//hier kann man auch mit object an axios übergeben , dann muss man nur noch ein header übergeben und zwar mit Content Type von form element... siehe docs
	//
	currentQuestion = randomNumber(1, max);
	form.append('id', currentQuestion);

	//auf api posten
	axios
		.post(URL, form)
		.then((response) => {
			renderQuestion(response.data);
			getAnswer();
		})
		.catch((error) => {
			console.log('Error in the func getQuestion(): ', error);
		});
};
//getQuestion() ___ ende
const getNumberQuestions = () => {
	if (!maxQuestionsNumber) {
		//formdata bilden
		const form = new FormData();
		form.append('type', 'getcount');
		//auf api posten
		axios
			.post(URL, form)
			.then((response) => {
				//
				const {max} = response.data;
				maxQuestionsNumber = max;
				//getQuestion(maxQuestionsNumber);
			})
			.catch((error) => {
				console.log('Error ' + error);
			});
	}
};
// getNumberQuestion() __ ende

const renderQuestion = (data) => {
	loaderSpin.style.display = 'none';
	questionContainer.style.display = 'block';

	const {text, antworten} = data;
	let html = '';
	let i = 0;
	antworten.forEach((antwort) => {
		html += `<li id="${i++}"> ${antwort} </li>`;
	});
	document.getElementsByTagName('h4')[0].innerHTML = text;
	document.getElementsByTagName('ul')[0].innerHTML = html;

	i = 0;
	antworten.forEach((antwort) => {
		document.getElementById(`${i++}`).addEventListener('click', (event) => {
			currentUserAnswer = +event.target.id;

			handleUserAnswer(currentUserAnswer);
		});
	});
	questionContainer.addEventListener('animationend', () => {
		// timerTextRender();

		timerRender.style.display = 'block';
		clearTimeout(timer);
		handleTimer();
	});
};
//____________timer section _______________

const handleTimer = () => {
	//
	let sec = TIME;
	const startTimer = () => {
		if (sec > 0.1) {
			timer = setTimeout(startTimer, 100);
			sec -= 0.1;
			timerIsRunning = true;
			timerText.innerText = `${sec.toFixed(1)} s`;
		} else {
			//handeln: timer abgelaufen
			timerText.innerText = '0.0 s';
			timerIsRunning = false;
			const wrongMessage = document.getElementById('wrongMessage');
			wrongMessage.innerText = 'Zeit ist um';
			wrongMessage.classList.remove('hidden');
			wrongMessage.classList.add('visible');
			setTimeout(() => {
				getQuestion(maxQuestionsNumber);
				wrongMessage.classList.remove('visible');
				wrongMessage.classList.add('hidden');
				wrongMessage.innerText = 'Falsch!';
			}, 500);
		}
	};
	startTimer();
};

//______________timer section ende ____________
const handleUserAnswer = (answer) => {
	if (answer == currentAnswer) {
		const correctMessage = document.getElementById('correctMessage');
		correctMessage.classList.remove('hidden');
		correctMessage.classList.add('visible');

		setTimeout(function () {
			correctMessage.classList.remove('visible');
			correctMessage.classList.add('hidden');
		}, 500);
		currentAnswerCounter += 1;
	} else {
		const wrongMessage = document.getElementById('wrongMessage');
		wrongMessage.classList.remove('hidden');
		wrongMessage.classList.add('visible');
		setTimeout(function () {
			wrongMessage.classList.remove('visible');
			wrongMessage.classList.add('hidden');
		}, 500);
	}

	//zuerst Timer stoppen, dann nächste Question holen
	if (timerIsRunning) {
		clearTimeout(timer);
	}
	setTimeout(() => {
		getQuestion(maxQuestionsNumber);
	}, 500);
};
//
getNumberQuestions();
//___________________________________________________________________________________//
//renderQuestion() ____ ende
const getAnswer = () => {
	const form = new FormData();
	form.append('type', 'check');
	form.append('id', currentQuestion);
	//auf api posten
	axios
		.post(URL, form)
		.then((response) => {
			currentAnswer = response.data.correct;
		})
		.catch((error) => {
			console.log('Error in getAnswer() : ' + error);
		});
};
//
//_________Result screen handle section _______________
function showStars(score) {
	const stars = document.querySelectorAll('.star');
	//resulttext_element.style.display = 'none';
	resulttext_element.innerText = text_variant[score];

	for (let i = 0; i < score; i++) {
		setTimeout(() => {
			if (i >= 0) {
				stars[i].style.opacity = 1;
				showResultText(i);
			}
		}, (i + 1) * 500);
	}
	if (score < 5) {
		const lastStars = 5 - (5 - score);

		for (let j = lastStars; j < 5; j++) {
			stars[j].classList.add('empty');
			setTimeout(() => {
				stars[j].style.opacity = 1;
				showResultText(j);
			}, (j + 1) * 500);
		}
	}
}
const showResultText = (number) => {
	if (number === 3) {
		let targets = document.getElementById('wrapper');
		let wrapperStyle = wrapper.style;

		wrapperStyle.display = 'block';
		wrapperStyle.height = '0px';
		anime({
			targets,
			height: (el) => el.scrollHeight,
			opacity: [0, 1],
			duration: 800,
			easing: 'easeOutCubic',
		});
		//
	}
};

//_________end of resultscreen handle section _________
//_________Add button press effect on Enter key_________
document.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		document.getElementById('nameSubmit').style.backgroundColor = '#dddddd';
	}
});

document.addEventListener('keyup', (event) => {
	if (event.key === 'Enter') {
		document.getElementById('nameSubmit').style.backgroundColor = '';
		quizStart();
	}
});
//______________________________________________________
