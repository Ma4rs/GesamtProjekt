let token = localStorage.getItem("token");

async function fetchBankValue() {
	try {
		const userData = await axios.get(`http://${window.location.hostname}:5105/api/user/getData`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		return Number(userData.data.credits);
	} catch (error) {
		console.log("Fehler beim Laden des Bankwerts: ", error);
		return 0;
	}
}

async function safeBankvalue(gameResultsum) {
	try {
		const body = {
			"creditsToAdd": gameResultsum
		};
		console.log("Es werden " + gameResultsum + " Credits hinzugefügt")
		const response = await axios.post(`http://${window.location.hostname}:5105/api/user/updateCredits`, body, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (response.status == 200) {
			// Erfolg
		} else {
			console.log("Antwort ungültig:", response);
		}
	} catch (error) {
		console.log("Fehler beim Speichern des Bankwerts: ", error);
	}
}

async function GetSpin() {
	try {
		const response = await axios.get(`http://${window.location.hostname}:5105/api/roulette/spin`);
		return Number(response.data);
	} catch (error) {
		console.log("Fehler beim Laden des Spins: ", error);
		return -1;
	}
}

async function main() {
	let bankValue = await fetchBankValue();
	let currentBet = 0;
	let wager = 5;
	let lastWager = 0;
	let bet = [];
	let numbersBet = [];
	let previousNumbers = [];

	let numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
	let wheelnumbersAC = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

	let container = document.createElement('div');
	container.setAttribute('id', 'container');
	document.body.append(container);

	let wheel = null;
	let ballTrack = null;

	function startGame() {
		buildWheel();
		wheel = document.getElementsByClassName('wheel')[0];
		ballTrack = document.getElementsByClassName('ballTrack')[0];
		buildBettingBoard();
	}

	function gameOver() {
		let notification = document.createElement('div');
		notification.setAttribute('id', 'notification');
		let nSpan = document.createElement('span');
		nSpan.setAttribute('class', 'nSpan');
		nSpan.innerText = 'Keine Credits mehr';
		notification.append(nSpan);

		let nBtn = document.createElement('div');
		nBtn.setAttribute('class', 'nBtn');
		nBtn.innerText = 'Kaufe mehr Credits';
		nBtn.onclick = function () {
			window.top.location.href = '../Interface/credits.html';
		};
		notification.append(nBtn);
		container.prepend(notification);
	}

	function buildWheel() {
		let wheelDiv = document.createElement('div');
		wheelDiv.setAttribute('class', 'wheel');

		let outerRim = document.createElement('div');
		outerRim.setAttribute('class', 'outerRim');
		wheelDiv.append(outerRim);

		let numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

		for (let i = 0; i < numbers.length; i++) {
			let a = i + 1;
			let spanClass = (numbers[i] < 10) ? 'single' : 'double';

			let sect = document.createElement('div');
			sect.setAttribute('id', 'sect' + a);
			sect.setAttribute('class', 'sect');

			let span = document.createElement('span');
			span.setAttribute('class', spanClass);
			span.innerText = numbers[i];
			sect.append(span);

			let block = document.createElement('div');
			block.setAttribute('class', 'block');
			sect.append(block);

			wheelDiv.append(sect);
		}

		let pocketsRim = document.createElement('div');
		pocketsRim.setAttribute('class', 'pocketsRim');
		wheelDiv.append(pocketsRim);

		let ballTrackDiv = document.createElement('div');
		ballTrackDiv.setAttribute('class', 'ballTrack');

		let ball = document.createElement('div');
		ball.setAttribute('class', 'ball');
		ballTrackDiv.append(ball);

		wheelDiv.append(ballTrackDiv);

		let pockets = document.createElement('div');
		pockets.setAttribute('class', 'pockets');
		wheelDiv.append(pockets);

		let cone = document.createElement('div');
		cone.setAttribute('class', 'cone');
		wheelDiv.append(cone);

		let turret = document.createElement('div');
		turret.setAttribute('class', 'turret');
		wheelDiv.append(turret);

		let turretHandle = document.createElement('div');
		turretHandle.setAttribute('class', 'turretHandle');

		let thendOne = document.createElement('div');
		thendOne.setAttribute('class', 'thendOne');
		turretHandle.append(thendOne);

		let thendTwo = document.createElement('div');
		thendTwo.setAttribute('class', 'thendTwo');
		turretHandle.append(thendTwo);

		wheelDiv.append(turretHandle);

		container.append(wheelDiv);
	}


	async function buildBettingBoard() {
		let bettingBoard = document.createElement('div');
		bettingBoard.setAttribute('id', 'betting_board');

		let wl = document.createElement('div');
		wl.setAttribute('class', 'winning_lines');

		// Double street bets
		let wlttb = document.createElement('div');
		wlttb.setAttribute('id', 'wlttb_top');
		wlttb.setAttribute('class', 'wlttb');
		for (let i = 0; i < 11; i++) {
			let j = i;

			let ttbbetblock = document.createElement('div');
			ttbbetblock.setAttribute('class', 'ttbbetblock');

			let numA = (1 + (3 * j));
			let numB = (2 + (3 * j));
			let numC = (3 + (3 * j));
			let numD = (4 + (3 * j));
			let numE = (5 + (3 * j));
			let numF = (6 + (3 * j));
			let num = numA + ', ' + numB + ', ' + numC + ', ' + numD + ', ' + numE + ', ' + numF;
			let objType = 'double_street';

			ttbbetblock.onclick = function () {
				setBet(this, num, objType, 5);
			};

			ttbbetblock.oncontextmenu = function (e) {
				e.preventDefault();
				removeBet(this, num, objType, 5);
			};
			wlttb.append(ttbbetblock);
		}
		wl.append(wlttb);


		// Splits and streets
		for (let c = 1; c < 4; c++) {
			let d = c;
			let wlttb = document.createElement('div');
			wlttb.setAttribute('id', 'wlttb_' + c);
			wlttb.setAttribute('class', 'wlttb');
			for (let i = 0; i < 12; i++) {
				let j = i;
				let ttbbetblock = document.createElement('div');
				ttbbetblock.setAttribute('class', 'ttbbetblock');

				ttbbetblock.onclick = function () {
					let numA, numB, numC, num;
					if (d == 1 || d == 2) {
						numA = ((2 - (d - 1)) + (3 * j));
						numB = ((3 - (d - 1)) + (3 * j));
						num = numA + ', ' + numB;
					}
					else {
						numA = (1 + (3 * j));
						numB = (2 + (3 * j));
						numC = (3 + (3 * j));
						num = numA + ', ' + numB + ', ' + numC;
					}
					let objType = (d == 3) ? 'street' : 'split';
					let odd = (d == 3) ? 11 : 17;
					setBet(this, num, objType, odd);
				};
				ttbbetblock.oncontextmenu = function (e) {
					e.preventDefault();
					let numA, numB, numC, num;
					if (d == 1 || d == 2) {
						numA = ((2 - (d - 1)) + (3 * j));
						numB = ((3 - (d - 1)) + (3 * j));
						num = numA + ', ' + numB;
					}
					else {
						numA = (1 + (3 * j));
						numB = (2 + (3 * j));
						numC = (3 + (3 * j));
						num = numA + ', ' + numB + ', ' + numC;
					}
					let objType = (d == 3) ? 'street' : 'split';
					let odd = (d == 3) ? 11 : 17;
					removeBet(this, num, objType, odd);
				};
				wlttb.append(ttbbetblock);
			}
			wl.append(wlttb);
		}

		// Vertical splits
		for (let c = 1; c < 12; c++) {
			let d = c;
			let wlrtl = document.createElement('div');
			wlrtl.setAttribute('id', 'wlrtl_' + c);
			wlrtl.setAttribute('class', 'wlrtl');

			for (let i = 1; i < 4; i++) {
				let j = i;
				let rtlbb = document.createElement('div');
				rtlbb.setAttribute('class', 'rtlbb' + i);

				let numA = (3 + (3 * (d - 1))) - (j - 1);
				let numB = (6 + (3 * (d - 1))) - (j - 1);
				let num = numA + ', ' + numB;

				rtlbb.onclick = function () {
					setBet(this, num, 'split', 17);
				};
				rtlbb.oncontextmenu = function (e) {
					e.preventDefault();
					removeBet(this, num, 'split', 17);
				};
				wlrtl.append(rtlbb);
			}
			wl.append(wlrtl);
		}

		// Corner bets
		for (let c = 1; c < 3; c++) {
			let wlcb = document.createElement('div');
			wlcb.setAttribute('id', 'wlcb_' + c);
			wlcb.setAttribute('class', 'wlcb');

			for (let i = 1; i < 12; i++) {
				let count = (c == 1) ? i : i + 11;
				let cbbb = document.createElement('div');
				cbbb.setAttribute('id', 'cbbb_' + count);
				cbbb.setAttribute('class', 'cbbb');

				let numA = '2';
				let numB = '3';
				let numC = '5';
				let numD = '6';
				let num = (count >= 1 && count < 12) ? (parseInt(numA) + ((count - 1) * 3)) + ', ' + (parseInt(numB) + ((count - 1) * 3)) + ', ' + (parseInt(numC) + ((count - 1) * 3)) + ', ' + (parseInt(numD) + ((count - 1) * 3)) : ((parseInt(numA) - 1) + ((count - 12) * 3)) + ', ' + ((parseInt(numB) - 1) + ((count - 12) * 3)) + ', ' + ((parseInt(numC) - 1) + ((count - 12) * 3)) + ', ' + ((parseInt(numD) - 1) + ((count - 12) * 3));
				let objType = 'corner_bet';

				cbbb.onclick = function () {
					setBet(this, num, objType, 8);
				};
				cbbb.oncontextmenu = function (e) {
					e.preventDefault();
					removeBet(this, num, objType, 8);
				};
				wlcb.append(cbbb);
			}
			wl.append(wlcb);
		}

		bettingBoard.append(wl);

		// Outside bets: 1-18 and 19-36
		let bbtop = document.createElement('div');
		bbtop.setAttribute('class', 'bbtop');
		let bbtopBlocks = ['1 to 18', '19 to 36'];

		for (let i = 0; i < bbtopBlocks.length; i++) {
			let f = i;
			let bbtoptwo = document.createElement('div');
			bbtoptwo.setAttribute('class', 'bbtoptwo');
			let num = (f == 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18' : '19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36';
			let objType = (f == 0) ? 'outside_low' : 'outside_high';
			bbtoptwo.onclick = function () {
				setBet(this, num, objType, 1);
			};
			bbtoptwo.oncontextmenu = function (e) {
				e.preventDefault();
				removeBet(this, num, objType, 1);
			};
			bbtoptwo.innerText = bbtopBlocks[i];
			bbtop.append(bbtoptwo);
		}
		bettingBoard.append(bbtop);

		let numberBoard = document.createElement('div');
		numberBoard.setAttribute('class', 'number_board');

		let zero = document.createElement('div');
		zero.setAttribute('class', 'number_0');
		let zeroType = 'zero';
		let zeroOdds = 35;
		zero.onclick = function () {
			setBet(this, '0', zeroType, zeroOdds);
		};
		zero.oncontextmenu = function (e) {
			e.preventDefault();
			removeBet(this, '0', zeroType, zeroOdds);
		};
		let nbnz = document.createElement('div');
		nbnz.setAttribute('class', 'nbn');
		nbnz.innerText = '0';
		zero.append(nbnz);
		numberBoard.append(zero);

		let numberBlocks = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, '2 to 1', 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, '2 to 1', 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, '2 to 1'];
		let redBlocks = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
		for (let i = 0; i < numberBlocks.length; i++) {
			let a = i;
			let nbClass = (numberBlocks[i] == '2 to 1') ? 'tt1_block' : 'number_block';
			let colourClass = (redBlocks.includes(numberBlocks[i])) ? ' redNum' : ((nbClass == 'number_block') ? ' blackNum' : '');
			let numberBlock = document.createElement('div');
			numberBlock.setAttribute('class', nbClass + colourClass);
			numberBlock.onclick = function () {
				if (numberBlocks[a] != '2 to 1') {
					setBet(this, '' + numberBlocks[a] + '', 'inside_whole', 35);
				} else {
					let num = (a == 12) ? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : ((a == 25) ? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
					setBet(this, num, 'outside_column', 2);
				}
			};
			numberBlock.oncontextmenu = function (e) {
				e.preventDefault();
				if (numberBlocks[a] != '2 to 1') {
					removeBet(this, '' + numberBlocks[a] + '', 'inside_whole', 35);
				} else {
					let num = (a == 12) ? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : ((a == 25) ? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
					removeBet(this, num, 'outside_column', 2);
				}
			};
			let nbn = document.createElement('div');
			nbn.setAttribute('class', 'nbn');
			nbn.innerText = numberBlocks[i];
			numberBlock.append(nbn);
			numberBoard.append(numberBlock);
		}
		bettingBoard.append(numberBoard);

		let bo3Board = document.createElement('div');
		bo3Board.setAttribute('class', 'bo3_board');
		let bo3Blocks = ['1 to 12', '13 to 24', '25 to 36'];
		for (let i = 0; i < bo3Blocks.length; i++) {
			let b = i;
			let bo3Block = document.createElement('div');
			bo3Block.setAttribute('class', 'bo3_block');
			bo3Block.onclick = function () {
				let num = (b == 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : ((b == 1) ? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
				setBet(this, num, 'outside_dozen', 2);
			};
			bo3Block.oncontextmenu = function (e) {
				e.preventDefault();
				let num = (b == 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : ((b == 1) ? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
				removeBet(this, num, 'outside_dozen', 2);
			};
			bo3Block.innerText = bo3Blocks[i];
			bo3Board.append(bo3Block);
		}
		bettingBoard.append(bo3Board);

		let otoBoard = document.createElement('div');
		otoBoard.setAttribute('class', 'oto_board');
		let otoBlocks = ['EVEN', 'RED', 'BLACK', 'ODD'];
		for (let i = 0; i < otoBlocks.length; i++) {
			let d = i;
			let colourClass = (otoBlocks[i] == 'RED') ? ' redNum' : ((otoBlocks[i] == 'BLACK') ? ' blackNum' : '');
			let otoBlock = document.createElement('div');
			otoBlock.setAttribute('class', 'oto_block' + colourClass);
			otoBlock.onclick = function () {
				let num = (d == 0) ? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : ((d == 1) ? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : ((d == 2) ? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
				setBet(this, num, 'outside_oerb', 1);
			};
			otoBlock.oncontextmenu = function (e) {
				let num = (d == 0) ? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : ((d == 1) ? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : ((d == 2) ? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
				e.preventDefault();
				removeBet(this, num, 'outside_oerb', 1);
			};
			otoBlock.innerText = otoBlocks[i];
			otoBoard.append(otoBlock);
		}
		bettingBoard.append(otoBoard);

		let chipDeck = document.createElement('div');
		chipDeck.setAttribute('class', 'chipDeck');
		let chipValues = [1, 5, 10, 100, 'All', 'clear'];
		for (let i = 0; i < chipValues.length; i++) {
			let cvi = i;
			let chipColour = (i == 0) ? 'red' : ((i == 1) ? 'blue cdChipActive' : ((i == 2) ? 'orange' : ((i == 3) ? 'gold' : ((i == 4) ? 'black' : 'clearBet'))));
			let chip = document.createElement('div');
			chip.setAttribute('class', 'cdChip ' + chipColour);
			chip.onclick = async function () {
				if (cvi !== 5) {
					let cdChipActive = document.getElementsByClassName('cdChipActive');
					for (let k = 0; k < cdChipActive.length; k++) {
						cdChipActive[k].classList.remove('cdChipActive');
					}
					let curClass = this.getAttribute('class');
					if (!curClass.includes('cdChipActive')) {
						this.setAttribute('class', curClass + ' cdChipActive');
					}
					wager = parseInt(chip.childNodes[0].innerText);
					if (cvi === 4) {
						wager = bankValue;
					}
				} else {
					bankValue = bankValue + currentBet;
					currentBet = 0;
					document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
					document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
					clearBet();
					removeChips();
				}
			};
			let chipSpan = document.createElement('span');
			chipSpan.setAttribute('class', 'cdChipSpan');
			chipSpan.innerText = chipValues[i];
			chip.append(chipSpan);
			chipDeck.append(chip);
		}
		bettingBoard.append(chipDeck);

		let bankContainer = document.createElement('div');
		bankContainer.setAttribute('class', 'bankContainer');

		let bank = document.createElement('div');
		bank.setAttribute('class', 'bank');
		let bankSpan = document.createElement('span');
		bankSpan.setAttribute('id', 'bankSpan');
		bankSpan.innerText = '' + bankValue.toLocaleString("en-GB") + '';
		bank.append(bankSpan);
		bankContainer.append(bank);

		let betEl = document.createElement('div');
		betEl.setAttribute('class', 'bet');
		let betSpan = document.createElement('span');
		betSpan.setAttribute('id', 'betSpan');
		betSpan.innerText = '' + currentBet.toLocaleString("en-GB") + '';
		betEl.append(betSpan);
		bankContainer.append(betEl);
		bettingBoard.append(bankContainer);

		let pnBlock = document.createElement('div');
		pnBlock.setAttribute('class', 'pnBlock');
		let pnContent = document.createElement('div');
		pnContent.setAttribute('id', 'pnContent');
		pnContent.onwheel = function (e) {
			e.preventDefault();
			pnContent.scrollLeft += e.deltaY;
		};
		pnBlock.append(pnContent);
		bettingBoard.append(pnBlock);

		container.append(bettingBoard);
	}

	function clearBet() {
		bet = [];
		numbersBet = [];
	}

	async function setBet(e, n, t, o) {
		lastWager = wager;
		wager = (bankValue < wager) ? bankValue : wager;
		if (wager > 0) {
			if (!container.querySelector('.spinBtn')) {
				let spinBtn = document.createElement('div');
				spinBtn.setAttribute('class', 'spinBtn');
				spinBtn.innerText = 'spin';
				spinBtn.onclick = function () {
					this.remove();
					spin();
				};
				container.append(spinBtn);
			}
			bankValue = bankValue - wager;
			currentBet = currentBet + wager;
			document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
			document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
			for (let i = 0; i < bet.length; i++) {
				if (bet[i].numbers == n && bet[i].type == t) {
					bet[i].amt = bet[i].amt + wager;
					let chipColour = (bet[i].amt < 5) ? 'red' : ((bet[i].amt < 10) ? 'blue' : ((bet[i].amt < 100) ? 'orange' : 'gold'));
					e.querySelector('.chip').style.cssText = '';
					e.querySelector('.chip').setAttribute('class', 'chip ' + chipColour);
					let chipSpan = e.querySelector('.chipSpan');
					chipSpan.innerText = bet[i].amt;
					return;
				}
			}
			let obj = {
				amt: wager,
				type: t,
				odds: o,
				numbers: n
			};
			bet.push(obj);

			let numArray = n.split(',').map(Number);
			for (let i = 0; i < numArray.length; i++) {
				if (!numbersBet.includes(numArray[i])) {
					numbersBet.push(numArray[i]);
				}
			}

			if (!e.querySelector('.chip')) {
				let chipColour = (wager < 5) ? 'red' : ((wager < 10) ? 'blue' : ((wager < 100) ? 'orange' : 'gold'));
				let chip = document.createElement('div');
				chip.setAttribute('class', 'chip ' + chipColour);
				let chipSpan = document.createElement('span');
				chipSpan.setAttribute('class', 'chipSpan');
				chipSpan.innerText = wager;
				chip.append(chipSpan);
				e.append(chip);
			}
		}
	}

	async function spin() {
		blockiereKlicks();
		let cdChipActive = document.getElementsByClassName('cdChipActive');
		for (let i = 0; i < cdChipActive.length; i++) {
			cdChipActive[i].classList.remove('cdChipActive');
		}
		const clearBtn = document.querySelector('.cdChip.clearBet');
		if (clearBtn) clearBtn.style.display = 'none';
		let winningSpin = await GetSpin();

		if (winningSpin === -1) {
			alert("Fehler beim Spin. Bitte erneut versuchen.");
			let spinBtn = document.createElement('div');
			spinBtn.setAttribute('class', 'spinBtn');
			spinBtn.innerText = 'spin';
			spinBtn.onclick = function () {
				this.remove();
				spin();
			};
			container.append(spinBtn);
			erlaubeKlicks();
			if (clearBtn) clearBtn.style.display = '';
			return;
		}

		console.log(winningSpin)
		spinWheel(winningSpin);
		setTimeout(async function () {
			let winValue = 0;
			let losingBetTotal = 0;
			let winningBetTotal = 0;

			for (let i = 0; i < bet.length; i++) {
				let numArray = bet[i].numbers.split(',').map(Number);
				if (numArray.includes(winningSpin)) {
					winValue = winValue + (bet[i].odds * bet[i].amt);
					winningBetTotal = winningBetTotal + bet[i].amt;
				} else {
					losingBetTotal = losingBetTotal + bet[i].amt;
				}
			}

			if (winValue > 0) {
				bankValue = await fetchBankValue();
				let netResult = winValue - losingBetTotal;
				await safeBankvalue(netResult);
				win(winningSpin, winValue, winningBetTotal);
			} else {
				let totalLoss = 0;
				for (let i = 0; i < bet.length; i++) {
					totalLoss = totalLoss + bet[i].amt;
				}
				await safeBankvalue(totalLoss * -1);
			}

			currentBet = 0;
			bankValue = await fetchBankValue();
			document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
			document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';

			let pnClass = (numRed.includes(winningSpin)) ? 'pnRed' : ((winningSpin == 0) ? 'pnGreen' : 'pnBlack');
			let pnContent = document.getElementById('pnContent');
			let pnSpan = document.createElement('span');
			pnSpan.setAttribute('class', pnClass);
			pnSpan.innerText = winningSpin;
			pnContent.append(pnSpan);
			pnContent.scrollLeft = pnContent.scrollWidth;

			bet = [];
			numbersBet = [];
			removeChips();
			wager = lastWager;
			if (bankValue == 0 && currentBet == 0) {
				gameOver();
			}
			if (clearBtn) clearBtn.style.display = '';
			erlaubeKlicks();
		}, 10000);
	}

	async function win(winningSpin, winValue, betTotal) {
		if (winValue > 0) {
			let notification = document.createElement('div');
			notification.setAttribute('id', 'notification');
			let nSpan = document.createElement('div');
			nSpan.setAttribute('class', 'nSpan');
			let nsnumber = document.createElement('span');
			nsnumber.setAttribute('class', 'nsnumber');
			nsnumber.style.cssText = (numRed.includes(winningSpin)) ? 'color:red' : 'color:black';
			nsnumber.innerText = winningSpin;
			nSpan.append(nsnumber);
			let nsTxt = document.createElement('span');
			nsTxt.innerText = ' Win';
			nSpan.append(nsTxt);
			let nsWin = document.createElement('div');
			nsWin.setAttribute('class', 'nsWin');
			let nsWinBlock = document.createElement('div');
			nsWinBlock.setAttribute('class', 'nsWinBlock');
			nsWinBlock.innerText = 'Bet: ' + betTotal;
			nSpan.append(nsWinBlock);
			nsWin.append(nsWinBlock);
			nsWinBlock = document.createElement('div');
			nsWinBlock.setAttribute('class', 'nsWinBlock');
			nsWinBlock.innerText = 'Win: ' + winValue;
			nSpan.append(nsWinBlock);
			nsWin.append(nsWinBlock);
			nsWinBlock = document.createElement('div');
			nsWinBlock.setAttribute('class', 'nsWinBlock');
			nsWinBlock.innerText = 'Payout: ' + (winValue + betTotal);
			nsWin.append(nsWinBlock);
			nSpan.append(nsWin);
			notification.append(nSpan);
			container.prepend(notification);
			setTimeout(function () {
				notification.style.cssText = 'opacity:0';
			}, 3000);
			setTimeout(function () {
				notification.remove();
			}, 4000);
		}
		bankValue = await fetchBankValue();
		document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
	}

	function removeBet(e, n, t, o) {
		wager = (wager == 0) ? 100 : wager;
		for (let i = 0; i < bet.length; i++) {
			if (bet[i].numbers == n && bet[i].type == t) {
				if (bet[i].amt != 0) {
					wager = (bet[i].amt > wager) ? wager : bet[i].amt;
					bet[i].amt = bet[i].amt - wager;
					bankValue = bankValue + wager;
					currentBet = currentBet - wager;
					document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
					document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
					if (bet[i].amt == 0) {
						e.querySelector('.chip').style.cssText = 'display:none';
					} else {
						let chipColour = (bet[i].amt < 5) ? 'red' : ((bet[i].amt < 10) ? 'blue' : ((bet[i].amt < 100) ? 'orange' : 'gold'));
						e.querySelector('.chip').setAttribute('class', 'chip ' + chipColour);
						let chipSpan = e.querySelector('.chipSpan');
						chipSpan.innerText = bet[i].amt;
					}
				}
			}
		}

		if (currentBet == 0 && container.querySelector('.spinBtn')) {
			document.getElementsByClassName('spinBtn')[0].remove();
		}
	}

	function spinWheel(winningSpin) {
		let degree = 0;
		for (let i = 0; i < wheelnumbersAC.length; i++) {
			if (wheelnumbersAC[i] == winningSpin) {
				degree = (i * 9.73) + 362;
			}
		}
		wheel.style.cssText = 'animation: wheelRotate 5s linear infinite;';
		ballTrack.style.cssText = 'animation: ballRotate 1s linear infinite;';

		let style;
		setTimeout(function () {
			ballTrack.style.cssText = 'animation: ballRotate 2s linear infinite;';
			style = document.createElement('style');
			style.type = 'text/css';
			style.innerText = '@keyframes ballStop {from {transform: rotate(0deg);}to{transform: rotate(-' + degree + 'deg);}}';
			document.head.appendChild(style);
		}, 2000);
		setTimeout(function () {
			ballTrack.style.cssText = 'animation: ballStop 3s linear;';
		}, 6000);
		setTimeout(function () {
			ballTrack.style.cssText = 'transform: rotate(-' + degree + 'deg);';
		}, 9000);
		setTimeout(function () {
			wheel.style.cssText = '';
			if (style) style.remove();
		}, 10000);
	}

	function removeChips() {
		let chips = document.getElementsByClassName('chip');
		while (chips.length > 0) {
			chips[0].remove();
		}
	}

	function blockiereKlicks() {
		document.getElementById("klickSperre").style.display = "block";
	}
	function erlaubeKlicks() {
		document.getElementById("klickSperre").style.display = "none";

		let activeChips = document.getElementsByClassName("cdChipActive");
		for (let i = 0; i < activeChips.length; i++) {
			activeChips[i].classList.remove("cdChipActive");
		}

		let chips = document.getElementsByClassName("cdChip");
		if (chips.length > 1) {
			chips[1].classList.add("cdChipActive");
		}
		wager = 5;
	}
	startGame();
}
main();
