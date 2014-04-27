// ==UserScript==
// @name           Show the hotness
// @namespace      com.aimedia.literotica
// @description    Show only hot and editor's choice stories on Literotica
// @include        http://literotica.com/stories/new_submissions.php*
// @include        http://*.literotica.com/stories/new_submissions.php*
// @include        https://literotica.com/stories/new_submissions.php*
// @include        https://*.literotica.com/stories/new_submissions.php*
// ==/UserScript==

/* perform the actions on the completed document */
function tag_elements () {
    var storyElements = document.evaluate("//body/table/tbody/tr[5]/td",document,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
    
    var storyTable = storyElements.snapshotItem(0);
    
    var i = storyTable.childNodes.length - 1;
    if (storyTable.childNodes[i].localName.toLowerCase() == 'b') {
        i--;  // this is stripping out a trailing '</b>' that the table has
    }
    // : checkpoint on <br> tags
    // : initial state:  title line, delete
    var mode = "title_line";
    var action = "delete";
    var ridx = 0;
    var removes = new Array();
    var group = new Array();
    var groups = new Array();

    Array.prototype.forEach.call(storyTable.childNodes, function(element, index, array) {
        var loop_mode = mode;
        group.push(element);
        if (element.localName && element.localName.toLowerCase() == "br") { 
            mode = mode == 'title_line' ? "author_line" : 'title_line'; 
            if (loop_mode == 'author_line') {
                // we're closing off a story.
                groups.push(group);
	        console.log("++ At node " + index + ": [" + element.localName + "] : " + loop_mode + '->' + mode +  "(" + group.length + " items)");
                group = new Array();
            }
            else {
	        console.log("++ At node " + index + ": [" + element.localName + "] : " + loop_mode + '->' + mode);
            }
        }
    });

    groups.forEach(function(element, index, array) {
        var title = 'no title';
        if (element.length > 2) {
            title = element[0].textContent;
            var story_class = null;
            if (element[element.length - 2].localName.toLowerCase() == 'img') {
                story_class = 'story hot';
            }
            else {
                story_class = 'story not-hot';
            }
            jQuery(element.slice(0, element.length - 1)).wrapAll('<div class="' + story_class + '"/>');
            element[element.length - 1].className = element[element.length - 1].className + story_class;
        }
        console.log("Group " + index + ", title found to be " + title + ", element count= " + element.length);
    });
    
}

function add_button() {
    var parent = jQuery('tr:has(td:contains("New Stories"))')[1];
    container = parent.cells[0];
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    jQuery('<input />', { 
        'type': 'checkbox', 
        'id': 'show-the-hotness', 
        'value': 'show-the-hotness' 
    }).appendTo(container);
    jQuery('<label />', { 
        'id': 'story-header',
        'class': 'story-header',
        'for': 'show-the-hotness', 
        'text': 'Hot New Stories' 
    }).appendTo(container);

    tag_elements();

    jQuery("#show-the-hotness").change(function() {
        var $this = jQuery(this);
        if ($this.is(':checked')) {
            jQuery(".story.not-hot").hide();
            jQuery("#story-header").text('Hot New Stories');
        } else {
            jQuery(".story.not-hot").show();
            jQuery("#story-header").text('All New Stories');
        }
    });

    jQuery("#show-the-hotness").prop('checked', true);
    jQuery("#show-the-hotness").change();
}

jQuery(document).ready(add_button);
