greenCaptcha
============

Hackathon Project

Include in your html:
<script src="http://www.romanzubenko.com:3002/greenCaptcha.js"></script>


How to initialize:
Provide two arguments: target selector and callback upon result

<pre>
window.captcha = new GreenCaptcha("#captcha",function(result){
    if (result) {
			console.log("Green Capptcha works: pass");
		} else {
			console.log("Green Capptcha works: not pass");
		}
	}); 
}
</pre>

