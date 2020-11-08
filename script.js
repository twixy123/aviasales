const formSearch = document.querySelector('.form-search'),
	inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
	dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
	inputCitiesTo = formSearch.querySelector('.input__cities-to'),
	dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
	inputDateDepart = formSearch.querySelector('.input__date-depart'),
	buttonSearch = formSearch.querySelector('.button__search'),
	cheapestTicket = document.getElementById('cheapest-ticket'),
	otherCheapTickets = document.getElementById('other-cheap-tickets')

const citiesAPI = 'https://api.travelpayouts.com/data/ru/cities.json',
	placeholderJSON = 'https://jsonplaceholder.typicode.com/todos/1',
	proxy = 'https://cors-anywhere.herokuapp.com/',
	API_KEY = '03f8a457b1fbf141cb942cea6276a964', //  https://www.travelpayouts.com/programs/100/tools/api - от сюда взял ключ
	calendar = 'http://min-prices.aviasales.ru/calendar_preload',
	limitCard = 10

let city = []

const getData = (url, callback) => {
	const request = new XMLHttpRequest() // Обозначаем новую Функцию-Объект

	// Объект XMLHttpRequest имеет свои состояние их 5:
	// 0 UNSENT Объект был создан.Метод open() ещё не вызывался.
	// 1 OPENED Метод open() был вызван.
	// 2 HEADERS_RECEIVED Метод send() был вызван, доступны заголовки(headers) и статус.
	// 3 LOADING Загрузка;
	// responseText содержит частичные данные.
	// 4 DONE Операция полностью завершена.

	// Так же XMLHttpRequest имеет состояние HTTP ответа (пример 404 страница не найдена) и оптимальный статус для GET запроса это статус 200
	// не отправленj - 0
	// открылся - 0
	// загружается - 200
	// завершшился - 200

	request.open('GET', url) //запрашиваем данные по url

	request.addEventListener('readystatechange', () => { // событие readystatechange реагирует на изменение статуса XMLHttpRequest
		if (request.readyState !== 4) return // в свойсве readyState содержится статус XMLHttpRequest 

		if (request.status === 200) { // проверяем на состояние
			callback(request.response) // функция callback которая передает данные в JSON объектк
		} else {
			console.error(request.status) // если состояние другое то проверяем какое
		}
	})

	request.send()
}

const showCity = (input, listMenu) => { // Функция для realTime поиска городов
	listMenu.textContent = '' //Каждый раз при вводе буквы чистием весь ul

	if (input.value === '') return //Классный способ, надо запомнить. яесли строка пустая то мы просто возвращаем функцию.

	const filterCity = city.filter((el) => { // filter отдает новый массив с найденным значениями или если значения не совпадают то отдает пустой массив, главное правило в конце return должен вернуть true, и если у него true то он вернет текущий "el"

		const fixEl = el.name.toLowerCase() // передaем города        

		return fixEl.startsWith(input.value.toLowerCase()) //возвращаем города в массиве если буквы городов совпадают со значением value  

	})

	const sortFilter = []; //создали пустой массив

	filterCity.forEach(e => sortFilter.push(e.name)) // пушим в этот массив имена городов

	sortFilter.sort().forEach(e => { // Перебираем отсортированный от меньшего к большему полученный массив - "е" это города
		const li = document.createElement('li') // создаем эллемент li
		li.classList.add('dropdown__city') // Присваиваем ему класс 
		li.textContent = e // Присваиваем ему контентный текст - это наши города
		listMenu.append(li) // рисуем его в ul
	})
}

const clickCity = (cityName, input, listMenu) => { //cityName создаем в прослушке эллемента. Функция для добавления городов в инпут
	listMenu.textContent = '' // каждый раз при выборе города список чистиется
	if (cityName.nodeName.toUpperCase() === 'LI') { // у всех эллементов есть название тэга и оно в upperCase во многих браузерах
		input.value = cityName.textContent // присваиваем инпуту значение выбранного города
	}
}

const getNameCity = (code) => {
	const objCity = city.find(item => item.code === code)
	return objCity.name
}

const getDateTicket = (date) => {
	return new Date(date).toLocaleString('ru', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

const getLinkAviasales = data => {
	// SVX2905KGD1
	let link = 'https://www.aviasales.ru/search/' //переменная URL

	link += data.origin // прибавляем к ней код из какого города мы летим

	const date = new Date(data.depart_date) // создали переменную и засунули в нее общий Объект date и передали в него нашу дату

	const day = date.getDate() // получили из этого общего объекта число если число с 1 по 9 то оно выводится 1,2,3... а нам нужно 01,02,03... 
	link += day < 10 ? '0' + day : day //что бы добавить 0 используем тернарный оператор и конкотенируем к URL строке

	const month = date.getMonth() + 1 // получили из этого общего объекта месяц и прибавили один потому что месяц Январь это 0
	link += month < 10 ? '0' + month : month

	link += data.destination // прибавили к URL код в какую страну летим

	// в конце поисковой строки передается в цифрах количество людей - 241 - т.е. двое взрослых четверо детей до двеннадцати и один ребенок до трех
	return link + '1'
}

const getChanges = (number) => {
	if (number) {
		return number === 1 ? 'С одной пересадкой' : 'С двумя пересадками'
	} else {
		return 'Без пересадок'
	}
}

const createCard = (data) => { // приходит массив с билетом который подходит для выбранной нами датой
	// actual: true
	// depart_date: "2020-09-28"
	// destination: "TAS"
	// distance: 2799
	// found_at: "2020-04-15T11:00:32"
	// gate: "Utair"
	// number_of_changes: 0
	// origin: "MOW"
	// return_date: null
	// show_to_affiliates: false
	// trip_class: 0
	// value: 9180
	// Если приходит, то приходит примерно такой объект

	const ticket = document.createElement('article')
	ticket.classList.add('ticket')

	let deep = ''

	if (data) { // если все таки массив пришел с данными приходит true и дальше верстаем
		deep = `
		<h3 class="agent">${data.gate}</h3>
		<div class="ticket__wrapper">
			<div class="left-side">
				<a href="${getLinkAviasales(data)}" target="_blank" class="button button__buy">Купить за ${Math.ceil(data.value * 136)} сум</a>
			</div>
			<div class="right-side">
				<div class="block-left">
					<div class="city__from">Вылет из города:
						<span class="city__name">${getNameCity(data.origin)}</span>
					</div>
					<div class="date">${getDateTicket(data.depart_date)}</div>
				</div>

				<div class="block-right">
					<div class="changes">${getChanges(data.number_of_changes)}</div>
					<div class="city__to">Город назначения:
						<span class="city__name">${getNameCity(data.destination)}</span>
					</div>
				</div>
			</div>
		</div>
`
	} else {
		deep = '<h3>К сожалению билетов на текующую дату не нашлось!</h3>'
	}

	ticket.insertAdjacentHTML('afterbegin', deep)

	return ticket
}

const renderCheapYear = (cheapTickets) => {
	cheapTickets.sort((a, b) => a.value - b.value) // метод sort берет эллемент а и сравнивает с b и таким образом в эллеменете а есть наши value code origin и так далее

	for (let i = 0; i < limitCard && i < cheapTickets.length; i++) {
		const ticket = createCard(cheapTickets[i])
		otherCheapTickets.append(ticket)
	}
	console.log(cheapTickets)
}

const renderCheapDay = (cheapTicket) => { //cheapTicket мы берем из функции renderCheap. В cheapTicket приходит всегда массив только с одним ключом или вообще без ключей, и вот мы в createCard передаем именно первый ключ
	const ticket = createCard(cheapTicket[0])
	cheapestTicket.append(ticket)
}

const renderCheap = (data, date) => { // берем данные из formSearch
	const cheapTicketsYear = data.best_prices //создали массив с билетами

	const cheapTicketDay = cheapTicketsYear.filter(item => item.depart_date === date) //создали массив с билетом который будет совпадать с нашей выбранной датой

	renderCheapYear(cheapTicketsYear)

	renderCheapDay(cheapTicketDay)
}

inputCitiesFrom.addEventListener('input', () => {
	showCity(inputCitiesFrom, dropdownCitiesFrom)
})

inputCitiesTo.addEventListener('input', () => {
	showCity(inputCitiesTo, dropdownCitiesTo)
})

dropdownCitiesFrom.addEventListener('click', (e) => { // "е" это прослушиваемый эллемент и его свойства
	const cityName = e.toElement // toElement вернет <li class="dropdown__city">Ташкент</li>, да и вообще стоит посмотреть что возвращает "e", можно много че найти
	clickCity(cityName, inputCitiesFrom, dropdownCitiesFrom)
})

dropdownCitiesTo.addEventListener('click', (e) => { // "е" это прослушиваемый эллемент и его свойства
	const cityName = e.toElement // toElement вернет <li class="dropdown__city">Ташкент</li>, да и вообще стоит посмотреть что возвращает "e", можно много че найти
	clickCity(cityName, inputCitiesTo, dropdownCitiesTo)
})

formSearch.addEventListener('submit', e => { // submit событие на отправку
	e.preventDefault()

	cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>' // Чистием наши билеты
	otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>'

	const formData = { // создаем объект просто для удобства
		from: city.find(item => inputCitiesFrom.value.toLowerCase() === item.name.toLowerCase()), // метод find тоже пробегает по массиву и если условие совпаедет он вернет только один эллемент тот что нашел, но именно он вернет вот этот весь item а не item.name 
		to: city.find(item => inputCitiesTo.value.toLowerCase() === item.name.toLowerCase()),
		when: inputDateDepart.value
	}

	if (formData.from && formData.to) { // Это проверка на ошибки, если введенные в инпут данные не совподают с данными из обьекта то приходит undefined, а undefined это false. Вот здесь мы и проверяем если совпадает то это true.
		const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true`

		getData(calendar + requestData, data => renderCheap(JSON.parse(data), formData.when))
	} else {
		alert("Введите корректное название города")
	}

})


getData(proxy + citiesAPI, data => city = JSON.parse(data).filter(item => item.name)) //в первый параметр передаем url, а потом callback функцию которая возвращает нам JSON объект из функции getData. После в объект city присваиваем эллементы этой data т.е. callback функции. И при этом изначально парсим json в обычный объект.


// getData(proxy + calendar + '?depart_date=2020-05-29&origin=SVX&destination=KGD&one_way=true&token=' + API_KEY, data => {
//     const cheapTicket = JSON.parse(data).best_prices.filter(item => item.depart_date == '2020-05-29')
//     console.log(cheapTicket)    
// })
