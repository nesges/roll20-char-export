// NPC Import
//
// lorem ipsum dolor sit amet
//
// Github:      https://github.com/nesges/roll20-char-export/npcimport.js
// by:          Thomas Nesges <thomas@nesges.eu>
// Version:     0.1

on('ready',function() {
    'use strict';
    
    log('.oO( npcengineer_import v0.0 )');
    
    
    on("chat:message", function(msg) {
        if (msg.type == "api" && msg.content.indexOf("!n") === 0) {
            var param = msg.content.split(" ");
            var name = param[1];
            param.splice(0,1);
            
            // JSON format: extracts of masqs 1d6adventurers compendium (http://www.masq.net/search/label/1d6A%20Compendium) converted to json using http://www.utilities-online.info/xmltojson
            var doc = JSON.parse(param.join(''));

            for(var key in doc) {
                var npc = doc[key];
                name = v(npc, 'name/#text');

                // create character
                var character = createObj('character', {
                    avatar: '',
                    name: name,
                    bio: '',    
                    gmnotes: '',    
                    archived: false,    
                    inplayerjournals: 'all',
                    controlledby: 'all',
                });
                attr(character.id, 'npc', 1);
                attr(character.id, 'npc_name', name);
                
                var attrvalues = {
                    npc_type:           v(npc,'size/#text') + ' ' + v(npc,'type/#text') + (typeof v(npc,'alignment/#text') != 'undefined' ? ', '+v(npc,'alignment/#text') : ''),
                    npc_ac:             v(npc,'ac/#text'),
                    npc_actype:         v(npc,'actext/#text'),
                    hp:                 [ v(npc,'hp/#text'), v(npc,'hp/#text') ],
                    npc_hpformula:      v(npc,'hd/#text'),
                    npc_speed:          v(npc,'speed/#text'),
                    strength_base:      v(npc,'abilities/strength/score/#text'),
                    dexterity_base:     v(npc,'abilities/dexterity/score/#text'),
                    constitution_base:  v(npc,'abilities/constitution/score/#text'),
                    intelligence_base:  v(npc,'abilities/intelligence/score/#text'),
                    wisdom_base:        v(npc,'abilities/wisdom/score/#text'),
                    charisma_base:      v(npc,'abilities/charisma/score/#text'),
                };
                
                for(var attrname in attrvalues) {
                    if(Array.isArray(attrvalues[attrname])) {
                        if(attrvalues[attrname].length==1) {
                            attr(character.id, attrname, attrvalues[attrname][0]);
                        } else if(attrvalues[attrname].length==2) {
                            attr(character.id, attrname, attrvalues[attrname][0], attrvalues[attrname][1]);
                        } else {
                            logChat("ERROR: array "+attrname+" too large");
                        }
                    } else {
                        attr(character.id, attrname, attrvalues[attrname]);
                    }
                }
            }
            
            logChat('done');
        }
    });

    function attr(characterid, name, current, max) {
        if(typeof current != 'undefined' && typeof max != 'undefined') {
            createObj('attribute', {
                _characterid: characterid,
                name: name,
                current: current,
                max: max
            });
        } else if(typeof max != 'undefined') {
            createObj('attribute', {
                _characterid: characterid,
                name: name,
                max: max
            });
        } else if(typeof current != 'undefined') {
            createObj('attribute', {
                _characterid: characterid,
                name: name,
                current: current
            });
        }
    }
    
    // v implements a simple path description for json structures
    function v(npc, pathString) {
        var path = pathString.split('/');
        var o = npc;
        for(var i=0; i<path.length; i++) {
            o = o[path[i]];
        }
        return o;
    }
    
    function logChat(message) {
        log(message.replace(/<.*?>/g, ''));
        sendChat('NPC Import', message);
    }

});
