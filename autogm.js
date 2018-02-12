// AutoGM
//
// auto sets controlledby and inplayerjournals for new characters
// if charactername matches 'text::playername'
// where playername is the displayname
//
// Github:      https://github.com/nesges/roll20-char-export
// by:          Thomas Nesges <thomas@nesges.eu>
// Version:     0.4

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
                // if player found
                if(typeof players == 'undefined' || players.length!=1) {
                    // playername is not legit or displayname has been changed: ignore
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
                    logChat(' - <b>' + charName + '</b> has no token');
                }
            }
        });
    }
    
    function logChat(message) {
        log(message.replace(/<.*?>/g, ''));
        sendChat('AutoGM', message);
    }
});
