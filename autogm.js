// AutoGM
//
// auto sets controlledby and inplayerjournals for new characters
// if charactername matches 'text::playername'
//
// Github:      https://github.com/nesges/roll20-char-export
// by:          Thomas Nesges <thomas@nesges.eu>
// Version:     0.3

on('ready',function() {
    'use strict';
    
    log('-=> autogm v0.3 <=-');
    
    // run setControlledBy() on startup
    setControlledBy();
    
    on("chat:message", function(msg) {
        if (msg.type == "api" && msg.content.indexOf("!autogm") === 0) {
            setControlledBy();
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
            // if charname ist assembled of text1::text2
            if(m = charName.match(/(.+)\s*::\s*(.+)/)) {
                // search for a player named text2
                playerName = m[2].trim();
            }
            if(typeof playerName != 'undefined') {
                var players = findObjs({
                        _type: "player",
                        _displayname: playerName
                    });
                // if player found
                if(typeof players == 'undefined' || players.length!=1) {
                    // playername is not legit
                    logChat('<b>' + charName + '</b>: player <b>' + playerName + '</b> not found');
                    return;
                }
                player = players[0];
            }
            
            //log(charName + ' c:' + char.get('controlledby') + ' j:' + char.get('inplayerjournals'))
            
            // if player found and
            // if controlledby is not set or to an other user
            if(typeof player != 'undefined' && (char.get('controlledby')=='' || char.get('controlledby')!=player.id)) {
                // set controlledby and inplayerjournals to that player
                char.set('controlledby', player.id);
                char.set('inplayerjournals', player.id);
                logChat('<b>' + charName + '</b> controlled by <b>' + playerName + '</b> now');

                // does the character have a token?
                var tokens = findObjs({
                    _type: "graphic",
                    represents: char.id
                });
                
                if(tokens.length < 1) {
                    logChat('WARNING: <b>' + charName + '</b> has no token');
                }
            }
        });
    }
    
    function logChat(message) {
        log(message.replace(/<.*?>/g, ''));
        sendChat('AutoGM', message);
    }
});
