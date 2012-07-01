/*
 * jsoncomplete 1.0 - Minimal jQuery plugin to provide autocomplete funcionality to text fields with JSON formated data
 *
 * http://github.com/jgradim/jquery-jsoncomplete/
 *
 * 2012, João Gradim
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
(function($){

  var methods = {
    init : function(opts) {

      var defaults = {
        'url'                 : null,
        'id'                  : 'jsoncomplete',
        'class'               : 'jc-list',
        'highlight'           : true,
        'highlightClass'      : 'jc-highlight',
        'selectedClass'       : 'jc-selected',
        'dataObject'          : 'jc-object',
        'keyupTimeout'        : 300,
        'updateOnSelect'      : true,
        'scrollOnNavigation'  : true,
        'browserAutocomplete' : false,
        'formatObject'        : function(el)     { return $('<li></li>').text(el['name']) },
        'afterSelect'         : function(ev, el) {}
      }

      var settings = $.extend({}, defaults, opts);

      return this.each(function() {
        var $this = $(this);

        //
        var currentSelection = -1, timeout, request;

        // disable browser autocomplete?
        if(!settings.browserAutocomplete) { $this.attr('autocomplete', 'off'); }

        // use url from parent form?
        if(settings.url == null) { settings.url = $this.parents('form').attr('action'); }

        // create list to hold the search results
        var list = $('ul#'+settings.id);
        if (list.length == 0) {
          var list = $('<ul></ul>').attr('id', settings.id).addClass(settings.class);
          $this.after(list);
        }
        list.hide();

        //
        // Events binding
        //
        ///////////////////////////////////////////////////////////////////////

        // disable form submission from Return keypress on text-field
        // keypress is needed for Opera :(
        $this.bind('keydown.jsoncomplete keypress.jsoncomplete', function(ev) {
          if(ev.which == 13) { return false; }
        })

        // keyboard interaction and requests
        $this.bind('keyup.jsoncomplete', function(ev) {

          // skip left, right
          if(ev.which == 37 || ev.ehich == 39) { return false; }

          // special cases(up: 38, down: 40, esc: 27, enter: 13)
          switch(ev.which) {
            case 38: // up
              if(currentSelection != 0) { currentSelection--; }
              if(settings.updateOnSelect) { updateField(); }
              if(settings.scrollOnNavigation) { scrollToSelected(); }
            break;
            case 40: // down
              if(currentSelection != list.children('li').length - 1) { currentSelection++; }
              if(list.is(':hidden')) { list.show(); }
              if(settings.updateOnSelect) { updateField(); }
              if(settings.scrollOnNavigation) { scrollToSelected(); }
            break;
            case 27: // esc
              currentSelection = -1;
              list.hide();
            break;
            case 13: // return
              if(list.is(':visible')) {
                var el = list.children('li').eq(currentSelection);
                updateField();
                list.hide();
                settings.afterSelect(ev, el.data(settings.dataObject));
              }
            break;

            // AJAX Request
            default:

              // clear previous timeout and replace with new one
              if(timeout) clearTimeout(timeout);
              timeout = setTimeout(makeRequest, settings.keyupTimeout);
            break;
          }

          // highlight correct element
          setSelected();

        });

        // mouse interaction
        list.on('mouseover.jsoncomplete', 'li', function() {
          currentSelection = list.children('li').index(this);
          if(settings.updateOnSelect) { updateField(); }
          setSelected(list, currentSelection);
        }).on('click.jsoncomplete', 'li', function(ev) {
          el = list.children('li').eq(currentSelection);
          $this.val(el.text());
          list.hide();
          settings.afterSelect(ev, el.data(settings.dataObject));
        });

        //
        // Helper functions
        //
        ///////////////////////////////////////////////////////////////////////
        function makeRequest() {

          var formdata = serializeToJSON($this.parents('form'));
          var data = $.extend(formdata, settings.data);

          if(request) { request.abort(); }
          request = $.getJSON(settings.url, data, function(data) {

            list.empty().hide();

            for(var i = 0; i < data.length; i++) {
              var li = settings.formatObject(data[i]);
              li.data(settings.dataObject, data[i]);
              list.append(li);
            }

            if(data.length > 0) {
              if(settings.highlight) highlightMatches();
              currentSelection = 0;
              setSelected();
              list.show();
            }

          });

        }

        function setSelected() {
          list.children('li').removeClass(settings.selectedClass);
          list.children('li').eq(currentSelection).addClass(settings.selectedClass);
        }

        function updateField() {
          var el = list.children('li').eq(currentSelection);
          $this.val(el.text());
        }

        function scrollToSelected() {
          var height = list.children('li').eq(currentSelection).outerHeight();
          var scroll_amount = height * (currentSelection + 1) - list.outerHeight();
          list.scrollTop(scroll_amount);
        }

        function highlightMatches() {
          var keyword = $this.val();
          var split_regex = new RegExp(keyword, "gi");
          var match_regex = new RegExp("("+keyword+")", "gi");
          $("ul#"+settings.id+" li").each(function(i, e) {
            var s = $(e).text().split(split_regex);
            var m = $(e).text().match(match_regex);
            s = $.map(s, function(e,i){
              if(i == 0) return e;
              else return '<span class="'+settings.highlightClass+'">'+m[i-1]+"</span>"+e;
            }).join('');
            $(e).html(s);
          });
        }

        // http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
        function serializeToJSON(el) {
          var o = {};
          $.each(el.serializeArray(), function(i, el){
            if (o[el.name] !== undefined) {
              if (!o[el.name].push) {
                  o[el.name] = [o[el.name]];
              }
              o[el.name].push(el.value || '');
            } else {
              o[el.name] = el.value || '';
            }
          });
          return o;
        }
      });
    }
  }

  // method calling
  $.fn.jsoncomplete = function(method) {
    if(methods[method]){
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else if(typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    }
    else {
      $.error('Method ' +  method + ' does not exist on jQuery.jsoncomplete');
    }
  }

})(jQuery);

