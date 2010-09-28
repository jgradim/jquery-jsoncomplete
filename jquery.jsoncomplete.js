/*
 * jsonComplete 0.95 - Minimal jQuery plugin to provide autocomplete funcionality to text fields with JSON formated data
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
    return this.each(function() {
    
      var obj = $(this);
      obj.attr('autocomplete', 'off');
      
      // query cache, initially empty
      querycache = {};
      // element currently selected
      var currentSelection = -1;
      
      // check if list exists, create it otherwise
      var list = $("ul#"+o.id);
      if(list.length == 0) {
        obj.after('<ul id="'+o.id+'"></ul>');
        list = $("ul#"+o.id);
      }
      list.hide();
      
      // create a hidden field to hold the value of the selected element?
      if(o.hiddenField) {
        // $().attr can't change input's 'type' attribute :(
        obj.after('<input type="hidden" id="'+o.hiddenField+'" name="'+o.hiddenField+'" />');
      }
      
      // filter visible elements
      function filterVisible() {
        $("ul#"+o.id+" li").show().not(':contains-ci("'+obj.val()+'")').hide();
        if($.trim(obj.val()) == '') {
          list.hide();
          
          // highlight search terms?
          if(o.highlight) {
            clearHighlights(o);
          }
          
          currentSelection = -1;
        }
        else {
          currentSelection = 0;
          list.show();
          
          setSelected(list, currentSelection);
          
          // highlight search terms
          if(o.highlight) {
            clearHighlights(o);
            highlightMatches(o); 
          }
          
          // hide if no results found
          if($("ul#"+o.id+" li:visible").length == 0) {
            list.hide();
            currentSelection = -1;          
          }
        }
      }
      
      function highlightMatches(o) {
        var keyword = obj.val();
        var split_regex = new RegExp(keyword, "gi");
        var match_regex = new RegExp("("+keyword+")", "gi");
        $("ul#"+o.id+" li:visible").each(function(i, e) {
          var s = $(e).text().split(split_regex);
          var m = $(e).text().match(match_regex);
          s = $.map(s, function(e,i){
            if(i == 0) return e;
            else return '<span class="'+o.highlightClass+'">'+m[i-1]+"</span>"+e;
          }).join("");
          $(e).html(s);
        });
      }
      
      //
      function clearHighlights(o) {
        $("ul#"+o.id+" li").each(function(i, e) {
          $(e).html($(e).text());
        });
      }
      
      //
      function updateField(o){
      
        var el = list.children('li:visible').eq(currentSelection);
        obj.val(el.text());
      
        // set hidden field value?
        if(o.hiddenField) {
          $('input#'+o.hiddenField).val(el.attr('id').numeralAfter('v-'));  
        }
        
      }
      
      // hide/show list on element blur
      obj.blur(function(){
        // FIXME
      });
      
      // Keyboard interaction
      
      // disable form submission from Return keypress on text-field
      // keypress is needed for Opera :(
      obj.bind('keydown keypress', function(ev){
        if(ev.keyCode == 13) { return false; }
      });
      
      // define keypress events
      obj.keyup(function(ev) {
        
        o.data = $.extend(o.data, { value: obj.val() });
        
        // skip left, right
        if(ev.keyCode in {'37':'', '39':''}) { return false; }
        
        // special cases(up - 38, down - 40, esc - 27, enter - 13)
        switch(ev.keyCode) {          
          case 38: // up
            if(currentSelection != 0) { currentSelection--; }
            if(o.updateOnSelect){ updateField(o); }
          break;
          case 40: // down
            if(currentSelection != list.children('li:visible').length - 1) {
              currentSelection++;
            }
            if(list.is(':hidden')){ list.show(); }
            if(o.updateOnSelect){ updateField(o); }
          break;
          case 27: // ESC
            currentSelection = -1;
            list.hide();
          break;
          case 13: // RETURN
            if(list.is(":visible")) {
              var el = list.children('li:visible').eq(currentSelection);
              updateField(o);
              list.hide();
              o.afterSelect(ev, toJSON(el));
            }
          break;
          
          // AJAX request / 
          default:
          
            // clear value of hidden field
              $('input#'+o.hiddenField).val('');  
          
            // perform query or just filter results?
            if(!(o.data.value in querycache)) {
            
              // ajax request
              $.getJSON(url, o.data, function(json){
                for(var i = 0; i < json.length; i++) {
                  if ($("li#v-"+json[i].id).length == 0) {
                    list.append('<li id="v-'+json[i].id+'">'+json[i].value+'</li>');
                  }
                }
                
                // add value to query cache
                querycache[o.data.value] = '';
              
                // filter results and hide/show list
                filterVisible();
              
              });
            } else {
              // filter results and hide/show list
              filterVisible();
            }
          break;
        }
        
        // highlight correct element  
        setSelected(list, currentSelection);
      });
      
      // Mouse interaction
      $("ul#"+o.id+" li").live('mouseover', function() {
        currentSelection = list.children('li:visible').index(this);
        setSelected(list, currentSelection);
      }).live('click', function(ev){
        el = list.children('li:visible').eq(currentSelection);
        obj.val(el.text());
        list.hide();
            
        // set hidden field value?
        if(o.hiddenField) {
          $('input#'+o.hiddenField).val(el.attr('id').numeralAfter('v-'));  
        }
            
        o.afterSelect(ev, toJSON(el));
      });
    });
  };
  
  // private function to set selected element
  function setSelected(list, index) {
    list.children('li').removeClass('selected');
    list.children('li:visible').eq(index).addClass('selected');
  }
  //
  function toJSON(el){
    return {
      id: el.attr('id').numeralAfter('v-'),
      value: el.text()
    }
  }
   
  // default options
  $.fn.jsonComplete.defaults = {
    id: 'autocomplete',                       //
    hiddenField: 'jsoncomplete-value',        //
    updateOnSelect: true,                     //
    highlight: true,                          //
    highlightClass: 'jsoncomplete-highlight', //
    data: {},                                 //
    afterSelect: function(){}                 //
  };
  
  // contains, case-insensitive
  $.extend($.expr[":"], {
    "contains-ci": function(elem, i, match, array) {
      return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
    }
  });
  
  //
  String.prototype.numeralAfter = function(prefix) {  
    return this.match(RegExp(prefix+"(\\d+)"))[1];
  }
  String.prototype.capitalize = function() {  // http://www.mediacollege.com/internet/javascript/text/case-capitalize.html
    return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
  }

})(jQuery);
