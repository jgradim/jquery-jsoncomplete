jQuery jsoncomplete
===================

Description
-----------

A minimal jQuery plugin to provide autocomplete functionality for text fields based on an array of JSON objects.


Usage
-----

This plugin was designed to be as straightforward as possible to use and to not have any required arguments. This means that some assumptions are made as to the markup used to make this plugin work. Refer to the [behaviour](#behaviour) section for more details.

All configuration options are passed on the `options` hash.

    $('input:text').jsoncomplete(options);
    
Response format
---------------

The remote call should return an array of JSON objects. The attributes of those objects are left to the programmer's discretion.
    

Options
-------

    |Option             |Default Value  |Description  |
    |-------------------|---------------|-------------|
    |url                |null           |URL used to perform the AJAX request. If set to `null`, defaults to parent `form` element `action` attribute|
    |id                 |'jsoncomplete' |Id given to the list that contains the autocomplete results|
    |class              |'jc-list'      |Class(es) given to the list that contains the autocomplete results|
    |highlight          |true           |Highlight the list element's text that matches the search terms (the value of the input)|
    |highlightClass     |'jc-highlight' |Class given to the highlighted text|
    |selectedClass      |'jc-selected'  |Class given to the currently selected search result|
    |dataObject         |'jc-object'    |`data` attribute where the original object from the request is saved for future usage|
    |keyupTimeout       |300            |Amount of time in miliseconds to delay the request after typing. This is used to reduce the number of requests to the server by waiting for the user to write all the terms|
    |updateOnSelect     |true           |If set to true, input value is set to the current selection while navigating, and not just on selection|
    |scrollOnNavigation |true           |Scroll the list when using keyboard navigation. Useful if you wnat to set `max-height` for the results list|
    |browserAutocomplete|false          |If set to false, `autocomplete="off"` will be added to the element's attributes to disable the browser's native autocomplete|

Callbacks
---------

###formatObject

This function is used to determine how to render each one of the JSON objects that make up the search request response. The default value assumes the JSON objects have an attribute called `name`, which will be used to set the text for each list element.

In both functions, the `element` argument is the original JSON object from the request response.

#### Default value and arguments

    function formatObject(element) {
        return $('<li></li>').text(element['name']);
    }

###afterSelect

This callback is used after an autocomplete result is selected either with the Return key if navigating with the keyboard or by clicking on the element with the mouse button.

####Default value and arguments

    function afterSelect(event, element) {}

Behaviour
---------

This plugin is designed to be used without the need for configuration, including the URL to request the values for the autocompletion. If the `url` option is set to `null` (default value), the URL used will be the one present in the `action` attribute in the 
`<form>` element the that the input is a child of. Check demo/index.html for examples for these different behaviours.

Styling
-------
No styling whatsoever is done in javascript (aside from show/hide). All the styling should be handled with CSS. An example stylesheet is in present in demo/jquery.jsoncomplete.css

###HTML Structure

Once filled, the list that holds the autocomplete results will have the following HTML structure (classes and ids match the plugins default values):

    <ul id="jsoncomplete" class="jc-list">
        <li>First result</li>
        <li class="jc-selected">Selected</li>
        <li><span class="jc-highlight">High</span>lighted</li>
    </ul>

Notes
-----

To run the demo locally, open the page from a server and not using the `file://` protocol, because otherwise the plugin can't access `jsoncomplete.json`. If you have python installed you can navigate to the demo folder and run the following command on your terminal:

    python -m SimpleHTTPServer
    
And access the demo at [http://localhost:8000](http://localhost:8000)

TO-DOs:
-------

 * Allow usage of local data instead of making AJAX requests for each search, filtering the relevant results using JS.

