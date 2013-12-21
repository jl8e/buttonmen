// namespace for this "module"
var Overview = {};

// We only need one game state for this module, so just reproduce the
// setting here rather than importing Game.js
Overview.GAME_STATE_END_GAME = 60;

////////////////////////////////////////////////////////////////////////
// Action flow through this page:
// * Overview.showOverviewPage() is the landing function.  Always call
//   this first
// * Overview.getOverview() asks the API for information about the
//   player's overview status (currently, the list of active games).
//   It clobbers Overview.api.  If successful, it calls
// * Overview.showPage() assembles the page contents as a variable
// * Overview.layoutPage() sets the contents of <div id="overview_page">
//   on the live page
//
// N.B. There is no form submission on this page, it's just a landing
// page with links to other pages, so it's logically somewhat simpler
// than e.g. Game.js.
////////////////////////////////////////////////////////////////////////

Overview.showOverviewPage = function() {

  // Setup necessary elements for displaying status messages
  $.getScript('js/Env.js');
  Env.setupEnvStub();

  // Make sure the div element that we will need exists in the page body
  if ($('#overview_page').length == 0) {
    $('body').append($('<div>', {'id': 'overview_page' }));
  }

  // Find the current game, and invoke that with the "parse game state"
  // callback
  Overview.getOverview(Overview.showPage);
}

Overview.getOverview = function(callbackfunc) {
  Overview.api = {
    'load_status': 'failed'
  }

  if (Login.player == null) {
    Env.message = {
      'type': 'none',
      'text': 'Please login to start beating people up'
    };
    return callbackfunc();
  }
    
  $.post(Env.api_location,
         { type: 'loadActiveGames', },
         function(rs) {
           if (rs.status == 'ok') {
             if (Overview.parseActiveGames(rs.data)) {
               Overview.api.load_status = 'ok';
             } else if (Overview.api.load_status == 'nogames') {
               Env.message = {
                 'type': 'none',
                 'text': 'You have no active games'
               };
             } else {
               Env.message = {
                 'type': 'error',
                 'text':
                   'Active game list received from server could not be parsed!'
               };
             }
           } else {
             Env.message = {
               'type': 'error',
               'text': rs.message
             };
           }
           return callbackfunc();
         }
  ).fail(function() {
    Env.message = {
      'type': 'error',
      'text': 'Internal error when calling loadActiveGames'
    };
    return callbackfunc();
  });
}

Overview.parseActiveGames = function(data) {
  if (data.gameIdArray.length == 0) {
    Overview.api.load_status = 'nogames';
    return false;
  }

  Overview.api.games = {
    'awaitingPlayer': [],
    'awaitingOpponent': [],
    'finished': []
  };
  Overview.api.nGames = data.gameIdArray.length;
  i = 0;
  while (i < Overview.api.nGames) {
    var gameInfo = {
      'gameId': data.gameIdArray[i],
      'opponentId': data.opponentIdArray[i],
      'opponentName': data.opponentNameArray[i],
      'playerButtonName': data.myButtonNameArray[i],
      'opponentButtonName': data.opponentButtonNameArray[i],
      'gameScoreDict': {
        'W': data.nWinsArray[i],
        'L': data.nLossesArray[i],
        'D': data.nDrawsArray[i]
      },
      'isAwaitingAction': data.isAwaitingActionArray[i],
      'maxWins': data.nTargetWinsArray[i],
      'gameState': data.gameStateArray[i],
      'status': data.statusArray[i]
    };
    if (gameInfo.isAwaitingAction == "1") {
      Overview.api.games['awaitingPlayer'].push(gameInfo);
    } else {
      if (gameInfo.gameState == Overview.GAME_STATE_END_GAME) {
        Overview.api.games['finished'].push(gameInfo);
      } else {
        Overview.api.games['awaitingOpponent'].push(gameInfo);
      }
    }
    i += 1;
  }
  return true;
}

Overview.showPage = function() {

  // If there is a message from a current or previous invocation of this
  // page, display it now
  Env.showStatusMessage();

  Overview.page = $('<div>');

  if (Login.logged_in == true) {
    Overview.pageAddNewgameLink();

    if (Overview.api.load_status == 'ok') {
      Overview.pageAddGameTables();
    }
  }

  // Actually layout the page
  Overview.layoutPage();
}

Overview.layoutPage = function() {
  $('#overview_page').empty();
  $('#overview_page').append(Overview.page);
}

////////////////////////////////////////////////////////////////////////
// Helper routines to add HTML entities to existing pages

// Add tables for types of existing games
Overview.pageAddGameTables = function() {
  Overview.pageAddGameTable('awaitingPlayer', 'Games waiting for you');
  Overview.pageAddGameTable('awaitingOpponent', 'Games waiting for your opponent');
  Overview.pageAddGameTable('finished', 'Completed games');
}

Overview.pageAddNewgameLink = function() {
  var newgameDiv = $('<div>');
  var newgamePar = $('<p>');
  newgamePar.append($('<a>', {
    'href': 'create_game.html',
    'text': 'Create a new game'
  }));
  newgameDiv.append(newgamePar);
  Overview.page.append(newgameDiv);
}

Overview.pageAddGameTable = function(gameType, sectionHeader) {
  if (Overview.api.games[gameType].length == 0) {
     return;
  }
  var tableDiv = $('<div>');
  tableDiv.append($('<h2>', {'text': sectionHeader }));
  var table = $('<table>');
  headerRow = $('<tr>');
  headerRow.append($('<th>', {'text': 'Game #' }));
  headerRow.append($('<th>', {'text': 'Opponent' }));
  headerRow.append($('<th>', {'text': 'Your Button' }));
  headerRow.append($('<th>', {'text': "Opponent's Button" }));
  headerRow.append($('<th>', {'text': 'Score (W/L/T (Max))' }));
  table.append(headerRow);
  var i = 0;
  while (i < Overview.api.games[gameType].length) {
    var gameInfo = Overview.api.games[gameType][i];
    gameRow = $('<tr>');
    var gameLinkTd = $('<td>');
    gameLinkTd.append($('<a>', {'href': 'game.html?game=' + gameInfo.gameId,
                                'text': gameInfo.gameId}));
    gameRow.append(gameLinkTd);
    gameRow.append($('<td>', {'text': gameInfo.opponentName }));
    gameRow.append($('<td>', {'text': gameInfo.playerButtonName }));
    gameRow.append($('<td>', {'text': gameInfo.opponentButtonName }));
    gameRow.append($('<td>', {'text': gameInfo.gameScoreDict['W'] + '/' +
                                      gameInfo.gameScoreDict['L'] + '/' +
                                      gameInfo.gameScoreDict['D'] +
                                      ' (' + gameInfo.maxWins + ')' }));
    i += 1;
    table.append(gameRow);
  }

  tableDiv.append(table);
  tableDiv.append($('<hr>'));
  Overview.page.append(tableDiv);
}
