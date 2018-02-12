// AutoGM
//
// auto sets controlledby and inplayerjournals for new characters
// if charactername matches 'text::playername'
//
// Github:      https://github.com/nesges/roll20-char-export
// by:          Thomas Nesges <thomas@nesges.eu>
// Version:     0.2

on('ready',function() {
    'use strict';
    
    log('-=> autogm v0.2 <=-');
    
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
            
            // if controlledby and inplayerjournals are not set
            if(char.get('controlledby')=='' && char.get('inplayerjournals')=='') {
                var m;
                var playerName;
                // if charname ist assembled of text1::text2
                if(m = charName.match(/(.+)\s*::\s*(.+)\s*/)) {
                    // search for a player named text2
                    playerName = m[2].trim();
                // if charname ist assembled of text1 (text2)
                } else if(m = charName.match(/(.+)\s*[(]\s*(.+)\s*[)]/)) {
                    playerName = m[2].trim();
                }
                
                if(typeof playerName != 'undefined') {
                    var players = findObjs({
                        _type: "player",
                        _displayname: playerName
                    });
                    // if player found
                    if(typeof players != 'undefined' && players.length==1) {
                        // set controlledby and inplayerjournals to that player
                        char.set('controlledby', players[0].id);
                        char.set('inplayerjournals', players[0].id);
                        logChat('<b>' + charName + '</b> controlled by <b>' + playerName + '</b> now');
                    } else {
                        // warn that there is no player named text2
                        logChat('<b>' + charName + '</b>: player <b>' + playerName + '</b> not found');
                    }

                    // does the character have a token?
                    var tokens = findObjs({
                        _type: "graphic",
                        represents: char.id
                    });
                    
                    if(tokens.length < 1) {
                        logChat('WARNING: <b>' + charName + '</b> has no token');
                    }
                }
            }           
        });
    }
    
    function logChat(message) {
        log(message.replace(/<.*?>/g, ''));
        sendChat('AutoGM', message);
    }
});