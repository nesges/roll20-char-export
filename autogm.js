// AutoGM
//
// autosets controlledby and inplayerjournals for new characters
// if charactername matches 'text::playername'
// where playername is the displayname
//
// Github:      https://github.com/nesges/roll20-char-export
// by:          Thomas Nesges <thomas@nesges.eu>
// Version:     0.6

on('ready',function() {
    'use strict';
    
    log('.oO( autogm v0.6 )');
    
    // run setControlledBy() on startup
    setControlledBy();
    
    on("chat:message", function(msg) {
        if (msg.type == "api" && msg.content.indexOf("!autogm") === 0) {
            setControlledBy();
            logChat('autogm done.');
        }
    });
    
    function setControlledBy() {
        // list of all characters
        var characters = findObjs({
            _type: "character",
            archived: false
        });
        
        characters.forEach(function(char, index) {
            var charName = char.get("name");
            var playerName;
            var player;
            var m;
            
            if(getAttrByName(char.id, 'npc')==1) {
                // is an npc: ignore
                return;
            }
            
            // if charname ist assembled of text1::text2
            if(m = charName.match(/(.+)\s*::\s*(.+)/)) {
                playerName = m[2].trim();
            } else if(m = charName.match(/(.+)\s*[(]\s*(.+)[)]/)) {
                playerName = m[2].trim();
            }
            if(typeof playerName != 'undefined') {
                // search for a player named text2
                // displayname may have been changed
                var players = findObjs({
                        _type: "player",
                        _displayname: playerName
                    });

                if(typeof players == 'undefined' || players.length==0) {
                    // no player found, try a fuzzy search
                    var found=0;
                    var players2 = findObjs({
                        _type: "player",
                    });
                    players2.forEach(function(player2, index) {
                        if(player2.get('_displayname').match(new RegExp(playerName, 'i'))) {
                            //log(playerName + ' ~ ' + player2.get('_displayname'));
                            player = player2;
                            found++;
                            if(found >1) {
                                // more than one player found
                                log('player name ' +playerName+ ' is not unique, can\'t autogm character ' + charName);
                                return;
                            }
                        }
                    });
                } else if(players.length>1) {
                    // more than one player found
                    log('player name ' +playerName+ ' is not unique, can\'t autogm character ' + charName);
                    return;
                } else {
                    // 1 player found
                    player = players[0];
                }
            }
            
            //log(charName + ' c:' + char.get('controlledby') + ' j:' + char.get('inplayerjournals') + ' p:' + player.get('_displayname'));
            
            // if player found and
            // if controlledby is not set or to an other user
            if(typeof player != 'undefined' && (typeof char.get('controlledby') == 'undefined' || char.get('controlledby')=='' || char.get('controlledby')!=player.id)) {
                // set controlledby and inplayerjournals to that player
                char.set('controlledby', player.id);
                char.set('inplayerjournals', player.id);
                logChat('<b>' + charName + '</b> controlled by <b>' + playerName + '</b> now');

                // does the character have a token?
                //var tokens = findObjs({
                //    _type: "graphic",
                //    represents: char.id
                //});
                //
                //if(tokens.length < 1) {
                //    logChat(' - <b>' + charName + '</b> has no token');
                //}
            }
        });
    }
    
    function logChat(message) {
        log(message.replace(/<.*?>/g, ''));
        sendChat('AutoGM', message);
    }
});
