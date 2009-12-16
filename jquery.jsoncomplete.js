/*
 * jsonComplete 0.7 - Minimal jQuery plugin to provide autocomplete funcionality to text fields with JSON formated data
 *
 * http://github.com/jgradim/jquery-jsoncomplete/
 *
 * Copyright (c) 2009 João Gradim
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
(function($){
 
	// function definition
	$.fn.jsonComplete = function(url, opts) {
	
		var o = $.extend({}, $.fn.jsonComplete.defaults, opts);
	
		// "global" vars
		var currentSelection = -1;
		 
		return this.each(function() {
		
			var obj = $(this);
			obj.attr('autocomplete', 'off');
			
			// check if list exists, create it otherwise
			var list = $("ul#"+o.id);
			if(list.length == 0) {
				obj.after('<ul id="'+o.id+'"></ul>');
				list = $("ul#"+o.id);
			}
			list.hide();
			
			// disable form submission from Return keypress on text-field
			obj.keydown(function(ev){
				if(ev.keyCode == 13) { return false; }
			});
			
			// define keypress events
			obj.keyup(function(ev){
				
				o.data = $.extend(o.data, { value: obj.val() });
				
				obj.focus();
				
				// skip left, right
				if(ev.keyCode in {'37':'', '39':''}) { return false; }
				
				
				// special cases(up - 38, down - 40, esc - 27, enter - 13)
				switch(ev.keyCode) {					
					case 38: // up
						if(currentSelection != 0) { currentSelection--; }
					break;
					case 40: // down
						if(currentSelection != list.children('li:visible').length - 1) {
							currentSelection++;
						}
						if(list.is(':hidden')){ list.show(); }
					break;
					case 27: // ESC
						currentSelection = -1;
						list.hide();
					break;
					case 13: // RETURN
						obj.val(list.children('li:visible').eq(currentSelection).text());
						list.hide();
					break;
					
					// perform AJAX request
					default:
						// ajax request
						$.getJSON(url, o.data, function(json){
							for(var i = 0; i < json.length; i++) {
								if ($("li#v-"+json[i].id).length == 0) {
									list.append('<li id="v-'+json[i].id+'">'+json[i].value+'</li>');
								}
							}
					
							// filter results and hide/show list
							$("ul#"+o.id+" li").show().not(':contains-ci("'+obj.val()+'")').hide();
							if($.trim(obj.val()) == ''/* || $("ul#"+o.id+" li:visible").length == 0*/) {
								list.hide();
								currentSelection = -1;
							}
							else {
								currentSelection = 0;
								list.show();
								list.children('li:visible').eq(currentSelection).addClass('selected');
							}
					
						});
					break;
				}
				
				// select and highlight correct children
				list.children('li').removeClass('selected');
				list.children('li:visible').eq(currentSelection).addClass('selected');
			});
		
		});
	};
	 
	// default options
	$.fn.jsonComplete.defaults = {
		id: 'autocomplete',  //
		data: {},
		callback: function(){}
	};
	
	// contains, case-insensitive
	$.extend($.expr[":"], {
		"contains-ci": function(elem, i, match, array) {
			return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
		}
	});  

})(jQuery);
