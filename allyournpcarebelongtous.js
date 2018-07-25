// All your NPC are belong to us
//
// autosets controlledby and inplayerjournals for all npcs
// to All Players
//
// Github:      https://github.com/nesges/roll20-char-export
// by:          Thomas Nesges <thomas@nesges.eu>
// Version:     0.1

on('ready',function() {
    'use strict';
    
    log('.oO( allyournpcarebelongtous v0.1 )');
    
    
    on("chat:message", function(msg) {
        if (msg.type == "api" && msg.content.indexOf("!aynabtu") === 0) {
            setControlledBy();
            logChat('aynabtu done.');
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
            
            if(getAttrByName(char.id, 'npc')!=1) {
                // is no npc: ignore
                return;
            }
            
            char.set('controlledby', 'all');
            char.set('inplayerjournals', 'all');
            logChat('<b>' + charName + '</b> controlled by <b>All Players</b> now');
        });
    }
    
    function logChat(message) {
        log(message.replace(/<.*?>/g, ''));
        sendChat('Aynabtu', message);
    }
});
