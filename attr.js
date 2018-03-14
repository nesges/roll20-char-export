// attr
//
// bulk attribute setter for npc charactersheets
//
// Github:      https://github.com/nesges/roll20-char-export
// by:          Thomas Nesges <thomas@nesges.eu>
// Version:     0.2
//
// Generic Usage:
//  attr <attribute> <value>
//
// Special Cases:
//  attr npc_name_flag show|hide
//  attr npc_name_in_rolls show|hide
//      alias for npc_name_flag


on('ready',function() {
    'use strict';
    
    log('.oO( attr v0.2 )');
    
    on("chat:message", function(msg) {
        if (msg.type == "api") {
            // split msg.content
            var param = msg.content.split(' ');
            var command = param.shift();
            var attribute = param.shift();
            var value = param.join(' ');
            
            if(command == '!attr') {
            
                // special cases
                if(attribute == 'npc_name_in_rolls') {
                    attribute = 'npc_name_flag';
                }
                if(attribute == 'npc_name_flag') {
                    // show = {{name=@{npc_name}}}
                    // hide = 0
                    if(value == 'show' || value == '{{name=@{npc_name}}}') {
                        value = '{{name=@{npc_name}}}';
                    } else if(value == 'hide' || value == '0') {
                        value = '0';
                    } else {
                        logChat('<b>ERROR: illegal value ' + value + ' for ' + attribute + '</b>');
                        return;
                    }
                }
            
                // all characters
                var characters = findObjs({
                    _type: "character",
                    archived: false
                });

                characters.forEach(function(character, index) {
                    // discard player characters
                    if(getAttrByName(character.id, 'npc')!=1) {
                        // is no npc: ignore
                        return;
                    }
                                    
                    var attrs = findObjs({                              
                        _characterid: character.id,
                        _type: "attribute",                          
                        name: attribute
                    });
                    if(attrs.length < 1) {
		                createObj("attribute", {
                            name: attribute,
                            current: value,
                            characterid: character.id
                        });
                        logChat('<i>created ' + character.get("name") + '.' + attribute + ' = ' + value + '</i>');
    		        } else {
                        attrs.forEach(function(attr) {
		                    attr.set("current", value);
		                    logChat('set ' + character.get("name") + '.' + attribute + ' = ' + value);
                        });
    		        }
                });
            }
        }
    });
    
    function logChat(message) {
        log('attr: ' + message.replace(/<.*?>/g, ''));
        sendChat('attr', '/w gm ' + message);
    }
});