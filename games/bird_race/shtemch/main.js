(function(window,document) {
	var wordpad = {
		pad: null,
		talking: false,
		inter: null,
		say: function(str,speed,clear=false,time=0,endFun=function(str) {}) {
			this.talking = true;
			var prog = 0;
			this.inter = setInterval(function() {
				if (wordpad.talking == true) {
					wordpad.pad.innerHTML +=  str.charAt(prog);
					prog++;
					if (prog == str.length) {
						clearInterval(this);
						if (clear === true) {
							setTimeout(function() {
								wordpad.clear();
								endFun(str);
							},time);
						} else {	
							endFun(str);
						}
					}
				}
			},speed);
		},
		clear: function() {
			wordpad.pad.innerHTML = '';
			clearInterval(this.inter);
			this.talking = false;
		},
		stages: {
			s1: false,
			s2: false
		}
	}, i = 0, fingers = 0, showFood = false, food, bird, gInter, stage = 0, foodAmt = 0,
	frame = 0, randomObj, training = {
		mode: null
	};
	function mPos(e) {
		var rt = canvas.getBoundingClientRect();
		return {
			x : e.clientX - rt.left,
			y : e.clientY - rt.top
		};
	}
	function log(msg,type) {
		console.log(msg);
		var el = _.find('#logs');
		var node = document.createTextNode(msg);
		var elem = document.createElement('p');
		elem.appendChild(node);
		var errClass = '';
		if (type == 'ERR') {
			errClass = ' error-log';
		}
		if (type == 'WARN') {
			errClass = ' warn-log';
		}
		elem.setAttribute('class','game-log' + errClass);
		el.insertBefore(elem,el.childNodes[0]);
	}
	function GameImg(x,y,img,width,height,gravityX=0,gravityY=0,gravity=0) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.img = img;
		this.width = width;
		this.height = height;
		this.gravityX = gravityX;
		this.gravityY = gravityY;
		this.gravity = gravity;
		this.update = function() {
			c.drawImage(this.img,this.x,this.y,this.width,this.height);
		};
		this.cPos = function() {
			this.x += this.gravityX;
			this.y += this.gravityY + this.gravity;
		};
		this.crashTo = function (obj) {
			var top = this.y;
			var btm = this.y + (this.height);
			var left = this.x;
			var right = this.x + (this.width);
			var othTop = obj.y;
			var othBtm = obj.y + (obj.height);
			var othLeft = obj.x;
			var othRight = obj.x + (obj.width);
			var crashed = true;
			if (btm < othTop || top > othBtm || right < othLeft || left > othLeft) {
				crashed = false;
			}
			return crashed;
		}
	}
	function updateMse(e) {
		msePos = [mPos(e).x,mPos(e).y];
	}
	function handeKeyPress(e) {
		var cd = e.keyCode || e.wich;
		if (cd == 87) {
			bird.gravityY -= bird.speed;
			log('up: ' + 87);
		} else if (cd == 68) {
			bird.gravityX += bird.speed;
			log('left: ' + 68);
		} else if (cd == 83) {
			bird.gravityY += bird.speed;
			log('down: ' + 83);
		} else if (cd == 65 && bird.free) {
			bird.gravityX -= bird.speed;
			log('right: ' + 65);
		} else if (cd == 67) {
			_.find('#logs').innerHTML = '';
			log('cleared logs','WARN');
			console.clear();
		} else if (cd == 70) {
			if (showFood) {
				log('ERROR: already feeding, feed ' + bird.name + ' first.','ERR');
			} else if (foodAmt == 0) {
				log('ERROR: not enough food to feed.','ERR');
			} else {
				giveFood();
			}
		} else if (cd == 66) {
			buyFood();
		} else {
			log('ERROR: unrecognized keyCode: ' + cd,'ERR');
		}
	}
	function buyFood() {
		if (fingers > 0) {
			fingers -= 10;
			foodAmt++;
		} else {
			log('ERROR: not enough fingers, need at least 10 chicken fingers.','ERR');
		}
	}
	function giveFood() {
		if (showFood) {
			return;
		} else if (!showFood) {
			showFood = true;
		}
	}
	function update() {
		c.clearRect(0,0,1500,150000);
		drawData();
		if (showFood) {
			food.update();
			food.x = msePos[0];
			food.y = msePos[1];
			if (bird.crashTo(food) || food.crashTo(bird)) {
				showFood = false;
				foodAmt--;
				bird.health += 1;
				bird.size(10,10);
				setTimeout(function() {
					bird.size(-10,-10);
				}, 250);
			}
		}
		bird.update();
		bird.cPos();
		switch (stage) {
			case 0:
				randomObj.update();
				if (bird.crashTo(randomObj) || randomObj.crashTo(bird)) {
					stage = 1;
					log(stage,'WARN');
				}
			break;
			case 1:
				if (!wordpad.stages.s1) {
					wordpad.clear();
					wordpad.say('Great!    Now you can name your duck! (If your answer is \' \' or nothing then default is \"Gary\")',
					 50,
					 true,
					 3000,
					 function() {
					 	bird.name = nameBird();
						wordpad.say(bird.name + ', What a great name!                          Now you are ready to learn about food!',
						50,
						true,
						3000,
						function() {
							stage = 2;
						});
					});
					wordpad.stages.s1 = true;
				}
			break;
			case 2:
				if (!wordpad.stages.s2) {
					wordpad.say('Food is essential for ' + bird.name +
					 '.  Food can help your bird learn and makes your bird faster because it does not need to ' +
					 ' focus on its hunger.' +
					 '                                                            ' + 
					 ' heres 250 chicken fingers.  ' +  
					 ' chicken fingers are the currency of Bird island (the only place in the world uninhabitable by humans)' + 
					 ' press B to buy a package of grapes.  press F to feed ' + bird.name + '. ' + 
					 ' save your fingers because you can buy many other things with them. ' + 
					 ' A package of grapes is 10 fingers. Have one for free because you\'r A starter!         Lets also speed ' + 
					 bird.name + ' up a bit. ' + 
					 '  to continue, feed ' + bird.name + '.',
					 50,true,5000,
					 function() {
					 	foodAmt++;
						fingers = 250;
						bird.speed = 2;
					});
					wordpad.stages.s2 = true;
					wordpad.stages.s3 = false;
				}
				if (bird.health >= 3) {
					stage = 3;
					log(stage,"WARN");
				}
			break;
			case 3:
				if (!wordpad.stages.s3) {
					wordpad.clear();
					wordpad.say('Great!  Now we can train!',50,false,0,function(){
						
					});
				}
			break;
		}
		frame++;
	}
	function drawData() {
		c.fillStyle = 'skyblue';
		c.fillRect(0,0,15000,15000);
		c.fillStyle = 'red';
		c.font = '16px sans-serif';
		c.fillText('Chicken fingers: ' + fingers + ', Food: ' + foodAmt + 
			 ', Speed: ' + bird.speed + ', health: ' + bird.health + 
			 ', bird X: ' + bird.x + ', bird Y: ' + bird.y + ', frame: ' + frame,
			 20,20);
	}
	function nameBird () {
		var name = prompt('Name your bird:','Gary');
		if (name == '' || name == ' ' || name == null) {
			name = 'Gary';
		}
		log(name,"WARN");
		return name;
	};
	window.onload = function() {
		//vars
		wordpad.pad = _.find('#wordpad');
		canvas = _.find('canvas')[0];
		c = canvas.getContext('2d');
		bird = new GameImg(100,100,_.find('img')[0],70,50,0,0);
		bird.speed = 1;
		bird.health = 2;
		bird.free = true;
		randomObj = new GameImg(600,400,_.find('#red-block'),20,20,0,0);
		GameImg.prototype.size = function(amtW,amtH) {
			this.width += amtW;
			this.height += amtH;
		};
		food = new GameImg(0,0,_.find('#grapes'),50,50,0,0);
		gInter = setInterval(update,20);
		//events
		canvas.addEventListener('mousemove',updateMse,true);
		window.addEventListener('keydown',handeKeyPress,true);
		window.addEventListener('keyup',function() {
			bird.gravityX = 0;
			bird.gravityY = 0;
		},false);
		setInterval(function() {
			log('Frame: ' + frame,'WARN');
		},Math.floor(Math.random()*99999)+10000);
		//other
		wordpad.say('Hi! welcome to your new bird!       Your bird was specificly bread to be a racer!          use w a s d to move your bird    \
			So You get used to the controls, please get your bird to the red square.',100);
	};
	function evframe(num) {
		if ((num / frame) % 1 == 0 ) return true;
		return false;
	}
})(window,document);