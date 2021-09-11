(function(window,doc){
	'use strict';
	function init() {
		var o = {};
		o.find = function(str) {
			if (str.charAt(0) == '.') {
				return doc.getElementsByClassName(str.substring(1,str.length));
			} else if (str.charAt(0) == '#') {
				return doc.getElementById(str.substring(1,str.length));
			} else if (str.charAt(0)!='.'||'#') {
				return doc.getElementsByTagName(str);
			}
		};
		o.fullscreen = function(obj) {
			if (obj.requestFullscreen) {
				obj.requestFullscreen();
			} else if (obj.mozRequestFullscreen) {
				obj.mozRequestFullscreen();
			} else if (obj.webkitRequestFullscreen) {
				obj.webkitRequestFullscreen();
			} else if (obj.mosRequestFullscreen) {
				obj.mosRequestFullscreen();
			}
		};
		return o;
	}
	if (typeof(window._) === 'undefined') window._ = init();
})(window,document);