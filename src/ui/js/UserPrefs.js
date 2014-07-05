// namespace for this "module"
var UserPrefs = {};

UserPrefs.NAME_IRL_MAX_LENGTH = 40;
UserPrefs.EMAIL_MAX_LENGTH = 254;
UserPrefs.MIN_IMAGE_SIZE = 80;
UserPrefs.MAX_IMAGE_SIZE = 200;
UserPrefs.HOMEPAGE_MAX_LENGTH = 100;
UserPrefs.COMMENT_MAX_LENGTH = 255;

////////////////////////////////////////////////////////////////////////
// Action flow through this page:
// * UserPrefs.showUserPrefsPage() is the landing function.  Always call
//   this first
// * UserPrefs.assemblePage(), which calls one of a number of functions
//   UserPrefs.action<SomeAction>()
// * each UserPrefs.action<SomeAction>() function must set UserPrefs.page and
//   UserPrefs.form, then call UserPrefs.arrangePage()
// * UserPrefs.arrangePage() sets the contents of <div id="userprefs_page">
//   on the live page
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
// GENERIC FUNCTIONS: these do not depend on the action being taken

UserPrefs.showUserPrefsPage = function() {

  // Setup necessary elements for displaying status messages
  Env.setupEnvStub();

  // Make sure the div element that we will need exists in the page body
  if ($('#userprefs_page').length === 0) {
    $('body').append($('<div>', {'id': 'userprefs_page' }));
  }

  // Only allow logged-in users to view and change preferences
  if (Login.logged_in) {
    Api.getButtonData(function() {
      Api.getUserPrefsData(UserPrefs.assemblePage);
    });
  } else {
    Env.message = {
      'type': 'error',
      'text': 'Can\'t view/set preferences because you are not logged in',
    };
    UserPrefs.actionFailed();
  }
};

// Assemble and display the userprefs portion of the page
UserPrefs.assemblePage = function() {
  if (Api.user_prefs.load_status == 'ok') {

    // There's only one possible action, allowing the user to change
    // the preferences
    UserPrefs.actionSetPrefs();
  } else {
    UserPrefs.actionFailed();
  }
};

// Actually lay out the page
UserPrefs.arrangePage = function() {

  // If there is a message from a current or previous invocation of this
  // page, display it now
  Env.showStatusMessage();

  $('#userprefs_page').empty();
  $('#userprefs_page').append(UserPrefs.page);

  if (UserPrefs.form) {
    $('#userprefs_action_button').click(UserPrefs.form);
  }
};

////////////////////////////////////////////////////////////////////////
// This section contains one page for each type of next action used for
// flow through the page being laid out by UserPrefs.js.
// Each function should start by populating UserPrefs.page and
// UserPrefs.form and end by invoking UserPrefs.arrangePage();

UserPrefs.actionFailed = function() {

  // Create empty page and undefined form objects to be filled later
  UserPrefs.page = $('<div>');
  UserPrefs.form = null;

  // No text because page data acquisition failed - Env.message
  // will tell the user what happened

  // Lay out the page
  UserPrefs.arrangePage();
};

UserPrefs.actionSetPrefs = function() {
  // Include the option to leave them blank
  var buttons = { '': '' };
  var buttonSets = { '': '' };

  $.each(Api.button.list, function(button, buttonInfo) {
    buttonSets[buttonInfo.buttonSet] = buttonInfo.buttonSet;
    buttons[button] = button;
  });

  // Create empty page and undefined form objects to be filled later
  UserPrefs.page = $('<div>');
  UserPrefs.form = null;

  var prefsdiv = $('<div>');
  var prefsform = $('<form>', {
    'id': 'userprefs_action_form',
    'action': 'javascript:void(0);'
  });

  var profileBlurb = 'These settings affect what appears on your profile page.';
  var profileSettings = {
    'name_irl': {
      'text': 'Real name',
      'type': 'text',
      'value': Api.user_prefs.name_irl,
      'length': UserPrefs.NAME_IRL_MAX_LENGTH,
    },
    'is_email_public': {
      'text': 'Make email address public',
      'type': 'checkbox',
      'checked': Api.user_prefs.is_email_public,
    },
    'dob': {
      'text': 'Birthday',
      'type': 'date',
      'value': {
        'month': Api.user_prefs.dob_month,
        'day': Api.user_prefs.dob_day,
      },
    },
    'gender': {
      'text': 'Gender',
      'type': 'select',
      'value': Api.user_prefs.gender,
      'source': {
        '': '',
        'Male': 'Male',
        'Female': 'Female',
        'It\'s complicated': 'It\'s complicated',
      },
    },
    'favorite_button': {
      'text': 'Favorite button',
      'type': 'select',
      'value': Api.user_prefs.favorite_button,
      'source': buttons,
    },
    'favorite_buttonset': {
      'text': 'Favorite button set',
      'type': 'select',
      'value': Api.user_prefs.favorite_buttonset,
      'source': buttonSets,
    },
    'image_size': {
      'text': 'Gravatar image size (if you use one)',
      'type': 'text',
      'value': Api.user_prefs.image_size,
      'after': ' pixels',
    },
    'homepage': {
      'text': 'Homepage',
      'type': 'text',
      'value': Api.user_prefs.homepage,
      'length': UserPrefs.HOMEPAGE_MAX_LENGTH,
    },
    'comment': {
      'text': 'Comment',
      'type': 'textarea',
      'value': Api.user_prefs.comment,
      'length': UserPrefs.COMMENT_MAX_LENGTH,
    },
  };

  var gameplayBlurb = 'These preferences affect the actions you take during ' +
    'the game.';
  var gameplayPrefs = {
    'autopass': {
      'text': 'Automatically pass when you have no valid attack',
      'type': 'checkbox',
      'checked': Api.user_prefs.autopass,
    },
  };

  var accountBlurb = 'Current password is required to change email address ' +
    'or password.';
  var accountSettings = {
    'current_password': {
      'text': 'Current password',
      'type': 'password',
      'value': '',
    },
    'new_password': {
      'text': 'New password',
      'type': 'password',
      'value': '',
    },
    'confirm_new_password': {
      'text': 'Confirm new password',
      'type': 'password',
      'value': '',
    },
    'current_email': {
      'text': 'Current email address',
      'type': 'display',
      'value': Api.user_prefs.email,
      'length': UserPrefs.EMAIL_MAX_LENGTH,
    },
    'new_email': {
      'text': 'New email address',
      'type': 'text',
      'value': '',
      'length': UserPrefs.EMAIL_MAX_LENGTH,
    },
    'confirm_new_email': {
      'text': 'Confirm new email address',
      'type': 'text',
      'value': '',
    },
  };

  var browserBlurb = 'These preferences will only apply to the browser ' +
    'you\'re currently using.';
  var browserPrefs = {
    'noImages': {
      'text': 'Don\'t load button or player images',
      'type': 'checkbox',
      'checked': Env.getCookieNoImages(),
    },
    'compactMode': {
      'text': 'Use compact version of game interface',
      'type': 'checkbox',
      'checked': Env.getCookieCompactMode(),
    }
  };

  var prefsTable = $('<table>', { 'class': 'prefsTable', });
  prefsdiv.append(prefsTable);

  UserPrefs.appendToPreferencesTable(prefsTable, 'Profile Settings',
    profileBlurb, profileSettings);
  UserPrefs.appendToPreferencesTable(prefsTable, 'Gameplay Preferences',
    gameplayBlurb, gameplayPrefs);
  UserPrefs.appendToPreferencesTable(prefsTable, 'Account Settings',
    accountBlurb, accountSettings);
  UserPrefs.appendToPreferencesTable(prefsTable, 'Browser Preferences',
    browserBlurb, browserPrefs);

  // Form submission button
  prefsform.append($('<button>', {
    'id': 'userprefs_action_button',
    'text': 'Save preferences'
  }));
  prefsdiv.append(prefsform);

  UserPrefs.page.append(prefsdiv);

  // Function to invoke on button click
  UserPrefs.form = UserPrefs.formSetPrefs;

  // Lay out the page
  UserPrefs.arrangePage();
};

////////////////////////////////////////////////////////////////////////
// These functions define form submissions, one per action type

UserPrefs.formSetPrefs = function() {
  Env.message = null;
  Env.showStatusMessage();

  var name_irl = $('#userprefs_name_irl').val();
  var is_email_public = $('#userprefs_is_email_public').prop('checked');
  var dob_month = $('#userprefs_dob_month').val();
  var dob_day = $('#userprefs_dob_day').val();
  var gender = $('#userprefs_gender').val();
  var favorite_button = $('#userprefs_favorite_button').val();
  var favorite_buttonset = $('#userprefs_favorite_buttonset').val();
  var image_size = $('#userprefs_image_size').val();
  var homepage = $('#userprefs_homepage').val();
  var comment = $('#userprefs_comment').val();
  var autopass = $('#userprefs_autopass').prop('checked');
  var current_password = $('#userprefs_current_password').val();
  var new_password = $('#userprefs_new_password').val();
  var confirm_new_password = $('#userprefs_confirm_new_password').val();
  var new_email = $('#userprefs_new_email').val();
  var confirm_new_email = $('#userprefs_confirm_new_email').val();
  var noImages = $('#userprefs_noImages').prop('checked');
  var compactMode = $('#userprefs_compactMode').prop('checked');

  var validationErrors = '';

  if ((dob_month !== 0 && dob_day === 0) ||
    (dob_month === 0 && dob_day !== 0)) {
    validationErrors += 'Birthday is incomplete. ';
  }

  if (image_size !== '') {
    if (isNaN(image_size)) {
      validationErrors += 'Gravatar size must be a number of pixels. ';
    } else {
      image_size = parseInt(image_size, 10);
      if (image_size < UserPrefs.MIN_IMAGE_SIZE ||
          image_size > UserPrefs.MAX_IMAGE_SIZE) {
        validationErrors +=
          'Gravatar size must be between ' + UserPrefs.MIN_IMAGE_SIZE +
          ' and ' + UserPrefs.MAX_IMAGE_SIZE + ' pixels. ';
      }
    }
  }

  if (new_password != confirm_new_password) {
    validationErrors += 'New passwords do not match. ';
  }
  if (new_email != confirm_new_email) {
    validationErrors += 'New email addresses do not match. ';
  }
  if (new_email && !new_email.match(Api.VALID_EMAIL_REGEX)) {
    validationErrors += 'Email address is formatted incorrectly. ';
  }
  if (new_password && !current_password) {
    validationErrors += 'Current password is required to change password. ';
  }
  if (new_email && !current_password) {
    validationErrors += 'Current password is required to change email. ';
  }

  if (validationErrors !== '') {
    Env.message = {
      'type': 'error',
      'text': validationErrors,
    };
    Env.showStatusMessage();
    return;
  }

  Env.setCookieNoImages(noImages);
  Env.setCookieCompactMode(compactMode);

  // Only pass these values if the user typed something in
  if (!current_password) {
    current_password = undefined;
  }
  if (!new_password) {
    new_password = undefined;
  }
  if (!new_email) {
    new_email = undefined;
  }

  if (!favorite_button) {
    favorite_button = undefined;
  }

  if (!favorite_buttonset) {
    favorite_buttonset = undefined;
  }

  if (!image_size) {
    image_size = undefined;
  }

  Api.apiFormPost(
    {
      'type': 'savePlayerInfo',
      'name_irl': name_irl,
      'is_email_public': is_email_public,
      'dob_month': dob_month,
      'dob_day': dob_day,
      'gender': gender,
      'favorite_button': favorite_button,
      'favorite_buttonset': favorite_buttonset,
      'image_size': image_size,
      'homepage': homepage,
      'comment': comment,
      'autopass': autopass,
      'current_password': current_password,
      'new_password': new_password,
      'new_email': new_email,
    },
    {
      'ok': { 'type': 'fixed', 'text': 'User details set successfully.', },
      'notok': { 'type': 'server', }
    },
    'userprefs_action_button',
    UserPrefs.showUserPrefsPage,
    UserPrefs.showUserPrefsPage
  );
};

////////////////////////////////////////////////////////////////////////
// Utilty functions for building page elements

UserPrefs.appendToPreferencesTable = function(prefsTable, sectionTitle,
  sectionBlurb, prefs) {
  var titleRow = $('<tr>');
  prefsTable.append(titleRow);
  titleRow.append($('<th>', {
    'class': 'title2',
    'text': sectionTitle,
    'colspan': '2',
  }));

  var blurbRow = $('<tr>');
  prefsTable.append(blurbRow);
  blurbRow.append($('<td>', {
    'html': sectionBlurb,
    'style': 'font-style: italic;',
    'colspan': '2',
  }));

  $.each(prefs, function(entryKey, entryInfo) {
    var entryRow = $('<tr>');
    var labelText = entryInfo.text;
    if (labelText) {
      labelText += ':';
    }
    entryRow.append($('<td>', {
      'text': labelText,
      'class': 'label'
    }));
    var entryInput = $('<td>', { 'class': 'value', });
    switch(entryInfo.type) {
    case 'display':
      entryInput.append($('<span>', { 'text': entryInfo.value, }));
      break;
    case 'date':
      var monthSelect = $('<select>', {
        'name': entryKey + '_month',
        'id': 'userprefs_' + entryKey + '_month',
      });
      entryInput.append(monthSelect);
      for (var monthIndex = 0; monthIndex <= 12; monthIndex++) {
        monthSelect.append($('<option>', {
          'value': monthIndex,
          'text': Api.MONTH_NAMES[monthIndex],
          'selected': (entryInfo.value.month == monthIndex),
        }));
      }

      var daySelect = $('<select>', {
        'name': entryKey + '_day',
        'id': 'userprefs_' + entryKey + '_day',
      });
      entryInput.append(daySelect);
      for (var dayIndex = 0; dayIndex <= 31; dayIndex++) {
        daySelect.append($('<option>', {
          'value': dayIndex,
          'text': (dayIndex === 0 ? 'Day' : dayIndex),
          'selected': (entryInfo.value.day == dayIndex),
        }));
      }

      break;
    case 'textarea':
      entryInput.append($('<textarea>', {
        'name': entryKey,
        'id': 'userprefs_' + entryKey,
        'maxlength': entryInfo.length,
        'rows': 6,
      }).val(entryInfo.value));
      break;
    case 'image':
      if (entryInfo.value) {
        var url = entryInfo.value;
        if (!url.match(/^http/i)) {
          url = 'http://' + url;
        }
        entryInput.append($('<img>', {
          'src': url,
          'class': 'profileImage',
        }));
      }
      break;
    case 'select':
      var select = $('<select>', {
        'name': entryKey,
        'id': 'userprefs_' + entryKey,
      });
      entryInput.append(select);
      $.each(entryInfo.source, function(key, value) {
        select.append($('<option>', {
          'text': key,
          'value': value,
        }));
      });
      select.val(entryInfo.value);
      break;
    default:
      entryInput.append($('<input>', {
        'type': entryInfo.type,
        'name': entryKey,
        'id': 'userprefs_' + entryKey,
        'value': entryInfo.value,
        'checked': entryInfo.checked,
        'maxlength': entryInfo.length,
      }));
    }
    entryRow.append(entryInput);

    if (entryInfo.after) {
      entryInput.append(entryInfo.after);
    }
    prefsTable.append(entryRow);
  });

  var spacerRow = $('<tr>');
  prefsTable.append(spacerRow);
  spacerRow.append($('<td>', { 'colspan': '2', }).append('&nbsp;'));
};

