// Handouts-Manager
//
// adds a handout to the journals of all players that are online
// usage:
//      !hom show Mysterious Note
//          adds handout "Mysterious Note" to journals
//      !hom showid -L1t-XnjlJv0Q7IZwECX
//          adds handout with id "-L1t-XnjlJv0Q7IZwECX" to journals
//      !hom id Mysterious Note
//          prints the id of "Mysterious Node"
//
// doesn't work and handouts with non unique names
//
// Github:      https://github.com/nesges/roll20-char-export
// by:          Thomas Nesges <thomas@nesges.eu>
// Version:     0.2

on('ready',function() {
    'use strict';
    
    log('.oO( handoutsmanager v0.2 )');
    
    on("chat:message", function(msg) {
        if (msg.type == "api") {
            var m;
            if(m=msg.content.match(/^!hom id (.*)/)) {
                var handoutid = hom_handoutid(m[1]);
                sendChat('HoM', '/w gm handout "'+m[1]+'" has id "'+handoutid+'"');
            } else if(m=msg.content.match(/^!hom showid (.*)/)) {
                hom_showToOnlinePlayers(m[1]);
            } else if(m=msg.content.match(/^!hom show (.*)/)) {
                var handoutid = hom_handoutid(m[1]);
                if(typeof handoutid != 'undefined' && handoutid != '') {
                    hom_showToOnlinePlayers(handoutid);
                }
            }
        }
    });
    
    function hom_showToOnlinePlayers(handoutid) {
        // find all players that are online
        var players = findObjs({
            _type: "player",
            _online: true
        });
        
        var handout = getObj('handout', handoutid);
        if(typeof handout != 'undefined') {
            var handoutName = handout.get('name');
            
            if(typeof handout != 'undefined' && players.length>0) {
                var journals = new Array();
                var journalPlayernames = new Array();
                
                // is this handout in player journals=
                if(typeof handout.get("inplayerjournals") != 'undefined') {
                    journals = handout.get("inplayerjournals").split(',');
                }
                // display every player that has this handout in his journal
                journals.forEach(function(playerid, index){
                    if(playerid == 'all') {
                        sendChat('HoM', '/w gm WARNING: <b>'+handoutName+'</b> is visible to <b>ALL PLAYERS</b>');
                    } else {
                        var player = getObj('player', playerid);
                        if(typeof player != 'undefined') {
                            journalPlayernames.push(player.get('_displayname'));
                        }
                    }
                })
                if(journalPlayernames.length>0)  {
                    sendChat('HoM', '/w gm <b>'+handoutName+'</b> is in journals of: '+journalPlayernames.join(', '));
                } else {
                    sendChat('HoM', '/w gm <b>'+handoutName+'</b> is in no journal');
                }
                
                // add handout to all player journals that don't already have it
                players.forEach(function(player, index){
                    if(journals.indexOf(player.id)<0) {
                        journals.push(player.id);
                        sendChat('HoM', '/w gm added player <b>'+player.get('_displayname')+'</b>')
                    }
                })
                handout.set("inplayerjournals", journals.join(','));
            }
        } else {
            sendChat('HoM', '/w gm handout id <b>'+handoutid+'</b> not found');
        }
    }
    
    function hom_handoutid(handoutname) {
        var handouts = findObjs({
            _type: "handout",
            name: handoutname
        });
        
        if(handouts.length==1) {
            return handouts[0].id;
        } else if(handouts.length>1) {
            sendChat('HoM', '/w gm handout <b>'+handoutname+'</b> is not unique');
        } else {
            sendChat('HoM', '/w gm handout <b>'+handoutname+'</b> not found');
        }
        return;
    }
    
});