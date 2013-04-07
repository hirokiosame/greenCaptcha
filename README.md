greenCaptcha
============

Hackathon Project

Include in your html:

```html
<script src="http://www.romanzubenko.com:3002/greenCaptcha.js"></script>
```

How to initialize:
Provide two arguments: target selector and callback upon result

```javascript
window.captcha = new GreenCaptcha("#captcha",function(success){
    if (success) {
			console.log("Green Capptcha works: pass");
		} else {
			console.log("Green Capptcha works: not pass");
		}
	}); 
}
```

