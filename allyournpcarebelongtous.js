// All your NPC are belong to us
//
// autosets controlledby and inplayerjournals for all npcs
// to All Players
//
// Github:      https://github.com/nesges/roll20-char-export
// by:          Thomas Nesges <thomas@nesges.eu>
// Version:     0.2

on('ready',function() {
    'use strict';
    
    log('.oO( allyournpcarebelongtous v0.2 )');
    
    
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
