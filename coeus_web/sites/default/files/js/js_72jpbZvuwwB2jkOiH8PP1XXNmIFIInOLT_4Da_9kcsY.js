(function ($) {

/**
 * Attaches double-click behavior to toggle full path of Krumo elements.
 */
Drupal.behaviors.devel = {
  attach: function (context, settings) {

    // Add hint to footnote
    $('.krumo-footnote .krumo-call').once().before('<img style="vertical-align: middle;" title="Click to expand. Double-click to show path." src="' + settings.basePath + 'misc/help.png"/>');

    var krumo_name = [];
    var krumo_type = [];

    function krumo_traverse(el) {
      krumo_name.push($(el).html());
      krumo_type.push($(el).siblings('em').html().match(/\w*/)[0]);

      if ($(el).closest('.krumo-nest').length > 0) {
        krumo_traverse($(el).closest('.krumo-nest').prev().find('.krumo-name'));
      }
    }

    $('.krumo-child > div:first-child', context).dblclick(
      function(e) {
        if ($(this).find('> .krumo-php-path').length > 0) {
          // Remove path if shown.
          $(this).find('> .krumo-php-path').remove();
        }
        else {
          // Get elements.
          krumo_traverse($(this).find('> a.krumo-name'));

          // Create path.
          var krumo_path_string = '';
          for (var i = krumo_name.length - 1; i >= 0; --i) {
            // Start element.
            if ((krumo_name.length - 1) == i)
              krumo_path_string += '$' + krumo_name[i];

            if (typeof krumo_name[(i-1)] !== 'undefined') {
              if (krumo_type[i] == 'Array') {
                krumo_path_string += "[";
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += krumo_name[(i-1)];
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += "]";
              }
              if (krumo_type[i] == 'Object')
                krumo_path_string += '->' + krumo_name[(i-1)];
            }
          }
          $(this).append('<div class="krumo-php-path" style="font-family: Courier, monospace; font-weight: bold;">' + krumo_path_string + '</div>');

          // Reset arrays.
          krumo_name = [];
          krumo_type = [];
        }
      }
    );
  }
};

})(jQuery);
;

/**
 * Cookie plugin 1.0
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
jQuery.cookie=function(b,j,m){if(typeof j!="undefined"){m=m||{};if(j===null){j="";m.expires=-1}var e="";if(m.expires&&(typeof m.expires=="number"||m.expires.toUTCString)){var f;if(typeof m.expires=="number"){f=new Date();f.setTime(f.getTime()+(m.expires*24*60*60*1000))}else{f=m.expires}e="; expires="+f.toUTCString()}var l=m.path?"; path="+(m.path):"";var g=m.domain?"; domain="+(m.domain):"";var a=m.secure?"; secure":"";document.cookie=[b,"=",encodeURIComponent(j),e,l,g,a].join("")}else{var d=null;if(document.cookie&&document.cookie!=""){var k=document.cookie.split(";");for(var h=0;h<k.length;h++){var c=jQuery.trim(k[h]);if(c.substring(0,b.length+1)==(b+"=")){d=decodeURIComponent(c.substring(b.length+1));break}}}return d}};
;
// $Id: jquery.drilldown.js,v 1.1.2.10.2.1 2010/09/16 18:40:02 yhahn Exp $

/**
 * Generic menu drilldown plugin for standard Drupal menu tree markup.
 * The plugin should be inited against a DOM element that *contains*
 * a Drupal ul.menu tree. Example:
 * 
 *   $('div.block-menu').drilldown('init', params);
 * 
 * You must provide the following parameters as settings:
 * 
 *   var params = {
 *     activePath : A drupal menu path that is currently active including the basePath e.g. "/mysite/node"
 *     trail : A jquery selector to the DOM element that should act as the trail container, e.g. "div.my-menu-breadcrumb-trail"
 *     rootTitle : The title to use for the root menu item if the menu does not already possess one. Optional.
 *   }
 *
 */
(function($) {
  $.fn.drilldown = function(method, settings) {
    var menu = this;
    var activePath;
    var rootTitle = settings.rootTitle || 'Home';

    switch (method) {
      case 'goTo':
        // If the passed link refers to the current page, don't follow through
        // the link.
        if (this.activePath && this.activePath === $(settings.activeLink).attr('href')) {
          return false;
        }
        return true;
      case 'setActive':
        var breadcrumb = [];
        var activeMenu;

        $(settings.activeLink).each(function() {
          // Traverse backwards through menu parents and build breadcrumb array.
          $(this).parents('ul.menu').each(function() {
            if ($(this).parents('ul.menu').size() > 0) {
              $(this).siblings('a').each(function() {
                breadcrumb.unshift($(this));
              });
            }
            // If this is a root menu with no root link to accompany it,
            // generate one such that the breadcrumb may reference it.
            else if ($(this).children('li').size() > 1) {
              var root;
              if ($(this).siblings('a.drilldown-root').size() > 0) {
                root = $(this).siblings('a.drilldown-root');
              }
              else {
                root = $('<a href="#" class="drilldown-root" style="display:none">'+rootTitle+'</a>');
                $(this).before(root);
              }
              breadcrumb.unshift(root);
            }
          });

          // If we have a child menu (actually a sibling in the DOM), use it
          // as the active menu. Otherwise treat our direct parent as the
          // active menu.
          if ($(this).next().is('ul.menu')) {
            activeMenu = $(this).next();
            breadcrumb.push($(this));
          }
          else {
            activeMenu = $(this).parents('ul.menu').eq(0);
          }
          if (activeMenu) {
            $('.drilldown-active-trail', menu).removeClass('drilldown-active-trail');
            $('ul.menu', menu).removeClass('drilldown-active-menu').removeClass('clearfix');
            $(activeMenu)
              .addClass('drilldown-active-menu').addClass('clearfix')
              .parents('li').addClass('drilldown-active-trail').show();
          }
        });

        // Render the breadcrumb to the target DOM object
        if (breadcrumb.length > 0) {
          var trail = $(settings.trail);
          trail.empty();
          for (var key in breadcrumb) {
            if (breadcrumb[key]) {
              // We don't use the $().clone() method here because of an
              // IE & jQuery 1.2 bug.
              var clone = $('<a></a>')
                .attr('href', $(breadcrumb[key]).attr('href'))
                .attr('class', $(breadcrumb[key]).attr('class'))
                .html($(breadcrumb[key]).html())
                .addClass('depth-'+key)
                .appendTo(trail);

              // We add a reference to the original link and a click handler
              // that traces back to that instance to set as the active link.
              $('a.depth-'+key, trail)
                .data('original', $(breadcrumb[key]))
                .click(function() {
                  settings.activeLink = $(this).data('original');
                  // If the clicked link does not reference the current
                  // active menu, set it to be active.
                  if (settings.activeLink.siblings('ul.drilldown-active-menu').size() === 0) {
                    menu.drilldown('setActive', settings);
                    return false;
                  }
                  // Otherwise, pass-through and allow the link to be clicked.
                  return menu.drilldown('goTo', settings);
                });
            }
          }
        }

        // Event in case others need to update themselves when a new active
        // link is set.
        $(menu).trigger('refresh.drilldown');
        break;
      case 'init':
        if ($('ul.menu ul.menu', menu).size() > 0) {
          $(menu).addClass('drilldown');
          $(settings.trail).addClass('drilldown-trail');

          // Set initial active menu state.
          var activeLink;
          $('ul.menu a', menu).removeClass('active');
          if (settings.activePath && $('ul.menu a[href='+settings.activePath+']', menu).size() > 0) {
            this.activePath = settings.activePath;
            activeLink = $('ul.menu a[href='+settings.activePath+']', menu).addClass('active');
          }
          if (!activeLink) {
            activeLink = $('ul.menu a.active', menu).size() ? $('ul.menu a.active', menu) : $('ul.menu > li > a', menu);
          }
          if (activeLink) {
            menu.drilldown('setActive', {
              activeLink: $(activeLink[0]),
              trail: settings.trail,
              rootTitle: rootTitle
            });
          }

          // Attach click handlers to menu items
          $('ul.menu li:has(ul.menu)', this).click(function() {
            if ($(this).parent().is('.drilldown-active-menu')) {
              if (menu.data('disableMenu')) {
                return true;
              }
              else {
                var url = $(this).children('a').attr('href');
                var activeLink = $('ul.menu a[href='+url+']', menu);
                menu.drilldown('setActive', {
                  activeLink: activeLink,
                  trail: settings.trail,
                  rootTitle: rootTitle
                });
                return false;
              }
            }
          });
          $('ul.menu li:has(ul.menu) a', menu).click(function() {
            menu.data('disableMenu', true);
          });
        }
        break;
    }
    return this;
  };
})(jQuery);
;
// $Id: admin.menu.js,v 1.1.2.9.2.2 2010/12/16 21:43:54 yhahn Exp $
(function($) {

Drupal.behaviors.adminToolbarMenu = {};
Drupal.behaviors.adminToolbarMenu.attach = function(context) {
  if (jQuery().drilldown) {
    $('#admin-toolbar div.admin-block:has(ul.menu):not(.admin-toolbar-menu)')
      .addClass('admin-toolbar-menu')
      .each(function() {
        var menu = $(this);
        var trail = '#admin-toolbar div.admin-tab.' + $(this).attr('id').split('block-')[1] + ' span';
        var rootTitle = $(trail).text();

        if ($('a:has(span.menu-description)', menu).size() > 0) {
          menu.addClass('admin-toolbar-menu-hover');
          $('a:has(span.menu-description)', menu).hover(
            function() {
              $('<a></a>')
                .attr('class', $(this).attr('class'))
                .addClass('menu-hover')
                .addClass('overlay-exclude')
                .append($('span.menu-description', this).clone())
                .appendTo(menu)
                .show();
            },
            function() {
              $(menu)
                .children('a.menu-hover')
                .remove();
            }
          );
        }

        // Replace the standard trail click handler with one that only
        // adjusts menu if the admin tab is active. Otherwise, switch
        // to that admin tab.
        menu.bind('refresh.drilldown', function() {
          $(trail + ' a').unbind('click').click(function() {
            if ($(this).parents('div.admin-tab').is('.admin-tab-active')) {
              var settings = {'activeLink': $(this).data('original'), 'trail': trail};

              // If the clicked link does not reference the current
              // active menu, set it to be active.
              if (settings.activeLink.siblings('ul.drilldown-active-menu').size() === 0) {
                menu.drilldown('setActive', settings);
                return false;
              }
              // Otherwise, pass-through and allow the link to be clicked.
              return menu.drilldown('goTo', settings);
            }
            $(this).parents('div.admin-tab').click();
            return false;
          });
        });

        // Init drilldown plugin.
        menu.drilldown('init', {
          activePath: Drupal.settings.activePath,
          trail: trail,
          rootTitle: rootTitle
        });
      });
  }
};

})(jQuery);;
(function ($) {

/**
 * Attaches the autocomplete behavior to all required fields.
 */
Drupal.behaviors.autocomplete = {
  attach: function (context, settings) {
    var acdb = [];
    $('input.autocomplete', context).once('autocomplete', function () {
      var uri = this.value;
      if (!acdb[uri]) {
        acdb[uri] = new Drupal.ACDB(uri);
      }
      var $input = $('#' + this.id.substr(0, this.id.length - 13))
        .attr('autocomplete', 'OFF')
        .attr('aria-autocomplete', 'list');
      $($input[0].form).submit(Drupal.autocompleteSubmit);
      $input.parent()
        .attr('role', 'application')
        .append($('<span class="element-invisible" aria-live="assertive"></span>')
          .attr('id', $input.attr('id') + '-autocomplete-aria-live')
        );
      new Drupal.jsAC($input, acdb[uri]);
    });
  }
};

/**
 * Prevents the form from submitting if the suggestions popup is open
 * and closes the suggestions popup when doing so.
 */
Drupal.autocompleteSubmit = function () {
  return $('#autocomplete').each(function () {
    this.owner.hidePopup();
  }).length == 0;
};

/**
 * An AutoComplete object.
 */
Drupal.jsAC = function ($input, db) {
  var ac = this;
  this.input = $input[0];
  this.ariaLive = $('#' + this.input.id + '-autocomplete-aria-live');
  this.db = db;

  $input
    .keydown(function (event) { return ac.onkeydown(this, event); })
    .keyup(function (event) { ac.onkeyup(this, event); })
    .blur(function () { ac.hidePopup(); ac.db.cancel(); });

};

/**
 * Handler for the "keydown" event.
 */
Drupal.jsAC.prototype.onkeydown = function (input, e) {
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
    case 40: // down arrow.
      this.selectDown();
      return false;
    case 38: // up arrow.
      this.selectUp();
      return false;
    default: // All other keys.
      return true;
  }
};

/**
 * Handler for the "keyup" event.
 */
Drupal.jsAC.prototype.onkeyup = function (input, e) {
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
    case 16: // Shift.
    case 17: // Ctrl.
    case 18: // Alt.
    case 20: // Caps lock.
    case 33: // Page up.
    case 34: // Page down.
    case 35: // End.
    case 36: // Home.
    case 37: // Left arrow.
    case 38: // Up arrow.
    case 39: // Right arrow.
    case 40: // Down arrow.
      return true;

    case 9:  // Tab.
    case 13: // Enter.
    case 27: // Esc.
      this.hidePopup(e.keyCode);
      return true;

    default: // All other keys.
      if (input.value.length > 0 && !input.readOnly) {
        this.populatePopup();
      }
      else {
        this.hidePopup(e.keyCode);
      }
      return true;
  }
};

/**
 * Puts the currently highlighted suggestion into the autocomplete field.
 */
Drupal.jsAC.prototype.select = function (node) {
  this.input.value = $(node).data('autocompleteValue');
  $(this.input).trigger('autocompleteSelect', [node]);
};

/**
 * Highlights the next suggestion.
 */
Drupal.jsAC.prototype.selectDown = function () {
  if (this.selected && this.selected.nextSibling) {
    this.highlight(this.selected.nextSibling);
  }
  else if (this.popup) {
    var lis = $('li', this.popup);
    if (lis.length > 0) {
      this.highlight(lis.get(0));
    }
  }
};

/**
 * Highlights the previous suggestion.
 */
Drupal.jsAC.prototype.selectUp = function () {
  if (this.selected && this.selected.previousSibling) {
    this.highlight(this.selected.previousSibling);
  }
};

/**
 * Highlights a suggestion.
 */
Drupal.jsAC.prototype.highlight = function (node) {
  if (this.selected) {
    $(this.selected).removeClass('selected');
  }
  $(node).addClass('selected');
  this.selected = node;
  $(this.ariaLive).html($(this.selected).html());
};

/**
 * Unhighlights a suggestion.
 */
Drupal.jsAC.prototype.unhighlight = function (node) {
  $(node).removeClass('selected');
  this.selected = false;
  $(this.ariaLive).empty();
};

/**
 * Hides the autocomplete suggestions.
 */
Drupal.jsAC.prototype.hidePopup = function (keycode) {
  // Select item if the right key or mousebutton was pressed.
  if (this.selected && ((keycode && keycode != 46 && keycode != 8 && keycode != 27) || !keycode)) {
    this.select(this.selected);
  }
  // Hide popup.
  var popup = this.popup;
  if (popup) {
    this.popup = null;
    $(popup).fadeOut('fast', function () { $(popup).remove(); });
  }
  this.selected = false;
  $(this.ariaLive).empty();
};

/**
 * Positions the suggestions popup and starts a search.
 */
Drupal.jsAC.prototype.populatePopup = function () {
  var $input = $(this.input);
  var position = $input.position();
  // Show popup.
  if (this.popup) {
    $(this.popup).remove();
  }
  this.selected = false;
  this.popup = $('<div id="autocomplete"></div>')[0];
  this.popup.owner = this;
  $(this.popup).css({
    top: parseInt(position.top + this.input.offsetHeight, 10) + 'px',
    left: parseInt(position.left, 10) + 'px',
    width: $input.innerWidth() + 'px',
    display: 'none'
  });
  $input.before(this.popup);

  // Do search.
  this.db.owner = this;
  this.db.search(this.input.value);
};

/**
 * Fills the suggestion popup with any matches received.
 */
Drupal.jsAC.prototype.found = function (matches) {
  // If no value in the textfield, do not show the popup.
  if (!this.input.value.length) {
    return false;
  }

  // Prepare matches.
  var ul = $('<ul></ul>');
  var ac = this;
  for (key in matches) {
    $('<li></li>')
      .html($('<div></div>').html(matches[key]))
      .mousedown(function () { ac.hidePopup(this); })
      .mouseover(function () { ac.highlight(this); })
      .mouseout(function () { ac.unhighlight(this); })
      .data('autocompleteValue', key)
      .appendTo(ul);
  }

  // Show popup with matches, if any.
  if (this.popup) {
    if (ul.children().length) {
      $(this.popup).empty().append(ul).show();
      $(this.ariaLive).html(Drupal.t('Autocomplete popup'));
    }
    else {
      $(this.popup).css({ visibility: 'hidden' });
      this.hidePopup();
    }
  }
};

Drupal.jsAC.prototype.setStatus = function (status) {
  switch (status) {
    case 'begin':
      $(this.input).addClass('throbbing');
      $(this.ariaLive).html(Drupal.t('Searching for matches...'));
      break;
    case 'cancel':
    case 'error':
    case 'found':
      $(this.input).removeClass('throbbing');
      break;
  }
};

/**
 * An AutoComplete DataBase object.
 */
Drupal.ACDB = function (uri) {
  this.uri = uri;
  this.delay = 300;
  this.cache = {};
};

/**
 * Performs a cached and delayed search.
 */
Drupal.ACDB.prototype.search = function (searchString) {
  var db = this;
  this.searchString = searchString;

  // See if this string needs to be searched for anyway.
  searchString = searchString.replace(/^\s+|\s+$/, '');
  if (searchString.length <= 0 ||
    searchString.charAt(searchString.length - 1) == ',') {
    return;
  }

  // See if this key has been searched for before.
  if (this.cache[searchString]) {
    return this.owner.found(this.cache[searchString]);
  }

  // Initiate delayed search.
  if (this.timer) {
    clearTimeout(this.timer);
  }
  this.timer = setTimeout(function () {
    db.owner.setStatus('begin');

    // Ajax GET request for autocompletion. We use Drupal.encodePath instead of
    // encodeURIComponent to allow autocomplete search terms to contain slashes.
    $.ajax({
      type: 'GET',
      url: db.uri + '/' + Drupal.encodePath(searchString),
      dataType: 'json',
      success: function (matches) {
        if (typeof matches.status == 'undefined' || matches.status != 0) {
          db.cache[searchString] = matches;
          // Verify if these are still the matches the user wants to see.
          if (db.searchString == searchString) {
            db.owner.found(matches);
          }
          db.owner.setStatus('found');
        }
      },
      error: function (xmlhttp) {
        alert(Drupal.ajaxError(xmlhttp, db.uri));
      }
    });
  }, this.delay);
};

/**
 * Cancels the current autocomplete request.
 */
Drupal.ACDB.prototype.cancel = function () {
  if (this.owner) this.owner.setStatus('cancel');
  if (this.timer) clearTimeout(this.timer);
  this.searchString = '';
};

})(jQuery);
;
(function ($) {

Drupal.behaviors.textarea = {
  attach: function (context, settings) {
    $('.form-textarea-wrapper.resizable', context).once('textarea', function () {
      var staticOffset = null;
      var textarea = $(this).addClass('resizable-textarea').find('textarea');
      var grippie = $('<div class="grippie"></div>').mousedown(startDrag);

      grippie.insertAfter(textarea);

      function startDrag(e) {
        staticOffset = textarea.height() - e.pageY;
        textarea.css('opacity', 0.25);
        $(document).mousemove(performDrag).mouseup(endDrag);
        return false;
      }

      function performDrag(e) {
        textarea.height(Math.max(32, staticOffset + e.pageY) + 'px');
        return false;
      }

      function endDrag(e) {
        $(document).unbind('mousemove', performDrag).unbind('mouseup', endDrag);
        textarea.css('opacity', 1);
      }
    });
  }
};

})(jQuery);
;
(function ($) {

/**
 * Attach the machine-readable name form element behavior.
 */
Drupal.behaviors.machineName = {
  /**
   * Attaches the behavior.
   *
   * @param settings.machineName
   *   A list of elements to process, keyed by the HTML ID of the form element
   *   containing the human-readable value. Each element is an object defining
   *   the following properties:
   *   - target: The HTML ID of the machine name form element.
   *   - suffix: The HTML ID of a container to show the machine name preview in
   *     (usually a field suffix after the human-readable name form element).
   *   - label: The label to show for the machine name preview.
   *   - replace_pattern: A regular expression (without modifiers) matching
   *     disallowed characters in the machine name; e.g., '[^a-z0-9]+'.
   *   - replace: A character to replace disallowed characters with; e.g., '_'
   *     or '-'.
   *   - standalone: Whether the preview should stay in its own element rather
   *     than the suffix of the source element.
   *   - field_prefix: The #field_prefix of the form element.
   *   - field_suffix: The #field_suffix of the form element.
   */
  attach: function (context, settings) {
    var self = this;
    $.each(settings.machineName, function (source_id, options) {
      var $source = $(source_id, context).addClass('machine-name-source');
      var $target = $(options.target, context).addClass('machine-name-target');
      var $suffix = $(options.suffix, context);
      var $wrapper = $target.closest('.form-item');
      // All elements have to exist.
      if (!$source.length || !$target.length || !$suffix.length || !$wrapper.length) {
        return;
      }
      // Skip processing upon a form validation error on the machine name.
      if ($target.hasClass('error')) {
        return;
      }
      // Figure out the maximum length for the machine name.
      options.maxlength = $target.attr('maxlength');
      // Hide the form item container of the machine name form element.
      $wrapper.hide();
      // Determine the initial machine name value. Unless the machine name form
      // element is disabled or not empty, the initial default value is based on
      // the human-readable form element value.
      if ($target.is(':disabled') || $target.val() != '') {
        var machine = $target.val();
      }
      else {
        var machine = self.transliterate($source.val(), options);
      }
      // Append the machine name preview to the source field.
      var $preview = $('<span class="machine-name-value">' + options.field_prefix + Drupal.checkPlain(machine) + options.field_suffix + '</span>');
      $suffix.empty();
      if (options.label) {
        $suffix.append(' ').append('<span class="machine-name-label">' + options.label + ':</span>');
      }
      $suffix.append(' ').append($preview);

      // If the machine name cannot be edited, stop further processing.
      if ($target.is(':disabled')) {
        return;
      }

      // If it is editable, append an edit link.
      var $link = $('<span class="admin-link"><a href="#">' + Drupal.t('Edit') + '</a></span>')
        .click(function () {
          $wrapper.show();
          $target.focus();
          $suffix.hide();
          $source.unbind('.machineName');
          return false;
        });
      $suffix.append(' ').append($link);

      // Preview the machine name in realtime when the human-readable name
      // changes, but only if there is no machine name yet; i.e., only upon
      // initial creation, not when editing.
      if ($target.val() == '') {
        $source.bind('keyup.machineName change.machineName input.machineName', function () {
          machine = self.transliterate($(this).val(), options);
          // Set the machine name to the transliterated value.
          if (machine != '') {
            if (machine != options.replace) {
              $target.val(machine);
              $preview.html(options.field_prefix + Drupal.checkPlain(machine) + options.field_suffix);
            }
            $suffix.show();
          }
          else {
            $suffix.hide();
            $target.val(machine);
            $preview.empty();
          }
        });
        // Initialize machine name preview.
        $source.keyup();
      }
    });
  },

  /**
   * Transliterate a human-readable name to a machine name.
   *
   * @param source
   *   A string to transliterate.
   * @param settings
   *   The machine name settings for the corresponding field, containing:
   *   - replace_pattern: A regular expression (without modifiers) matching
   *     disallowed characters in the machine name; e.g., '[^a-z0-9]+'.
   *   - replace: A character to replace disallowed characters with; e.g., '_'
   *     or '-'.
   *   - maxlength: The maximum length of the machine name.
   *
   * @return
   *   The transliterated source string.
   */
  transliterate: function (source, settings) {
    var rx = new RegExp(settings.replace_pattern, 'g');
    return source.toLowerCase().replace(rx, settings.replace).substr(0, settings.maxlength);
  }
};

})(jQuery);
;
// $Id: admin.toolbar.js,v 1.1.2.9.2.4 2010/12/16 22:47:18 yhahn Exp $
(function($) {

Drupal.behaviors.adminToolbar = {};
Drupal.behaviors.adminToolbar.attach = function(context) {
  $('#admin-toolbar:not(.processed)').each(function() {
    var toolbar = $(this);
    toolbar.addClass('processed');

    // Set initial toolbar state.
    Drupal.adminToolbar.init(toolbar);

    // Admin toggle.
    $('.admin-toggle', this).click(function() { Drupal.adminToolbar.toggle(toolbar); });

    // Admin tabs.
    $('div.admin-tab', this).click(function() { Drupal.adminToolbar.tab(toolbar, $(this), true); });

    $(document).bind('drupalOverlayLoad', {adminToolbar: Drupal.adminToolbar, toolbar: toolbar}, function(event) {
      var body = $(document.body);
      var adminToolbar = event.data.adminToolbar;
      var expand = parseInt(adminToolbar.getState('expanded'));
      if (!expand) {
        $('iframe.overlay-active').contents().find('body').css({marginLeft:0, marginTop: 0});
        return;
      }
      var toolbar = event.data.toolbar;
      var size = adminToolbar.SIZE + 'px';
      if(toolbar.attr('class').split(' ')[1] === 'vertical') {
        $('iframe.overlay-element').contents().find('body').css('marginLeft', size);
      }
      else {
        $('iframe.overlay-element').contents().find('body').css('marginTop', size);
      }
    });
  });
  $('div.admin-panes:not(.processed)').each(function() {
    var panes = $(this);
    panes.addClass('processed');

    $('h2.admin-pane-title a').click(function() {
      var target = $(this).attr('href').split('#')[1];
      var panes = $(this).parents('div.admin-panes')[0];
      $('.admin-pane-active', panes).removeClass('admin-pane-active');
      $('div.admin-pane.' + target, panes).addClass('admin-pane-active');
      $(this).addClass('admin-pane-active');
      return false;
    });
  });
};

/**
 * Admin toolbar methods.
 */
Drupal.adminToolbar = {};

/**
 * The width or height of the toolbar, depending on orientation.
 */
Drupal.adminToolbar.SIZE = 260;

/**
 * Set the initial state of the toolbar.
 */
Drupal.adminToolbar.init = function (toolbar) {
  // Set expanded state.
  var expanded = this.getState('expanded');
  if (!$(document.body).hasClass('admin-ah')) {
    if (expanded == 1) {
      $(document.body).addClass('admin-expanded');
    }
  }

  // Set default tab state.
  var target = this.getState('activeTab');
  if (target) {
    if ($('div.admin-tab.'+target).size() > 0) {
      var tab = $('div.admin-tab.'+target);
      this.tab(toolbar, tab, false);
    }
  }

  // Add layout class to body.
  var classes = toolbar.attr('class').split(' ');
  if (classes[0] === 'nw' || classes[0] === 'ne' || classes[0] === 'se' || classes[0] === 'sw' ) {
    $(document.body).addClass('admin-'+classes[0]);
  }
  if (classes[1] === 'horizontal' || classes[1] === 'vertical') {
    $(document.body).addClass('admin-'+classes[1]);
  }
  if (classes[2] === 'df' || classes[2] === 'ah') {
    $(document.body).addClass('admin-'+classes[2]);
  }
};

/**
 * Set the active tab.
 */
Drupal.adminToolbar.tab = function(toolbar, tab, animate) {
  if (!tab.is('.admin-tab-active')) {
    var target = $('span', tab).attr('id').split('admin-tab-')[1];

    // Vertical
    // Use animations to make the vertical tab transition a bit smoother.
    if (toolbar.is('.vertical') && animate) {
      $('.admin-tab-active', toolbar).fadeOut('fast');
      $(tab).fadeOut('fast', function() {
        $('.admin-tab-active', toolbar).fadeIn('fast').removeClass('admin-tab-active');
        $(tab).slideDown('fast').addClass('admin-tab-active');
        Drupal.adminToolbar.setState('activeTab', target);
      });
    }
    // Horizontal
    // Tabs don't need animation assistance.
    else {
      $('div.admin-tab', toolbar).removeClass('admin-tab-active');
      $(tab, toolbar).addClass('admin-tab-active');
      Drupal.adminToolbar.setState('activeTab', target);
    }

    // Blocks
    $('div.admin-block.admin-active', toolbar).removeClass('admin-active');
    $('#block-'+target, toolbar).addClass('admin-active');
  }
  return false;
};

/**
 * Set the width/height of the of the overlay body based on the state admin toolbar.
 *
 * @param vertical
 *   A boolean indicating if the toolbar is vertical.
 * @param expanded
 *   A boolean indicating if the toolbar is expanded.
 */
Drupal.adminToolbar.setOverlayState = function(vertical, expanded) {
  var width = this.SIZE;
  if (!expanded) {
    width = 0;
  }
  if (vertical) {
    $('iframe.overlay-element').contents().find('body').animate({marginLeft: width+'px'}, 'fast');
  }
  else {
    $('iframe.overlay-element').contents().find('body').animate({marginTop: width+'px'}, 'fast');
  }
};

/**
 * Toggle the toolbar open or closed.
 */
Drupal.adminToolbar.toggle = function (toolbar) {
  var size = '0px';
  if ($(document.body).is('.admin-expanded')) {
    if ($(toolbar).is('.vertical')) {
      $('div.admin-blocks', toolbar).animate({width:size}, 'fast');
      if ($(toolbar).is('.nw') || $(toolbar).is('sw')) {
        $(document.body).animate({marginLeft:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      else {
        $(document.body).animate({marginRight:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      this.setOverlayState(true, false);
    }
    else {
      $('div.admin-blocks', toolbar).animate({height:size}, 'fast');
      if ($(toolbar).is('.nw') || $(toolbar).is('ne')) {
        $(document.body).animate({marginTop:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      else {
        $(document.body).animate({marginBottom:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
    }
    this.setOverlayState(false, false);
    this.setState('expanded', 0);
  }
  else {
    size = this.SIZE + 'px';
    if ($(toolbar).is('.vertical')) {
      $('div.admin-blocks', toolbar).animate({width:size}, 'fast');
      if ($(toolbar).is('.nw') || $(toolbar).is('sw')) {
        $(document.body).animate({marginLeft:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      else {
        $(document.body).animate({marginRight:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      this.setOverlayState(true, true);
    }
    else {
      $('div.admin-blocks', toolbar).animate({height:size}, 'fast');
      if ($(toolbar).is('.nw') || $(toolbar).is('ne')) {
        $(document.body).animate({marginTop:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      else {
        $(document.body).animate({marginBottom:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      this.setOverlayState(false, true);
    }
    if ($(document.body).hasClass('admin-ah')) {
      this.setState('expanded', 0);
    }
    else {
      this.setState('expanded', 1);
    }
  }
};

/**
 * Get the value of a cookie variable.
 */
Drupal.adminToolbar.getState = function(key) {
  if (!Drupal.adminToolbar.state) {
    Drupal.adminToolbar.state = {};
    var cookie = $.cookie('DrupalAdminToolbar');
    var query = cookie ? cookie.split('&') : [];
    if (query) {
      for (var i in query) {
        // Extra check to avoid js errors in Chrome, IE and Safari when
        // combined with JS like twitter's widget.js.
        // See http://drupal.org/node/798764.
        if (typeof(query[i]) == 'string' && query[i].indexOf('=') != -1) {
          var values = query[i].split('=');
          if (values.length === 2) {
            Drupal.adminToolbar.state[values[0]] = values[1];
          }
        }
      }
    }
  }
  return Drupal.adminToolbar.state[key] ? Drupal.adminToolbar.state[key] : false;
};

/**
 * Set the value of a cookie variable.
 */
Drupal.adminToolbar.setState = function(key, value) {
  var existing = Drupal.adminToolbar.getState(key);
  if (existing != value) {
    Drupal.adminToolbar.state[key] = value;
    var query = [];
    for (var i in Drupal.adminToolbar.state) {
      query.push(i + '=' + Drupal.adminToolbar.state[i]);
    }
    $.cookie('DrupalAdminToolbar', query.join('&'), {expires: 7, path: '/'});
  }
};

})(jQuery);;
/**
 * @file
 * Some basic behaviors and utility functions for Views UI.
 */
Drupal.viewsUi = {};

Drupal.behaviors.viewsUiEditView = {};

/**
 * Improve the user experience of the views edit interface.
 */
Drupal.behaviors.viewsUiEditView.attach = function (context, settings) {
  // Only show the SQL rewrite warning when the user has chosen the
  // corresponding checkbox.
  jQuery('#edit-query-options-disable-sql-rewrite').click(function () {
    jQuery('.sql-rewrite-warning').toggleClass('js-hide');
  });
};

Drupal.behaviors.viewsUiAddView = {};

/**
 * In the add view wizard, use the view name to prepopulate form fields such as
 * page title and menu link.
 */
Drupal.behaviors.viewsUiAddView.attach = function (context, settings) {
  var $ = jQuery;
  var exclude, replace, suffix;
  // Set up regular expressions to allow only numbers, letters, and dashes.
  exclude = new RegExp('[^a-z0-9\\-]+', 'g');
  replace = '-';

  // The page title, block title, and menu link fields can all be prepopulated
  // with the view name - no regular expression needed.
  var $fields = $(context).find('[id^="edit-page-title"], [id^="edit-block-title"], [id^="edit-page-link-properties-title"]');
  if ($fields.length) {
    if (!this.fieldsFiller) {
      this.fieldsFiller = new Drupal.viewsUi.FormFieldFiller($fields);
    }
    else {
      // After an AJAX response, this.fieldsFiller will still have event
      // handlers bound to the old version of the form fields (which don't exist
      // anymore). The event handlers need to be unbound and then rebound to the
      // new markup. Note that jQuery.live is difficult to make work in this
      // case because the IDs of the form fields change on every AJAX response.
      this.fieldsFiller.rebind($fields);
    }
  }

  // Prepopulate the path field with a URLified version of the view name.
  var $pathField = $(context).find('[id^="edit-page-path"]');
  if ($pathField.length) {
    if (!this.pathFiller) {
      this.pathFiller = new Drupal.viewsUi.FormFieldFiller($pathField, exclude, replace);
    }
    else {
      this.pathFiller.rebind($pathField);
    }
  }

  // Populate the RSS feed field with a URLified version of the view name, and
  // an .xml suffix (to make it unique).
  var $feedField = $(context).find('[id^="edit-page-feed-properties-path"]');
  if ($feedField.length) {
    if (!this.feedFiller) {
      suffix = '.xml';
      this.feedFiller = new Drupal.viewsUi.FormFieldFiller($feedField, exclude, replace, suffix);
    }
    else {
      this.feedFiller.rebind($feedField);
    }
  }
};

/**
 * Constructor for the Drupal.viewsUi.FormFieldFiller object.
 *
 * Prepopulates a form field based on the view name.
 *
 * @param $target
 *   A jQuery object representing the form field to prepopulate.
 * @param exclude
 *   Optional. A regular expression representing characters to exclude from the
 *   target field.
 * @param replace
 *   Optional. A string to use as the replacement value for disallowed
 *   characters.
 * @param suffix
 *   Optional. A suffix to append at the end of the target field content.
 */
Drupal.viewsUi.FormFieldFiller = function ($target, exclude, replace, suffix) {
  var $ = jQuery;
  this.source = $('#edit-human-name');
  this.target = $target;
  this.exclude = exclude || false;
  this.replace = replace || '';
  this.suffix = suffix || '';

  // Create bound versions of this instance's object methods to use as event
  // handlers. This will let us easily unbind those specific handlers later on.
  // NOTE: jQuery.proxy will not work for this because it assumes we want only
  // one bound version of an object method, whereas we need one version per
  // object instance.
  var self = this;
  this.populate = function () {return self._populate.call(self);};
  this.unbind = function () {return self._unbind.call(self);};

  this.bind();
  // Object constructor; no return value.
};

/**
 * Bind the form-filling behavior.
 */
Drupal.viewsUi.FormFieldFiller.prototype.bind = function () {
  this.unbind();
  // Populate the form field when the source changes.
  this.source.bind('keyup.viewsUi change.viewsUi', this.populate);
  // Quit populating the field as soon as it gets focus.
  this.target.bind('focus.viewsUi', this.unbind);
};

/**
 * Get the source form field value as altered by the passed-in parameters.
 */
Drupal.viewsUi.FormFieldFiller.prototype.getTransliterated = function () {
  var from = this.source.val();
  if (this.exclude) {
    from = from.toLowerCase().replace(this.exclude, this.replace);
  }
  return from + this.suffix;
};

/**
 * Populate the target form field with the altered source field value.
 */
Drupal.viewsUi.FormFieldFiller.prototype._populate = function () {
  var transliterated = this.getTransliterated();
  this.target.val(transliterated);
};

/**
 * Stop prepopulating the form fields.
 */
Drupal.viewsUi.FormFieldFiller.prototype._unbind = function () {
  this.source.unbind('keyup.viewsUi change.viewsUi', this.populate);
  this.target.unbind('focus.viewsUi', this.unbind);
};

/**
 * Bind event handlers to the new form fields, after they're replaced via AJAX.
 */
Drupal.viewsUi.FormFieldFiller.prototype.rebind = function ($fields) {
  this.target = $fields;
  this.bind();
}

Drupal.behaviors.addItemForm = {};
Drupal.behaviors.addItemForm.attach = function (context) {
  var $ = jQuery;
  // The add item form may have an id of views-ui-add-item-form--n.
  var $form = $(context).find('form[id^="views-ui-add-item-form"]').first();
  // Make sure we don't add more than one event handler to the same form.
  $form = $form.once('views-ui-add-item-form');
  if ($form.length) {
    new Drupal.viewsUi.addItemForm($form);
  }
}

Drupal.viewsUi.addItemForm = function($form) {
  this.$form = $form;
  this.$form.find('.views-filterable-options :checkbox').click(jQuery.proxy(this.handleCheck, this));
  // Find the wrapper of the displayed text.
  this.$selected_div = this.$form.find('.views-selected-options').parent();
  this.$selected_div.hide();
  this.checkedItems = [];
}

Drupal.viewsUi.addItemForm.prototype.handleCheck = function (event) {
  var $target = jQuery(event.target);
  var label = jQuery.trim($target.next().text());
  // Add/remove the checked item to the list.
  if ($target.is(':checked')) {
    this.$selected_div.show();
    this.checkedItems.push(label);
  }
  else {
    var length = this.checkedItems.length;
    var position = jQuery.inArray(label, this.checkedItems);
    // Delete the item from the list and take sure that the list doesn't have undefined items left.
    for (var i = 0; i < this.checkedItems.length; i++) {
      if (i == position) {
        this.checkedItems.splice(i, 1);
        i--;
        break;
      }
    }
    // Hide it again if none item is selected.
    if (this.checkedItems.length == 0) {
      this.$selected_div.hide();
    }
  }
  this.refreshCheckedItems();
}


/**
 * Refresh the display of the checked items.
 */
Drupal.viewsUi.addItemForm.prototype.refreshCheckedItems = function() {
  // Perhaps we should precache the text div, too.
  this.$selected_div.find('.views-selected-options').html(Drupal.checkPlain(this.checkedItems.join(', ')));
  Drupal.viewsUi.resizeModal('', true);
}


/**
 * The input field items that add displays must be rendered as <input> elements.
 * The following behavior detaches the <input> elements from the DOM, wraps them
 * in an unordered list, then appends them to the list of tabs.
 */
Drupal.behaviors.viewsUiRenderAddViewButton = {};

Drupal.behaviors.viewsUiRenderAddViewButton.attach = function (context, settings) {
  var $ = jQuery;
  // Build the add display menu and pull the display input buttons into it.
  var $menu = $('#views-display-menu-tabs', context).once('views-ui-render-add-view-button-processed');

  if (!$menu.length) {
    return;
  }
  var $addDisplayDropdown = $('<li class="add"><a href="#"><span class="icon add"></span>' + Drupal.t('Add') + '</a><ul class="action-list" style="display:none;"></ul></li>');
  var $displayButtons = $menu.nextAll('input.add-display').detach();
  $displayButtons.appendTo($addDisplayDropdown.find('.action-list')).wrap('<li>')
    .parent().first().addClass('first').end().last().addClass('last');
  // Remove the 'Add ' prefix from the button labels since they're being palced
  // in an 'Add' dropdown.
  // @todo This assumes English, but so does $addDisplayDropdown above. Add
  //   support for translation.
  $displayButtons.each(function () {
    var label = $(this).val();
    if (label.substr(0, 4) == 'Add ') {
      $(this).val(label.substr(4));
    }
  });
  $addDisplayDropdown.appendTo($menu);

  // Add the click handler for the add display button
  $('li.add > a', $menu).bind('click', function (event) {
    event.preventDefault();
    var $trigger = $(this);
    Drupal.behaviors.viewsUiRenderAddViewButton.toggleMenu($trigger);
  });
  // Add a mouseleave handler to close the dropdown when the user mouses
  // away from the item. We use mouseleave instead of mouseout because
  // the user is going to trigger mouseout when she moves from the trigger
  // link to the sub menu items.
  //
  // We use the 'li.add' selector because the open class on this item will be
  // toggled on and off and we want the handler to take effect in the cases
  // that the class is present, but not when it isn't.
  $menu.delegate('li.add', 'mouseleave', function (event) {
    var $this = $(this);
    var $trigger = $this.children('a[href="#"]');
    if ($this.children('.action-list').is(':visible')) {
      Drupal.behaviors.viewsUiRenderAddViewButton.toggleMenu($trigger);
    }
  });
};

/**
 * @note [@jessebeach] I feel like the following should be a more generic function and
 * not written specifically for this UI, but I'm not sure where to put it.
 */
Drupal.behaviors.viewsUiRenderAddViewButton.toggleMenu = function ($trigger) {
  $trigger.parent().toggleClass('open');
  $trigger.next().slideToggle('fast');
}


Drupal.behaviors.viewsUiSearchOptions = {};

Drupal.behaviors.viewsUiSearchOptions.attach = function (context) {
  var $ = jQuery;
  // The add item form may have an id of views-ui-add-item-form--n.
  var $form = $(context).find('form[id^="views-ui-add-item-form"]').first();
  // Make sure we don't add more than one event handler to the same form.
  $form = $form.once('views-ui-filter-options');
  if ($form.length) {
    new Drupal.viewsUi.OptionsSearch($form);
  }
};

/**
 * Constructor for the viewsUi.OptionsSearch object.
 *
 * The OptionsSearch object filters the available options on a form according
 * to the user's search term. Typing in "taxonomy" will show only those options
 * containing "taxonomy" in their label.
 */
Drupal.viewsUi.OptionsSearch = function ($form) {
  this.$form = $form;
  // Add a keyup handler to the search box.
  this.$searchBox = this.$form.find('#edit-options-search');
  this.$searchBox.keyup(jQuery.proxy(this.handleKeyup, this));
  // Get a list of option labels and their corresponding divs and maintain it
  // in memory, so we have as little overhead as possible at keyup time.
  this.options = this.getOptions(this.$form.find('.filterable-option'));
  // Restripe on initial loading.
  this.handleKeyup();
  // Trap the ENTER key in the search box so that it doesn't submit the form.
  this.$searchBox.keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
    }
  });
};

/**
 * Assemble a list of all the filterable options on the form.
 *
 * @param $allOptions
 *   A jQuery object representing the rows of filterable options to be
 *   shown and hidden depending on the user's search terms.
 */
Drupal.viewsUi.OptionsSearch.prototype.getOptions = function ($allOptions) {
  var $ = jQuery;
  var i, $label, $description, $option;
  var options = [];
  var length = $allOptions.length;
  for (i = 0; i < length; i++) {
    $option = $($allOptions[i]);
    $label = $option.find('label');
    $description = $option.find('div.description');
    options[i] = {
      // Search on the lowercase version of the label text + description.
      'searchText': $label.text().toLowerCase() + " " + $description.text().toLowerCase(),
      // Maintain a reference to the jQuery object for each row, so we don't
      // have to create a new object inside the performance-sensitive keyup
      // handler.
      '$div': $option
    }
  }
  return options;
};

/**
 * Keyup handler for the search box that hides or shows the relevant options.
 */
Drupal.viewsUi.OptionsSearch.prototype.handleKeyup = function (event) {
  var found, i, j, option, search, words, wordsLength, zebraClass, zebraCounter;

  // Determine the user's search query. The search text has been converted to
  // lowercase.
  search = this.$searchBox.val().toLowerCase();
  words = search.split(' ');
  wordsLength = words.length;

  // Start the counter for restriping rows.
  zebraCounter = 0;

  // Search through the search texts in the form for matching text.
  var length = this.options.length;
  for (i = 0; i < length; i++) {
    // Use a local variable for the option being searched, for performance.
    option = this.options[i];
    found = true;
    // Each word in the search string has to match the item in order for the
    // item to be shown.
    for (j = 0; j < wordsLength; j++) {
      if (option.searchText.indexOf(words[j]) === -1) {
        found = false;
      }
    }
    if (found) {
      // Show the checkbox row, and restripe it.
      zebraClass = (zebraCounter % 2) ? 'odd' : 'even';
      option.$div.show();
      option.$div.removeClass('even odd');
      option.$div.addClass(zebraClass);
      zebraCounter++;
    }
    else {
      // The search string wasn't found; hide this item.
      option.$div.hide();
    }
  }
};


Drupal.behaviors.viewsUiPreview = {};
Drupal.behaviors.viewsUiPreview.attach = function (context, settings) {
  var $ = jQuery;

  // Only act on the edit view form.
  var contextualFiltersBucket = $('.views-display-column .views-ui-display-tab-bucket.contextual-filters', context);
  if (contextualFiltersBucket.length == 0) {
    return;
  }

  // If the display has no contextual filters, hide the form where you enter
  // the contextual filters for the live preview. If it has contextual filters,
  // show the form.
  var contextualFilters = $('.views-display-setting a', contextualFiltersBucket);
  if (contextualFilters.length) {
    $('#preview-args').parent().show();
  }
  else {
    $('#preview-args').parent().hide();
  }

  // Executes an initial preview.
  if ($('#edit-displays-live-preview').once('edit-displays-live-preview').is(':checked')) {
    $('#preview-submit').once('edit-displays-live-preview').click();
  }
};


Drupal.behaviors.viewsUiRearrangeFilter = {};
Drupal.behaviors.viewsUiRearrangeFilter.attach = function (context, settings) {
  var $ = jQuery;
  // Only act on the rearrange filter form.
  if (typeof Drupal.tableDrag == 'undefined' || typeof Drupal.tableDrag['views-rearrange-filters'] == 'undefined') {
    return;
  }

  var table = $('#views-rearrange-filters', context).once('views-rearrange-filters');
  var operator = $('.form-item-filter-groups-operator', context).once('views-rearrange-filters');
  if (table.length) {
    new Drupal.viewsUi.rearrangeFilterHandler(table, operator);
  }
};

/**
 * Improve the UI of the rearrange filters dialog box.
 */
Drupal.viewsUi.rearrangeFilterHandler = function (table, operator) {
  var $ = jQuery;
  // Keep a reference to the <table> being altered and to the div containing
  // the filter groups operator dropdown (if it exists).
  this.table = table;
  this.operator = operator;
  this.hasGroupOperator = this.operator.length > 0;

  // Keep a reference to all draggable rows within the table.
  this.draggableRows = $('.draggable', table);

  // Keep a reference to the buttons for adding and removing filter groups.
  this.addGroupButton = $('input#views-add-group');
  this.removeGroupButtons = $('input.views-remove-group', table);

  // Add links that duplicate the functionality of the (hidden) add and remove
  // buttons.
  this.insertAddRemoveFilterGroupLinks();

  // When there is a filter groups operator dropdown on the page, create
  // duplicates of the dropdown between each pair of filter groups.
  if (this.hasGroupOperator) {
    this.dropdowns = this.duplicateGroupsOperator();
    this.syncGroupsOperators();
  }

  // Add methods to the tableDrag instance to account for operator cells (which
  // span multiple rows), the operator labels next to each filter (e.g., "And"
  // or "Or"), the filter groups, and other special aspects of this tableDrag
  // instance.
  this.modifyTableDrag();

  // Initialize the operator labels (e.g., "And" or "Or") that are displayed
  // next to the filters in each group, and bind a handler so that they change
  // based on the values of the operator dropdown within that group.
  this.redrawOperatorLabels();
  $('.views-group-title select', table)
    .once('views-rearrange-filter-handler')
    .bind('change.views-rearrange-filter-handler', $.proxy(this, 'redrawOperatorLabels'));

  // Bind handlers so that when a "Remove" link is clicked, we:
  // - Update the rowspans of cells containing an operator dropdown (since they
  //   need to change to reflect the number of rows in each group).
  // - Redraw the operator labels next to the filters in the group (since the
  //   filter that is currently displayed last in each group is not supposed to
  //   have a label display next to it).
  $('a.views-groups-remove-link', this.table)
    .once('views-rearrange-filter-handler')
    .bind('click.views-rearrange-filter-handler', $.proxy(this, 'updateRowspans'))
    .bind('click.views-rearrange-filter-handler', $.proxy(this, 'redrawOperatorLabels'));
};

/**
 * Insert links that allow filter groups to be added and removed.
 */
Drupal.viewsUi.rearrangeFilterHandler.prototype.insertAddRemoveFilterGroupLinks = function () {
  var $ = jQuery;

  // Insert a link for adding a new group at the top of the page, and make it
  // match the action links styling used in a typical page.tpl.php. Note that
  // Drupal does not provide a theme function for this markup, so this is the
  // best we can do.
  $('<ul class="action-links"><li><a id="views-add-group-link" href="#">' + this.addGroupButton.val() + '</a></li></ul>')
    .prependTo(this.table.parent())
    // When the link is clicked, dynamically click the hidden form button for
    // adding a new filter group.
    .once('views-rearrange-filter-handler')
    .bind('click.views-rearrange-filter-handler', $.proxy(this, 'clickAddGroupButton'));

  // Find each (visually hidden) button for removing a filter group and insert
  // a link next to it.
  var length = this.removeGroupButtons.length;
  for (i = 0; i < length; i++) {
    var $removeGroupButton = $(this.removeGroupButtons[i]);
    var buttonId = $removeGroupButton.attr('id');
    $('<a href="#" class="views-remove-group-link">' + Drupal.t('Remove group') + '</a>')
      .insertBefore($removeGroupButton)
      // When the link is clicked, dynamically click the corresponding form
      // button.
      .once('views-rearrange-filter-handler')
      .bind('click.views-rearrange-filter-handler', {buttonId: buttonId}, $.proxy(this, 'clickRemoveGroupButton'));
  }
};

/**
 * Dynamically click the button that adds a new filter group.
 */
Drupal.viewsUi.rearrangeFilterHandler.prototype.clickAddGroupButton = function () {
  // Due to conflicts between Drupal core's AJAX system and the Views AJAX
  // system, the only way to get this to work seems to be to trigger both the
  // .mousedown() and .submit() events.
  this.addGroupButton.mousedown();
  this.addGroupButton.submit();
  return false;
};

/**
 * Dynamically click a button for removing a filter group.
 *
 * @param event
 *   Event being triggered, with event.data.buttonId set to the ID of the
 *   form button that should be clicked.
 */
Drupal.viewsUi.rearrangeFilterHandler.prototype.clickRemoveGroupButton = function (event) {
  // For some reason, here we only need to trigger .submit(), unlike for
  // Drupal.viewsUi.rearrangeFilterHandler.prototype.clickAddGroupButton()
  // where we had to trigger .mousedown() also.
  jQuery('input#' + event.data.buttonId, this.table).submit();
  return false;
};

/**
 * Move the groups operator so that it's between the first two groups, and
 * duplicate it between any subsequent groups.
 */
Drupal.viewsUi.rearrangeFilterHandler.prototype.duplicateGroupsOperator = function () {
  var $ = jQuery;
  var dropdowns, newRow;

  var titleRows = $('tr.views-group-title'), titleRow;

  // Get rid of the explanatory text around the operator; its placement is
  // explanatory enough.
  this.operator.find('label').add('div.description').addClass('element-invisible');
  this.operator.find('select').addClass('form-select');

  // Keep a list of the operator dropdowns, so we can sync their behavior later.
  dropdowns = this.operator;

  // Move the operator to a new row just above the second group.
  titleRow = $('tr#views-group-title-2');
  newRow = $('<tr class="filter-group-operator-row"><td colspan="5"></td></tr>');
  newRow.find('td').append(this.operator);
  newRow.insertBefore(titleRow);
  var i, length = titleRows.length;
  // Starting with the third group, copy the operator to a new row above the
  // group title.
  for (i = 2; i < length; i++) {
    titleRow = $(titleRows[i]);
    // Make a copy of the operator dropdown and put it in a new table row.
    var fakeOperator = this.operator.clone();
    fakeOperator.attr('id', '');
    newRow = $('<tr class="filter-group-operator-row"><td colspan="5"></td></tr>');
    newRow.find('td').append(fakeOperator);
    newRow.insertBefore(titleRow);
    dropdowns = dropdowns.add(fakeOperator);
  }

  return dropdowns;
};

/**
 * Make the duplicated groups operators change in sync with each other.
 */
Drupal.viewsUi.rearrangeFilterHandler.prototype.syncGroupsOperators = function () {
  if (this.dropdowns.length < 2) {
    // We only have one dropdown (or none at all), so there's nothing to sync.
    return;
  }

  this.dropdowns.change(jQuery.proxy(this, 'operatorChangeHandler'));
};

/**
 * Click handler for the operators that appear between filter groups.
 *
 * Forces all operator dropdowns to have the same value.
 */
Drupal.viewsUi.rearrangeFilterHandler.prototype.operatorChangeHandler = function (event) {
  var $ = jQuery;
  var $target = $(event.target);
  var operators = this.dropdowns.find('select').not($target);

  // Change the other operators to match this new value.
  operators.val($target.val());
};

Drupal.viewsUi.rearrangeFilterHandler.prototype.modifyTableDrag = function () {
  var tableDrag = Drupal.tableDrag['views-rearrange-filters'];
  var filterHandler = this;

  /**
   * Override the row.onSwap method from tabledrag.js.
   *
   * When a row is dragged to another place in the table, several things need
   * to occur.
   * - The row needs to be moved so that it's within one of the filter groups.
   * - The operator cells that span multiple rows need their rowspan attributes
   *   updated to reflect the number of rows in each group.
   * - The operator labels that are displayed next to each filter need to be
   *   redrawn, to account for the row's new location.
   */
  tableDrag.row.prototype.onSwap = function () {
    if (filterHandler.hasGroupOperator) {
      // Make sure the row that just got moved (this.group) is inside one of
      // the filter groups (i.e. below an empty marker row or a draggable). If
      // it isn't, move it down one.
      var thisRow = jQuery(this.group);
      var previousRow = thisRow.prev('tr');
      if (previousRow.length && !previousRow.hasClass('group-message') && !previousRow.hasClass('draggable')) {
        // Move the dragged row down one.
        var next = thisRow.next();
        if (next.is('tr')) {
          this.swap('after', next);
        }
      }
      filterHandler.updateRowspans();
    }
    // Redraw the operator labels that are displayed next to each filter, to
    // account for the row's new location.
    filterHandler.redrawOperatorLabels();
  };

  /**
   * Override the onDrop method from tabledrag.js.
   */
  tableDrag.onDrop = function () {
    var $ = jQuery;

    // If the tabledrag change marker (i.e., the "*") has been inserted inside
    // a row after the operator label (i.e., "And" or "Or") rearrange the items
    // so the operator label continues to appear last.
    var changeMarker = $(this.oldRowElement).find('.tabledrag-changed');
    if (changeMarker.length) {
      // Search for occurrences of the operator label before the change marker,
      // and reverse them.
      var operatorLabel = changeMarker.prevAll('.views-operator-label');
      if (operatorLabel.length) {
        operatorLabel.insertAfter(changeMarker);
      }
    }

    // Make sure the "group" dropdown is properly updated when rows are dragged
    // into an empty filter group. This is borrowed heavily from the block.js
    // implementation of tableDrag.onDrop().
    var groupRow = $(this.rowObject.element).prevAll('tr.group-message').get(0);
    var groupName = groupRow.className.replace(/([^ ]+[ ]+)*group-([^ ]+)-message([ ]+[^ ]+)*/, '$2');
    var groupField = $('select.views-group-select', this.rowObject.element);
    if ($(this.rowObject.element).prev('tr').is('.group-message') && !groupField.is('.views-group-select-' + groupName)) {
      var oldGroupName = groupField.attr('class').replace(/([^ ]+[ ]+)*views-group-select-([^ ]+)([ ]+[^ ]+)*/, '$2');
      groupField.removeClass('views-group-select-' + oldGroupName).addClass('views-group-select-' + groupName);
      groupField.val(groupName);
    }
  };
};


/**
 * Redraw the operator labels that are displayed next to each filter.
 */
Drupal.viewsUi.rearrangeFilterHandler.prototype.redrawOperatorLabels = function () {
  var $ = jQuery;
  for (i = 0; i < this.draggableRows.length; i++) {
    // Within the row, the operator labels are displayed inside the first table
    // cell (next to the filter name).
    var $draggableRow = $(this.draggableRows[i]);
    var $firstCell = $('td:first', $draggableRow);
    if ($firstCell.length) {
      // The value of the operator label ("And" or "Or") is taken from the
      // first operator dropdown we encounter, going backwards from the current
      // row. This dropdown is the one associated with the current row's filter
      // group.
      var operatorValue = $draggableRow.prevAll('.views-group-title').find('option:selected').html();
      var operatorLabel = '<span class="views-operator-label">' + operatorValue + '</span>';
      // If the next visible row after this one is a draggable filter row,
      // display the operator label next to the current row. (Checking for
      // visibility is necessary here since the "Remove" links hide the removed
      // row but don't actually remove it from the document).
      var $nextRow = $draggableRow.nextAll(':visible').eq(0);
      var $existingOperatorLabel = $firstCell.find('.views-operator-label');
      if ($nextRow.hasClass('draggable')) {
        // If an operator label was already there, replace it with the new one.
        if ($existingOperatorLabel.length) {
          $existingOperatorLabel.replaceWith(operatorLabel);
        }
        // Otherwise, append the operator label to the end of the table cell.
        else {
          $firstCell.append(operatorLabel);
        }
      }
      // If the next row doesn't contain a filter, then this is the last row
      // in the group. We don't want to display the operator there (since
      // operators should only display between two related filters, e.g.
      // "filter1 AND filter2 AND filter3"). So we remove any existing label
      // that this row has.
      else {
        $existingOperatorLabel.remove();
      }
    }
  }
};

/**
 * Update the rowspan attribute of each cell containing an operator dropdown.
 */
Drupal.viewsUi.rearrangeFilterHandler.prototype.updateRowspans = function () {
  var $ = jQuery;
  var i, $row, $currentEmptyRow, draggableCount, $operatorCell;
  var rows = $(this.table).find('tr');
  var length = rows.length;
  for (i = 0; i < length; i++) {
    $row = $(rows[i]);
    if ($row.hasClass('views-group-title')) {
      // This row is a title row.
      // Keep a reference to the cell containing the dropdown operator.
      $operatorCell = $($row.find('td.group-operator'));
      // Assume this filter group is empty, until we find otherwise.
      draggableCount = 0;
      $currentEmptyRow = $row.next('tr');
      $currentEmptyRow.removeClass('group-populated').addClass('group-empty');
      // The cell with the dropdown operator should span the title row and
      // the "this group is empty" row.
      $operatorCell.attr('rowspan', 2);
    }
    else if (($row).hasClass('draggable') && $row.is(':visible')) {
      // We've found a visible filter row, so we now know the group isn't empty.
      draggableCount++;
      $currentEmptyRow.removeClass('group-empty').addClass('group-populated');
      // The operator cell should span all draggable rows, plus the title.
      $operatorCell.attr('rowspan', draggableCount + 1);
    }
  }
};

Drupal.behaviors.viewsFilterConfigSelectAll = {};

/**
 * Add a select all checkbox, which checks each checkbox at once.
 */
Drupal.behaviors.viewsFilterConfigSelectAll.attach = function(context) {
  var $ = jQuery;
  // Show the select all checkbox.
  $('#views-ui-config-item-form div.form-item-options-value-all', context).once(function() {
    $(this).show();
  })
  .find('input[type=checkbox]')
  .click(function() {
    var checked = $(this).is(':checked');
    // Update all checkbox beside the select all checkbox.
    $(this).parents('.form-checkboxes').find('input[type=checkbox]').each(function() {
      $(this).attr('checked', checked);
    });
  });
  // Uncheck the select all checkbox if any of the others are unchecked.
  $('#views-ui-config-item-form div.form-type-checkbox').not($('.form-item-options-value-all')).find('input[type=checkbox]').each(function() {
    $(this).click(function() {
      if ($(this).is('checked') == 0) {
        $('#edit-options-value-all').removeAttr('checked');
      }
    });
  });
};

/**
 * Ensure the desired default button is used when a form is implicitly submitted via an ENTER press on textfields, radios, and checkboxes.
 *
 * @see http://www.w3.org/TR/html5/association-of-controls-and-forms.html#implicit-submission
 */
Drupal.behaviors.viewsImplicitFormSubmission = {};
Drupal.behaviors.viewsImplicitFormSubmission.attach = function (context, settings) {
  var $ = jQuery;
  $(':text, :password, :radio, :checkbox', context).once('viewsImplicitFormSubmission', function() {
    $(this).keypress(function(event) {
      if (event.which == 13) {
        var formId = this.form.id;
        if (formId && settings.viewsImplicitFormSubmission && settings.viewsImplicitFormSubmission[formId] && settings.viewsImplicitFormSubmission[formId].defaultButton) {
          event.preventDefault();
          var buttonId = settings.viewsImplicitFormSubmission[formId].defaultButton;
          var $button = $('#' + buttonId, this.form);
          if ($button.length == 1 && $button.is(':enabled')) {
            if (Drupal.ajax && Drupal.ajax[buttonId]) {
              $button.trigger(Drupal.ajax[buttonId].element_settings.event);
            }
            else {
              $button.click();
            }
          }
        }
      }
    });
  });
};

/**
 * Remove icon class from elements that are themed as buttons or dropbuttons.
 */
Drupal.behaviors.viewsRemoveIconClass = {};
Drupal.behaviors.viewsRemoveIconClass.attach = function (context, settings) {
  jQuery('.ctools-button', context).once('RemoveIconClass', function () {
    var $ = jQuery;
    var $this = $(this);
    $('.icon', $this).removeClass('icon');
    $('.horizontal', $this).removeClass('horizontal');
  });
};

/**
 * Change "Expose filter" buttons into checkboxes.
 */
Drupal.behaviors.viewsUiCheckboxify = {};
Drupal.behaviors.viewsUiCheckboxify.attach = function (context, settings) {
  var $ = jQuery;
  var $buttons = $('#edit-options-expose-button-button, #edit-options-group-button-button').once('views-ui-checkboxify');
  var length = $buttons.length;
  var i;
  for (i = 0; i < length; i++) {
    new Drupal.viewsUi.Checkboxifier($buttons[i]);
  }
};

/**
 * Change the default widget to select the default group according to the
 * selected widget for the exposed group.
 */
Drupal.behaviors.viewsUiChangeDefaultWidget = {};
Drupal.behaviors.viewsUiChangeDefaultWidget.attach = function (context, settings) {
  var $ = jQuery;
  function change_default_widget(multiple) {
    if (multiple) {
      $('input.default-radios').hide();
      $('td.any-default-radios-row').parent().hide();
      $('input.default-checkboxes').show();
    }
    else {
      $('input.default-checkboxes').hide();
      $('td.any-default-radios-row').parent().show();
      $('input.default-radios').show();
    }
  }
  // Update on widget change.
  $('input[name="options[group_info][multiple]"]').change(function() {
    change_default_widget($(this).attr("checked"));
  });
  // Update the first time the form is rendered.
  $('input[name="options[group_info][multiple]"]').trigger('change');
};

/**
 * Attaches an expose filter button to a checkbox that triggers its click event.
 *
 * @param button
 *   The DOM object representing the button to be checkboxified.
 */
Drupal.viewsUi.Checkboxifier = function (button) {
  var $ = jQuery;
  this.$button = $(button);
  this.$parent = this.$button.parent('div.views-expose, div.views-grouped');
  this.$input = this.$parent.find('input:checkbox, input:radio');
  // Hide the button and its description.
  this.$button.hide();
  this.$parent.find('.exposed-description, .grouped-description').hide();

  this.$input.click($.proxy(this, 'clickHandler'));

};

/**
 * When the checkbox is checked or unchecked, simulate a button press.
 */
Drupal.viewsUi.Checkboxifier.prototype.clickHandler = function (e) {
  this.$button.mousedown();
  this.$button.submit();
};

/**
 * Change the Apply button text based upon the override select state.
 */
Drupal.behaviors.viewsUiOverrideSelect = {};
Drupal.behaviors.viewsUiOverrideSelect.attach = function (context, settings) {
  var $ = jQuery;
  $('#edit-override-dropdown', context).once('views-ui-override-button-text', function() {
    // Closures! :(
    var $submit = $('#edit-submit', context);
    var old_value = $submit.val();

    $submit.once('views-ui-override-button-text')
      .bind('mouseup', function() {
        $(this).val(old_value);
        return true;
      });

    $(this).bind('change', function() {
      if ($(this).val() == 'default') {
        $submit.val(Drupal.t('Apply (all displays)'));
      }
      else if ($(this).val() == 'default_revert') {
        $submit.val(Drupal.t('Revert to default'));
      }
      else {
        $submit.val(Drupal.t('Apply (this display)'));
      }
    })
    .trigger('change');
  });

};

Drupal.viewsUi.resizeModal = function (e, no_shrink) {
  var $ = jQuery;
  var $modal = $('.views-ui-dialog');
  var $scroll = $('.scroll', $modal);
  if ($modal.size() == 0 || $modal.css('display') == 'none') {
    return;
  }

  var maxWidth = parseInt($(window).width() * .85); // 70% of window
  var minWidth = parseInt($(window).width() * .6); // 70% of window

  // Set the modal to the minwidth so that our width calculation of
  // children works.
  $modal.css('width', minWidth);
  var width = minWidth;

  // Don't let the window get more than 80% of the display high.
  var maxHeight = parseInt($(window).height() * .8);
  var minHeight = 200;
  if (no_shrink) {
    minHeight = $modal.height();
  }

  if (minHeight > maxHeight) {
    minHeight = maxHeight;
  }

  var height = 0;

  // Calculate the height of the 'scroll' region.
  var scrollHeight = 0;

  scrollHeight += parseInt($scroll.css('padding-top'));
  scrollHeight += parseInt($scroll.css('padding-bottom'));

  $scroll.children().each(function() {
    var w = $(this).innerWidth();
    if (w > width) {
      width = w;
    }
    scrollHeight += $(this).outerHeight(true);
  });

  // Now, calculate what the difference between the scroll and the modal
  // will be.

  var difference = 0;
  difference += parseInt($scroll.css('padding-top'));
  difference += parseInt($scroll.css('padding-bottom'));
  difference += $('.views-override').outerHeight(true);
  difference += $('.views-messages').outerHeight(true);
  difference += $('#views-ajax-title').outerHeight(true);
  difference += $('.views-add-form-selected').outerHeight(true);
  difference += $('.form-buttons', $modal).outerHeight(true);

  height = scrollHeight + difference;

  if (height > maxHeight) {
    height = maxHeight;
    scrollHeight = maxHeight - difference;
  }
  else if (height < minHeight) {
    height = minHeight;
    scrollHeight = minHeight - difference;
  }

  if (width > maxWidth) {
    width = maxWidth;
  }

  // Get where we should move content to
  var top = ($(window).height() / 2) - (height / 2);
  var left = ($(window).width() / 2) - (width / 2);

  $modal.css({
    'top': top + 'px',
    'left': left + 'px',
    'width': width + 'px',
    'height': height + 'px'
  });

  // Ensure inner popup height matches.
  $(Drupal.settings.views.ajax.popup).css('height', height + 'px');

  $scroll.css({
    'height': scrollHeight + 'px',
    'max-height': scrollHeight + 'px'
  });

};

jQuery(function() {
  jQuery(window).bind('resize', Drupal.viewsUi.resizeModal);
  jQuery(window).bind('scroll', Drupal.viewsUi.resizeModal);
});
;
/**
 * @file
 * Provides dependent visibility for form items in CTools' ajax forms.
 *
 * To your $form item definition add:
 * - '#process' => array('ctools_process_dependency'),
 * - '#dependency' => array('id-of-form-item' => array(list, of, values, that,
 *   make, this, item, show),
 *
 * Special considerations:
 * - Radios are harder. Because Drupal doesn't give radio groups individual IDs,
 *   use 'radio:name-of-radio'.
 *
 * - Checkboxes don't have their own id, so you need to add one in a div
 *   around the checkboxes via #prefix and #suffix. You actually need to add TWO
 *   divs because it's the parent that gets hidden. Also be sure to retain the
 *   'expand_checkboxes' in the #process array, because the CTools process will
 *   override it.
 */

(function ($) {
  Drupal.CTools = Drupal.CTools || {};
  Drupal.CTools.dependent = {};

  Drupal.CTools.dependent.bindings = {};
  Drupal.CTools.dependent.activeBindings = {};
  Drupal.CTools.dependent.activeTriggers = [];

  Drupal.CTools.dependent.inArray = function(array, search_term) {
    var i = array.length;
    while (i--) {
      if (array[i] == search_term) {
         return true;
      }
    }
    return false;
  }


  Drupal.CTools.dependent.autoAttach = function() {
    // Clear active bindings and triggers.
    for (i in Drupal.CTools.dependent.activeTriggers) {
      $(Drupal.CTools.dependent.activeTriggers[i]).unbind('change.ctools-dependent');
    }
    Drupal.CTools.dependent.activeTriggers = [];
    Drupal.CTools.dependent.activeBindings = {};
    Drupal.CTools.dependent.bindings = {};

    if (!Drupal.settings.CTools) {
      return;
    }

    // Iterate through all relationships
    for (id in Drupal.settings.CTools.dependent) {
      // Test to make sure the id even exists; this helps clean up multiple
      // AJAX calls with multiple forms.

      // Drupal.CTools.dependent.activeBindings[id] is a boolean,
      // whether the binding is active or not.  Defaults to no.
      Drupal.CTools.dependent.activeBindings[id] = 0;
      // Iterate through all possible values
      for(bind_id in Drupal.settings.CTools.dependent[id].values) {
        // This creates a backward relationship.  The bind_id is the ID
        // of the element which needs to change in order for the id to hide or become shown.
        // The id is the ID of the item which will be conditionally hidden or shown.
        // Here we're setting the bindings for the bind
        // id to be an empty array if it doesn't already have bindings to it
        if (!Drupal.CTools.dependent.bindings[bind_id]) {
          Drupal.CTools.dependent.bindings[bind_id] = [];
        }
        // Add this ID
        Drupal.CTools.dependent.bindings[bind_id].push(id);
        // Big long if statement.
        // Drupal.settings.CTools.dependent[id].values[bind_id] holds the possible values

        if (bind_id.substring(0, 6) == 'radio:') {
          var trigger_id = "input[name='" + bind_id.substring(6) + "']";
        }
        else {
          var trigger_id = '#' + bind_id;
        }

        Drupal.CTools.dependent.activeTriggers.push(trigger_id);

        if ($(trigger_id).attr('type') == 'checkbox') {
          $(trigger_id).siblings('label').addClass('hidden-options');
        }

        var getValue = function(item, trigger) {
          if ($(trigger).size() == 0) {
            return null;
          }

          if (item.substring(0, 6) == 'radio:') {
            var val = $(trigger + ':checked').val();
          }
          else {
            switch ($(trigger).attr('type')) {
              case 'checkbox':
                var val = $(trigger).attr('checked') ? true : false;

                if (val) {
                  $(trigger).siblings('label').removeClass('hidden-options').addClass('expanded-options');
                }
                else {
                  $(trigger).siblings('label').removeClass('expanded-options').addClass('hidden-options');
                }

                break;
              default:
                var val = $(trigger).val();
            }
          }
          return val;
        }

        var setChangeTrigger = function(trigger_id, bind_id) {
          // Triggered when change() is clicked.
          var changeTrigger = function() {
            var val = getValue(bind_id, trigger_id);

            if (val == null) {
              return;
            }

            for (i in Drupal.CTools.dependent.bindings[bind_id]) {
              var id = Drupal.CTools.dependent.bindings[bind_id][i];
              // Fix numerous errors
              if (typeof id != 'string') {
                continue;
              }

              // This bit had to be rewritten a bit because two properties on the
              // same set caused the counter to go up and up and up.
              if (!Drupal.CTools.dependent.activeBindings[id]) {
                Drupal.CTools.dependent.activeBindings[id] = {};
              }

              if (val != null && Drupal.CTools.dependent.inArray(Drupal.settings.CTools.dependent[id].values[bind_id], val)) {
                Drupal.CTools.dependent.activeBindings[id][bind_id] = 'bind';
              }
              else {
                delete Drupal.CTools.dependent.activeBindings[id][bind_id];
              }

              var len = 0;
              for (i in Drupal.CTools.dependent.activeBindings[id]) {
                len++;
              }

              var object = $('#' + id + '-wrapper');
              if (!object.size()) {
                // Some elements can't use the parent() method or they can
                // damage things. They are guaranteed to have wrappers but
                // only if dependent.inc provided them. This check prevents
                // problems when multiple AJAX calls cause settings to build
                // up.
                var $original = $('#' + id);
                if ($original.is('fieldset') || $original.is('textarea')) {
                  continue;
                }

                object = $('#' + id).parent();
              }

              if (Drupal.settings.CTools.dependent[id].type == 'disable') {
                if (Drupal.settings.CTools.dependent[id].num <= len) {
                  // Show if the element if criteria is matched
                  object.attr('disabled', false);
                  object.addClass('dependent-options');
                  object.children().attr('disabled', false);
                }
                else {
                  // Otherwise hide. Use css rather than hide() because hide()
                  // does not work if the item is already hidden, for example,
                  // in a collapsed fieldset.
                  object.attr('disabled', true);
                  object.children().attr('disabled', true);
                }
              }
              else {
                if (Drupal.settings.CTools.dependent[id].num <= len) {
                  // Show if the element if criteria is matched
                  object.show(0);
                  object.addClass('dependent-options');
                }
                else {
                  // Otherwise hide. Use css rather than hide() because hide()
                  // does not work if the item is already hidden, for example,
                  // in a collapsed fieldset.
                  object.css('display', 'none');
                }
              }
            }
          }

          $(trigger_id).bind('change.ctools-dependent', function() {
            // Trigger the internal change function
            // the attr('id') is used because closures are more confusing
            changeTrigger(trigger_id, bind_id);
          });
          // Trigger initial reaction
          changeTrigger(trigger_id, bind_id);
        }
        setChangeTrigger(trigger_id, bind_id);
      }
    }
  }

  Drupal.behaviors.CToolsDependent = {
    attach: function (context) {
      Drupal.CTools.dependent.autoAttach();

      // Really large sets of fields are too slow with the above method, so this
      // is a sort of hacked one that's faster but much less flexible.
      $("select.ctools-master-dependent")
        .once('ctools-dependent')
        .bind('change.ctools-dependent', function() {
          var val = $(this).val();
          if (val == 'all') {
            $('.ctools-dependent-all').show(0);
          }
          else {
            $('.ctools-dependent-all').hide(0);
            $('.ctools-dependent-' + val).show(0);
          }
        })
        .trigger('change.ctools-dependent');
    }
  }
})(jQuery);
;
// $Id: admin.devel.js,v 1.1.2.1.2.2 2010/09/16 18:30:47 yhahn Exp $
(function($) {

Drupal.behaviors.adminDevel = {};
Drupal.behaviors.adminDevel.attach = function(context) {
  $('#block-admin-devel:not(.admin-processed)').each(function() {
    var devel = $(this);
    devel.addClass('admin-processed');

    // Pull logged values from footer output into the block.
    $('li', devel).each(function() {
      var key = $(this).attr('class').split(' ')[0];
      if (key && $('body > .'+key).size() > 0) {
        var value = $('body > .'+key).html();
        $('div.dev-info', this).html(value);
      }
    });

    // Query list show handler.
    $('input.dev-querylog-show', devel).click(function() {
      $(this).hide().siblings('input.dev-querylog-hide').show();
      $('body > *:not(#admin-toolbar, .region-page-bottom, .devel-querylog)').addClass('devel-hide');
      $('body > .devel-querylog').show();
      return false;
    });

    // Query list hide handler.
    $('input.dev-querylog-hide').click(function() {
      $(this).hide().siblings('input.dev-querylog-show').show();
      $('body > *:not(#admin-toolbar, .region-page-bottom, .devel-querylog)').removeClass('devel-hide');
      $('body > .devel-querylog').hide();
      return false;
    });
  });
};

})(jQuery);;
