
(function() {
	var d=document,
	h=d.getElementsByTagName('head')[0],
	s1=d.createElement('script'),
	s2=d.createElement('script');

	s1.type='text/javascript';
	s1.async=true;
	s1.src='http://code.jquery.com/jquery-1.9.1.js';
	h.appendChild(s1);
	s1.onload=function(){
		s2.type='text/javascript';
		s2.async=true;
		s2.src='http://code.jquery.com/ui/1.10.2/jquery-ui.js';
		h.appendChild(s2);
		s2.onload=function(){
			console.log('jqui');
		};
	};
}());




/*
	Captcha Wrapper
*/
(function(){

	function gc(target,callback) {
		this.init(target,callback);
	}

	gc.prototype.init = function(target,callback) {
		this.callback = callback;
		this.id = window.input.id;
		this.data = window.input.data;
		this.pointer = target;
		this.type = window.input.type;

		if(this.type == "fact"){
			this.typeDesc = "Enter the <strong>words highlighted</strong> in the sentence and click <strong>Submit</strong>!";
		}else{
			this.typeDesc = "<strong>Drag the item</strong> that belongs in the bin and click <strong>Submit</strong>!";
		}
		console.log(this.type);
		this.bin = window.input.bin || null;
		this.captchaPointer;
		this.construct();
		this.answer;
		this.desc;
	}

	gc.prototype.construct = function() {
		var app = this;
		this.trashItems = {};
		var gCaptcha = this.captchaPointer =  $("<gcap />", {
			id : "gCaptcha"
		}).css({
			'width': '300px',
			'margin': '0 auto',
			'font-family': '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
			'text-transform':'none',
			'letterSpacing': '0',
			'position': 'relative',
			'background': '#fff',
			'box-shadow': '0px -1px 18px -2px #111',
			'border-radius': '4px'
		}),
		gBody = $("<gcap />", {
			id: "gCaptcha-body"
		}).appendTo(gCaptcha),
		gBottom;

		this.desc = $("<gcap />", {
			id: "gCaptcha-description",
			html: app.typeDesc
		}).appendTo(gBody).css({
			'line-height': '18px',
			'padding': '8px',
			'font-size': '13px',
			'border-left': '3px solid rgb(34, 156, 83)',
			'border-right': '1px solid #cdcdcd',
			'height': '41px',
			'background': 'rgb(245, 252, 245)',
			'border-bottom': '1px solid #cdcdcd',
			'position': 'relative'
		});

		var qArea = $("<gcap />", {
			id : "gCaptcha-question_area"
		}).appendTo(gBody).css({
			'min-height': '30px',
			'border-left': '1px solid #cdcdcd',
			'border-right': '1px solid #cdcdcd',
			'position': 'relative'
		});

		if (this.type == "fact") {
			$("<img />", {
				id: "gCaptcha-question",
				src: app.data
			}).appendTo(qArea);

			$("<input/>",{id : "gCaptcha-input"}).attr('type','text').appendTo(qArea).css({
				'width': '263px',
				'margin-left': '20px',
				'display': 'inline-block',
				'height': '26px',
				'margin-bottom': '10px',
				'border-radius': '2px',
				'position': 'absolute',
				'bottom': '-5px',
				'left': '0px',
				'border': '1px solid rgb(134, 133, 133)'
			});
		} else {
			//Drag and Drop!

			//Classes
			$(qArea).css("height", "100");

			//Add Bin
			var binP = $("<img />", {
				src: "images/drag/item/"+app.bin
			}).css({
				'position': 'absolute',
				'top': '0',
				'right': '0'
			}).appendTo(qArea);

			console.log("binP droppable");
			binP.droppable({
				drop: function( event, ui ){
					if (app.answer !== undefined && ui.draggable[0].hash!=app.answer ) {
						//There was an item dropped Previously
						var pitem = app.trashItems[app.answer];
						$(pitem).animate({ 
							left: "-=130px",
						}, 150);

					}
					app.answer = ui.draggable[0].hash;

					//Put back
					$(".item").each(function(e){
						if( $(this).attr("class") != $(ui.draggable).attr("class") ){
							console.log("Moving back " + $(this).attr("class"));

							//Put Added Objects Back to Initial Position
							$(this).draggable( "option", "revert", true );
						}
					});
				},
				out: function(event, ui){
					app.answer = undefined;
				}
			});


			//Add Items
			var position = 0;
			$(this.data).each(function(){

				var image = $("<img />", {
					src: "images/drag/item/"+$(this)[1]
				}).css({
					'position': 'absolute',
					'top':'25px',
					'left': (position+10)+'px'
				}).appendTo(qArea).draggable({
					cursor: 'pointer',
					containment: qArea,
					stack: "div.bin"
				});
				position += 50;
				image[0].hash = $(this)[0];
				console.log(app);
				app.trashItems[image[0].hash] = image;
			});
		
		}


		gBottom = $("<gcap />", {
			id : "gCaptcha-bottom"
		}).appendTo(gCaptcha).css({
			'border-bottom-right-radius': '4px',
			'border-bottom-left-radius': '4px',
			'height': '30px',
			'padding': '10px',
			'border': '1px solid #cdcdcd'
		});

		$("<img />", {
			id: "gCaptcha-logo",
			src: "http://www.romanzubenko.com:3002/images/greenCaptcha-logo.png"
		}).appendTo(gBottom).css({
			'font-weight': '600',
			'width': '154px',
			'margin-top': '-11px',
			'display': 'block',
			'float': 'left'
		});

		

		

		$("<gcap />", {
			id : "gCaptcha-submit",
			text : "Submit"
		}).appendTo(gBottom).css({
			'height': '16px',
			'padding': '5px 8px 5px 8px',
			'border': '1px solid #cdcdcd',
			'border-radius': '2px',
			'text-align': 'center',
			'float': 'right',
			'display': 'inline-block',
			'cursor': 'pointer',
			'font-size': '12px',
			'background-image': '-webkit-linear-gradient(top, rgb(255, 255, 255), rgb(238, 238, 238))'
		}).hover(function(){
			$(this).css({
				'background-image': '-webkit-linear-gradient(top, rgb(238, 238, 238), rgb(255, 255, 255))'
			});
		}, function(){
			$(this).css({
				'background-image': '-webkit-linear-gradient(top, rgb(255, 255, 255), rgb(238, 238, 238))'
			});
		});

		var reload = $("<gcap />", {
			id : "gCaptcha-reload",
		}).appendTo(gBottom).css({
			'height': '26px',
			'width': '26px',
			'border': '1px solid #cdcdcd',
			'border-radius': '2px',
			'float': 'right',
			'display': 'block',
			'cursor': 'pointer',
			'font-size': '12px',
			'margin-right': '3px'
		});

		$("<img/>",{src:"http://romanzubenko.com:3002/images/reload.png"}).appendTo(reload);

		gCaptcha.appendTo(this.pointer);
		console.log(this.pointer)
		$("gcap").css("display","block").css("all", "default;");


		$(document).on('click', '#gCaptcha-submit', function(){
			if (app.type == 'fact') {
				app.answer = $("#gCaptcha-input").val();
			}
			app.validate();
		});
		$(document).on('click', '#gCaptcha-reload', function(){
			app.reload();
		});
	}

	gc.prototype.reload = function() {
		var app = this;
		$(document).off('click','#gCaptcha-submit');
		$(document).off('click','#gCaptcha-reload');
		$.ajax({
			type: 'GET',
			url: "http://www.romanzubenko.com:3002/greenCaptcha.js",
			data : {reload:true},
			dataType: 'jsonp',
			success: function(data) {

				console.log('New captcha loaded!');
				data = $.parseJSON(data);
				console.log(data);
				window.input.id = data.id;
				window.input.data = data.data;
				window.input.type = data.type;
				if (data.bin !== undefined) {
					window.input.bin = data.bin;
				}
				app.captchaPointer.remove();

				app.init(app.pointer,app.callback)
				
			},
			fail: function(data) {
				console.log('fail loading new question');

			},
		});
	}

	gc.prototype.validate = function() {
		var app = this;
		if (this.answer == undefined || this.answer == null) {
			return;
		}
		$("#gCaptcha-submit").attr('disabled', 'disabled');
		var req = {
			id: this.id,
			type: this.type,
			answer: this.answer
		};

		$.ajax({
			type: 'GET',
			url: "http://www.romanzubenko.com:3002/answer",
			data:  req,
			dataType: 'jsonp',
			success: function(data) {
				app.callback(data);
				console.log('Success');
				if (data.result) {
					console.log("True Captcha");

					app.desc.html("Captcha was successfully solved!<br/>")
					$("<img/>", {
						src:"images/check-mark.png",
						id: "gCaptcha-check"
					}).appendTo(app.desc).css({
						"float": "right",
						"height": "40px",
						"right": "3px",
						"top": "3px",
						"position": "absolute"
					});
				} else {
					console.log("False Captcha");
					app.desc.html("Captcha was not solved. Try again!")
					app.reload();
				}
			},
			fail: function(data) {
				console.log('fail');

			},
		});
	}


	window.GreenCaptcha = gc;
})(window)