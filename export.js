// Roll20 Character Export
//
// exports a Roll20 Character to CoreRPG XML v3.3
// to import in Fantasy Grounds (https://www.fantasygrounds.com/) and 
// Fantasy Grounds Character Sheet Creator (https://www.alonlinetools.net/FGCharacterSheet.aspx)
//
// Github:      https://github.com/nesges/roll20-char-export
// by:          Thomas Nesges <thomas@nesges.eu>
// Version:     0.8
//
// Usage:
//  1.) select token of a character in Roll20
//  2.) chat command "!export"
//  3.) copy whole output and save to .xml-file
//  4.) import file in FantasyGrounds or
//      import file in https://www.alonlinetools.net/FGCharacterSheet.aspx

on('ready',function(){

log('.oO( export v0.8 )');

on("chat:message", function(msg) {
    if (msg.type == "api" && msg.content.indexOf("!export") === 0) {
        var character;
        
        //search by selected token
        if(typeof msg.selected != 'undefined' && typeof msg.selected[0] != 'undefined') {
            var token = getObj('graphic', msg.selected[0]._id);
            character = getObj('character', token.get('represents'));
        } else {
            //search by name
            var inputName = _.rest(msg.content.split(" ")).join(" ");
            var list = findObjs({
                _type: "character",
                name: inputName
            });
            if(list.length == 1) {
                character = getObj("character", list[0].id);
            }
        }
        
        if(typeof character == 'undefined') {
            sendChat('CoreRPG-XML-Export', 'Character not found');
        }
        
        // !exportdebug
        if(msg.content.indexOf("!exportdebug") === 0) {
            var lines = filterObjs(function(obj){
                if(obj.get('type') === 'attribute'
                    && obj.get('characterid') === character.id
                ) {
                    log(obj);
                }
                return false;
            });
            return;
        }

        // !export
        var tagid=0;
        var notes = '';
        
        var abilityMod = {};

        var xml = '<?xml version="1.0" encoding="iso-8859-1"?>'
            + '<!-- generator: https://github.com/nesges/roll20-char-export -->'
            + '<root version="3.3" release="8|CoreRPG:3">'
            + '<character>'
            +   '<name type="string">' +character.get('name')+ '</name>'
            +   '<level type="number">' +getAttribute(character.id, "level")+ '</level>'
            +   '<race type="string">' +getAttribute(character.id, "race")+ '</race>'
            +   '<speed><base type="number">' +getAttribute(character.id, "speed")+ '</base><total type="number">' +getAttribute(character.id, "speed")+ '</total></speed>';
            
            // Armor Class
            xml +='<defenses><ac><total type="number">' +getAttribute(character.id, "ac")+ '</total></ac></defenses>';
            
            // Appearance, Bio etc.
            xml += '<age type="string">' +getAttribute(character.id, "age")+ '</age>'
                + '<alignment type="string">' +getAttribute(character.id, "alignment")+ '</alignment>'
                + '<appearance type="string">' +getAttribute(character.id, "character_appearance")+ '</appearance>'
                + '<background type="string">' +getAttribute(character.id, "background")+ '</background>'
                
                + '<bonds type="string">' +getAttribute(character.id, "bonds")+ '</bonds>'
                + '<exp type="number">' +getAttribute(character.id, "experience")+ '</exp>'
                + '<flaws type="string">' +getAttribute(character.id, "flaws")+ '</flaws>'
                + '<height type="string">' +getAttribute(character.id, "height")+ '</height>'
                + '<ideals type="string">' +getAttribute(character.id, "ideals")+ '</ideals>'
                + '<initiative>'
                +   '<misc type="number">0</misc>'
                +   '<temporary type="number">0</temporary>'
                +   '<total type="number">' +getAttribute(character.id, "initiative_bonus")+ '</total>'
                + '</initiative>'
                + '<inspiration type="number">' +(getAttribute(character.id, "inspiration")=='on'?'1':'0')+ '</inspiration>'
                + '<size type="string">' +getAttribute(character.id, "size")+ '</size>'
                + '<weight type="string">' +getAttribute(character.id, "weight")+ '</weight>'
                + '<encumbrance><load type="number">' +getAttribute(character.id, "weighttotal")+ '</load></encumbrance>'
                + '<personalitytraits type="string">' +getAttribute(character.id, "personality_traits")+ '</personalitytraits>';
            
            // Classes
            xml+='<classes>'
            +       '<id-00001>'
            +           '<casterlevelinvmult type="number">' +getAttribute(character.id, "caster_level")+ '</casterlevelinvmult>'
            +           '<casterpactmagic type="number"></casterpactmagic>' // seems irrelevant
            +           '<hddie type="dice">d' +getAttribute(character.id, "hitdietype")+ '</hddie>'
            //+           '<hdused type="number">' +(getAttribute(character.id, "hit_dice","max")-getAttribute(character.id, "hit_dice"))+ '</hdused>'
            +           '<level type="number">' +getAttribute(character.id, "base_level")+ '</level>'
            +           '<name type="string">' +ucfirst(getAttribute(character.id, "class"))+ '</name>'
            +       '</id-00001>';
            // Multiclass
            var allhitdice = getAttribute(character.id, 'hitdie_final').split('|'); // ?{Hit Die Class|Warlock,@{hitdietype}|Wizard,6}
            for(var mcf=1; mcf<=3; mcf++) {
                if(getAttribute(character.id, "multiclass"+mcf+"_flag") == 1) {
                    var mclass=getAttribute(character.id, "multiclass"+mcf);
                    
                    var dietype='d9001';
                    var classdice = allhitdice[mcf+1].split(',');
                    dietype = 'd'+classdice[1];
                    dietype = dietype.replace(/\}/, ''); // last class would have a curly bracket appended
                    
                    xml +='<id-0000'+(mcf+1)+'>'
                        +    '<casterlevelinvmult type="number"></casterlevelinvmult>'
                        +    '<casterpactmagic type="number"></casterpactmagic>'
                        +    '<hddie type="dice">'+dietype+'</hddie>'
                        //+    '<hdused type="number"></hdused>'
                        +    '<level type="number">' +getAttribute(character.id, "multiclass"+mcf+"_lvl")+ '</level>'
                        +    '<name type="string">' +ucfirst(mclass)+ '</name>'
                        +'</id-0000'+(mcf+1)+'>';
                }
            }
            xml+='</classes>';
            
            // Currency
            xml+='<coins>'
                +   '<slot1><amount type="number">' +getAttribute(character.id, 'pp')+ '</amount><name type="string">pp</name></slot1>'
                +   '<slot2><amount type="number">' +getAttribute(character.id, 'ep')+ '</amount><name type="string">ep</name></slot2>'
                +   '<slot3><amount type="number">' +getAttribute(character.id, 'gp')+ '</amount><name type="string">gp</name></slot3>'
                +   '<slot4><amount type="number">' +getAttribute(character.id, 'sp')+ '</amount><name type="string">sp</name></slot4>'
                +   '<slot5><amount type="number">' +getAttribute(character.id, 'cp')+ '</amount><name type="string">cp</name></slot5>'
                +'</coins>';

            // Deathsaves
            var deathsavefail = (getAttribute(character.id, 'deathsave_fail1')=='on'?1:0) + (getAttribute(character.id, 'deathsave_fail2')=='on'?1:0) + (getAttribute(character.id, 'deathsave_fail3')=='on'?1:0);
            var deathsavesuccess = (getAttribute(character.id, 'deathsave_succ1')=='on'?1:0) + (getAttribute(character.id, 'deathsave_succ2')=='on'?1:0) + (getAttribute(character.id, 'deathsave_succ3')=='on'?1:0);
            xml+='<hp>'
            +       '<deathsavefail type="number">' +deathsavefail+ '</deathsavefail>'
            +       '<deathsavesuccess type="number">' +deathsavesuccess+ '</deathsavesuccess>'
            +       '<temporary type="number">' +getAttribute(character.id, "hp_temp")+ '</temporary>'
            +       '<wounds type="number">' +getAttribute(character.id, "hp")+ '</wounds>'
            +       '<total type="number">' +getAttribute(character.id, "hp", "max")+ '</total>'
            +   '</hp>'
            ;
        
            xml+='<profbonus type="number">' +getAttribute(character.id, "pb")+ '</profbonus>';
            xml+='<perception type="number">' +getAttribute(character.id, "passive_wisdom")+ '</perception>';
            //xml+='<perceptionmodifier type="number">' +getAttribute(character.id, "perception_bonus")+ '</perceptionmodifier>';
        
        
            // Items
            var itemList = {};
            var items = filterObjs(function(obj){
                if(obj.get('type') === 'attribute'
                    && obj.get('characterid') === character.id
                    && obj.get('name').indexOf('repeating_inventory_') !== -1
                ) {
                    return true;
                }
                return false;
            });
            items.forEach(function(item, index) {
                if(typeof item.get('name') != 'undefined') {
                    var itemID = item.get('name').replace(/^repeating_inventory_(.*?)_.*$/, '$1').toLowerCase();
                    if(typeof itemList[itemID] != 'object') {
                        itemList[itemID] = {};
                    }
                    if(item.get('name').indexOf('_itemname')!==-1) {
                        itemList[itemID].name = stripTags(item.get('current'));
                    } else if(item.get('name').indexOf('_itemweight')!==-1) {
                        itemList[itemID].weight = stripTags(item.get('current'));
                    } else if(item.get('name').indexOf('_itemcount')!==-1) {
                        itemList[itemID].count = stripTags(item.get('current'));
                    } else if(item.get('name').indexOf('_equipped')!==-1) {
                        itemList[itemID].equipped = stripTags(item.get('current'));
                    } else if(item.get('name').indexOf('_itemproperties')!==-1) {
                        itemList[itemID].properties = stripTags(item.get('current'));
                    } else if(item.get('name').indexOf('_itemtype')!==-1) {
                        itemList[itemID].type = stripTags(item.get('current'));
                    } else if(item.get('name').indexOf('_itemdamage')!==-1) {
                        itemList[itemID].damage = stripTags(item.get('current'));
                    } else if(item.get('name').indexOf('_itemdamagetype')!==-1) {
                        itemList[itemID].damagetype = stripTags(item.get('current'));
                    } else if(item.get('name').indexOf('_itemrange')!==-1) {
                        itemList[itemID].range = stripTags(item.get('current'));
                    } else if(item.get('name').indexOf('_itemcontent')!==-1) {
                        itemList[itemID].description = stripTags(item.get('current'));
                    } else if(item.get('name').indexOf('_itemmodifiers')!==-1) {
                        itemList[itemID].modifiers = stripTags(item.get('current'));

                        var modifiers = itemList[itemID].modifiers;
                        var m;
                        if(m = modifiers.match(/AC:\s(\d+)/)) {
                            itemList[itemID].ac = m[1];
                        }
                        if(m = modifiers.match(/Item Type:\s(\d+)/)) {
                            itemList[itemID].type = m[1];
                        }
                        if(m = modifiers.match(/Secondary Damage:\s(\d+)/)) {
                            itemList[itemID].damage2 = m[1];
                        }
                        if(m = modifiers.match(/(strength|dexterity|constitution|intelligence|wisdom|charisma):\s(\d+)/i)) {
                            abilityMod[m[1].toLowerCase()] = m[2];
                        }
                    }
                }
            });

            xml += '<inventorylist>';
            for(var key in itemList) {
                if(typeof itemList[key].name != 'undefined') {
                    tagid++;
                    xml += '<id-'+tagid+'>';
                    xml += '<name type="string">'+itemList[key].name+'</name>';
                    xml += '<carried type="number">'+(itemList[key].equipped == '0' ? '1':'2')+'</carried>';
                    xml += '<count type="number">'+(typeof itemList[key].count != 'undefined' ? itemList[key].count : '1') +'</count>';
                    if(typeof itemList[key].weight != 'undefined') {
                        xml += '<weight type="number">'+itemList[key].weight+'</weight>';
                    }
                    if(typeof itemList[key].properties != 'undefined') {
                        xml += '<properties type="string">'+itemList[key].properties+'</properties>';
                    }
                    if(typeof itemList[key].type != 'undefined') {
                        xml += '<type type="string">'+itemList[key].type+'</type>';
                    }
                    if(typeof itemList[key].damage != 'undefined') {
                        xml += '<damage type="string">'+itemList[key].damage;
                        if(typeof itemList[key].damagetype != 'undefined') {
                            xml += ' '+itemList[key].damagetype;
                        }
                        xml += '</damage>';
                    }
                    if(typeof itemList[key].range != 'undefined') {
                        // xml += '<range type="string">'+itemList[key].range+'</range>';
                    }
                    if(typeof itemList[key].description != 'undefined') {
                        xml += '<description type="formattedtext"><p>'+itemList[key].description+'</p></description>';
                    }
                    if(typeof itemList[key].ac != 'undefined') {
                        xml += '<ac type="number">'+itemList[key].ac+'</ac>';
                    }
                    xml +='</id-'+tagid+'>';
                }
            };
            xml += '</inventorylist>';
            
            // Traits
            var traitList = {};
            var traits = filterObjs(function(obj){
                if(obj.get('type') === 'attribute'
                    && obj.get('characterid') === character.id
                    && obj.get('name').indexOf('repeating_traits_') !== -1
                ) {
                    return true;
                }
                return false;
            });
            
            traits.forEach(function(trait, index) {
                var traitID = trait.get('name').replace(/^repeating_traits_(.*)_.*$/, '$1').toLowerCase();
                if(typeof traitList[traitID] != 'object') {
                    traitList[traitID] = {};
                }
                if(trait.get('name').indexOf('_name')!==-1) {
                    traitList[traitID].name = stripTags(trait.get('current'));
                } else if(trait.get('name').indexOf('_source')!==-1) {
                    traitList[traitID].source = stripTags(trait.get('current'));
                } else if(trait.get('name').indexOf('_description')!==-1) {
                    traitList[traitID].description = stripTags(trait.get('current'));
                } else if(trait.get('name').indexOf('_source_type')!==-1) {
                    traitList[traitID].sourcetype = stripTags(trait.get('current'));
                }
            });

            var featList = {};
            var featureList = {};
            tagid=0;
            xml += '<traitlist>';
            for(var key in traitList) {
                if(typeof traitList[key].name != 'undefined') {
                    if(traitList[key].source == 'Class') {
                        featureList[key] = traitList[key];
                    } else if(traitList[key].source == 'Background') {
                        featureList[key] = traitList[key];
                    } else if(traitList[key].source == 'Other') {
                        featureList[key] = traitList[key];
                    } else if(traitList[key].source == 'Feat') {
                        featList[key] = traitList[key];
                    } else {
                        tagid++;
                        xml += '<id-'+tagid+'>';
                        xml +=  '<name type="string">'+traitList[key].name+'</name>';
                        xml += '<text type="formattedtext"><p>';
                        if(typeof traitList[key].description != 'undefined') {
                            xml += traitList[key].description;
                            if(typeof traitList[key].source != 'undefined') {
                                xml += ' ('+traitList[key].source;
                                if(typeof traitList[key].sourcetype != 'undefined') {
                                    xml += ', ' + traitList[key].sourcetype;
                                }
                                xml += ')';
                            }
                        }
                        xml += '</p></text>';
                        xml +='</id-'+tagid+'>';
                    }
                }
            };
            xml += '</traitlist>';
            
            tagid=0;
            xml += '<featurelist>';
            for(var key in featureList) {
                tagid++;
                xml += '<id-'+tagid+'>';
                xml +=  '<name type="string">'+featureList[key].name+'</name>';
                xml += '<text type="formattedtext"><p>';
                if(typeof featureList[key].description != 'undefined') {
                    xml += featureList[key].description;
                    if(typeof featureList[key].source != 'undefined') {
                        xml += ' ('+featureList[key].source;
                        if(typeof featureList[key].sourcetype != 'undefined') {
                            xml += ', ' + featureList[key].sourcetype;
                        }
                        xml += ')';
                    }
                }
                xml += '</p></text>';
                xml +='</id-'+tagid+'>';
            };
            xml += '</featurelist>';
            
            tagid=0;
            xml += '<featlist>';
            for(var key in featList) {
                tagid++;
                xml += '<id-'+tagid+'>';
                xml +=  '<name type="string">'+featList[key].name+'</name>';
                xml += '<text type="formattedtext"><p>';
                if(typeof featList[key].description != 'undefined') {
                    xml += featList[key].description;
                    if(typeof featList[key].source != 'undefined') {
                        xml += ' ('+featList[key].source;
                        if(typeof featList[key].sourcetype != 'undefined') {
                            xml += ', ' + featList[key].sourcetype;
                        }
                        xml += ')';
                    }
                }
                xml += '</p></text>';
                xml +='</id-'+tagid+'>';
            };
            xml += '</featlist>';
            
            
            // Tools            
            var toolList = {};
            var tools = filterObjs(function(obj){
                if(obj.get('type') === 'attribute'
                    && obj.get('characterid') === character.id
                    && obj.get('name').indexOf('repeating_tool_') !== -1
                ) {
                    return true;
                }
                return false;
            });
            
            tools.forEach(function(tool, index) {
                var toolID = tool.get('name').replace(/^repeating_tool_(.*?)_.*$/, '$1').toLowerCase();
                if(typeof toolList[toolID] != 'object') {
                    toolList[toolID] = {};
                }
                if(tool.get('name').indexOf('_toolname')!==-1) {
                    toolList[toolID].name = stripTags(tool.get('current'));
                } else if(tool.get('name').indexOf('_toolbonus')!==-1 && tool.get('name').indexOf('_toolbonus_base')===-1) {
                    toolList[toolID].bonus = stripTags(tool.get('current'));
                } else if(tool.get('name').indexOf('_toolattr')!==-1) {
                    toolList[toolID].attr = stripTags(tool.get('current'));
                    toolList[toolID].attr = toolList[toolID].attr.replace(/@\{(.*?)_mod\}.*/, '$1').toLowerCase();
                }
            });
            // Tools go to Skills and Proficiencies
            
            // Proficiencies
            var profList = {};
            var profs = filterObjs(function(obj){
                if(obj.get('type') === 'attribute'
                    && obj.get('characterid') === character.id
                    && obj.get('name').indexOf('repeating_proficiencies_') !== -1
                ) {
                    return true;
                }
                return false;
            });
            
            profs.forEach(function(prof, index) {
                var profID = prof.get('name').replace(/^repeating_proficiencies_(.*?)_.*$/, '$1').toLowerCase();
                if(typeof profList[profID] != 'object') {
                    profList[profID] = {};
                }
                if(prof.get('name').indexOf('_name')!==-1) {
                    profList[profID].name = stripTags(prof.get('current'));
                } else if(prof.get('name').indexOf('_prof_type')!==-1) {
                    profList[profID].type = stripTags(prof.get('current'));
                }
            });
            

            var langList = new Array();
            var armorList = new Array();
            var weaponList = new Array();
            var otherList = new Array();
            for(var key in profList) {
                if(typeof profList[key].name != 'undefined') {
                    if(profList[key].type == 'ARMOR') {
                        armorList.push(profList[key].name);
                    } else if(profList[key].type == 'WEAPON') {
                        weaponList.push(profList[key].name);
                    } else if(profList[key].type == 'OTHER') {
                        otherList.push(profList[key].name);
                    } else {
                        langList.push(profList[key].name);
                    }    
                }
            };

            // languages
            tagid=0;
            xml += '<languagelist>';
            for(var k=0; k<langList.length; k++) {
                if(typeof langList[k] != 'undefined') {
                    tagid++;
                    xml += '<id-'+tagid+'><name type="string">Language: '+langList[k]+'</name></id-'+tagid+'>';
                }
            }
            xml += '</languagelist>';
            
            // weapon, armor, tools
            tagid=0;
            xml += '<proficiencylist>';
            for(var k=0; k<armorList.length; k++) {
                if(typeof armorList[k] != 'undefined') {
                    tagid++;
                    xml += '<id-'+tagid+'><name type="string">Armor: '+armorList[k]+'</name></id-'+tagid+'>';
                }
            }
            for(var k=0; k<weaponList.length; k++) {
                if(typeof weaponList[k] != 'undefined') {
                    tagid++;
                    xml += '<id-'+tagid+'><name type="string">Weapon: '+weaponList[k]+'</name></id-'+tagid+'>';
                }
            }
            for(var k=0; k<otherList.length; k++) {
                if(typeof otherList[k] != 'undefined') {
                    tagid++;
                    xml += '<id-'+tagid+'><name type="string">Other: '+otherList[k]+'</name></id-'+tagid+'>';
                }
            }
            var tool_xml='';
            var tool_xml_tagid=19;
            for(var key in toolList) {
                if(typeof toolList[key] != 'undefined') {
                    tagid++;
                    xml += '<id-'+tagid+'><name type="string">Tool: '+toolList[key].name+' ('+toolList[key].attr+', +'+toolList[key].bonus+')</name></id-'+tagid+'>';

                    // Thieves' Tools and Disguise Kit are special skills in the PDF
                    if(toolList[key].name.toLowerCase().match(/thieve.+tool|disguise.+kit/) && typeof toolList[key].attr != 'undefined' && typeof toolList[key].bonus != 'undefined') {
                        tool_xml += '<id-000'+tool_xml_tagid+'>';
                        tool_xml +=      '<misc type="number">0</misc>';
                        tool_xml +=      '<name type="string">'+toolList[key].name+'</name>';
                        tool_xml +=      '<prof type="number">2</prof>';
                        tool_xml +=      '<stat type="string">'+toolList[key].attr+'</stat>';
                        tool_xml +=      '<total type="number">'+toolList[key].bonus+'</total>';
                        tool_xml += '</id-000'+tool_xml_tagid+'>';
                        tool_xml_tagid++;
                    }
                }
            };
            xml += '</proficiencylist>';
            
            
            // Skills
            var skills = new Array('perception', 'arcana', 'persuasion', 'nature', 'medicine', 'survival', 
                'performance', 'acrobatics', 'religion', 'athletics', 'sleight_of_hand', 'insight', 
                'intimidation', 'deception', 'investigation', 'stealth', 'history', 'animal_handling');
            
            xml +='<skilllist>';
            tagid=0;
            for(var s=0; s<skills.length; s++) {
                var skill = skills[s];
                tagid++;
                xml += '<id-'+tagid+'>'
                    +     '<misc type="number">0</misc>'
                    +     '<name type="string">'+ucfirst(skill).replace(/_/g, ' ')+'</name>'
                    +     '<prof type="number">' +(getAttribute(character.id, skill+"_prof")!='0'?'1':'0')+ '</prof>'
                    +     '<stat type="string">'+skill+'</stat>'
                    +     '<total type="number">' +getAttribute(character.id, skill+"_bonus")+ '</total>'
                    +  '</id-'+tagid+'>'
            }
            xml += tool_xml
            xml += '</skilllist>';

            
            // Abilities
            var abilities = new Array('charisma', 'constitution', 'dexterity', 'intelligence', 'strength', 'wisdom');

            xml +='<abilities>';
            tagid=0;
            for(var a=0; a<abilities.length; a++) {
                var ability = abilities[a];
                tagid++;
                xml +=  '<'+ability+'>'
                    +       '<bonus type="number">' +getAttribute(character.id, ability+"_mod")+ '</bonus>'
                    +       '<save type="number">' +getAttribute(character.id, ability+"_save_bonus")+ '</save>'
                    +       '<savemodifier type="number"></savemodifier>'
                    +       '<saveprof type="number">' +(getAttribute(character.id, ability+"_save_prof")!='0'?'1':'0')+ '</saveprof>'
                    +       '<score type="number">' +getAttribute(character.id, ability+"_base")+ '</score>'
                    +   '</'+ability+'>';
            }
            xml += '</abilities>';



            // Spells
            var spellList = {};
            var spells = filterObjs(function(obj){
                if(obj.get('type') === 'attribute'
                    && obj.get('characterid') === character.id
                    && obj.get('name').indexOf('repeating_spell-') !== -1
                    && obj.get('name').indexOf('{{spelllevel=') === -1
                ) {
                    return true;
                }
                return false;
            });
            
            var prepared=0;
            spells.forEach(function(spell, index) {
                // entries with {{spellevel=*}} syntax seem to be deleted spells -> ignore
                //var spellID = spell.get('name').replace(/^repeating_spell-((cantrip|\d+|\{\{spelllevel=(cantrip|\d)\}\})_.*?)_.*$/, '$1').toLowerCase();
                var spellID = spell.get('name').replace(/^repeating_spell-(cantrip|\d+)_(.*?)_.*$/, '$2').toLowerCase();
                if(typeof spellList[spellID] != 'object') {
                    spellList[spellID] = {};
                }
                var name = spell.get('name');
                var current = stripTags(spell.get('current'));
                if(name.indexOf('_spellname')!==-1) {
                    spellList[spellID].name = current;
                    // entries with {{spellevel=*}} syntax seem to be deleted spells -> ignore
                    //var m = name.match(/^repeating_spell-(((cantrip|\d+)|\{\{spelllevel=(cantrip|\d)\}\})_.*?)_.*$/);
                    //spellList[spellID].level = typeof m[4] != 'undefined'?m[4]:m[3];
                    var m = name.match(/^repeating_spell-(((cantrip|\d+))_.*?)_.*$/);
                    if(m[3] == 'cantrip') {
                        spellList[spellID].level = '0';
                    } else {
                        spellList[spellID].level = m[3];
                    }
                } else if(name.indexOf('_spellschool')!==-1) {
                    spellList[spellID].school = current;
                } else if(name.indexOf('_spellcastingtime')!==-1) {
                    spellList[spellID].castingtime = current;
                } else if(name.indexOf('_spellrange')!==-1) {
                    spellList[spellID].range = current;
                } else if(name.indexOf('_spellcomp_s')!==-1) {
                    spellList[spellID].sensory = current;
                } else if(name.match(/_spellcomp_m$/)) {
                    spellList[spellID].material = current;
                } else if(name.indexOf('_spellcomp_materials')!==-1) {
                    spellList[spellID].material = 'on';
                    spellList[spellID].materials = current;
                } else if(name.indexOf('_spellcomp_v')!==-1) {
                    spellList[spellID].vocal = current;
                } else if(name.indexOf('_spellduration')!==-1) {
                    spellList[spellID].duration = current;
                } else if(name.indexOf('_spelldescription')!==-1) {
                    spellList[spellID].description = current;
                } else if(name.indexOf('_spellprepared')!==-1) {
                    spellList[spellID].prepared = current;
                } else if(name.indexOf('_spellritual')!==-1) {
                    spellList[spellID].ritual = current;
                } else if(name.indexOf('_spellathigherlevels')!==-1) {
                    spellList[spellID].higherlevels = current;
                } else if(name.indexOf('_spelltarget')!==-1) {
                    spellList[spellID].target = current;
                } else if(name.match(/_spellattack$/)) {
                    spellList[spellID].attack = current;
                } else if(name.match(/_spellconcentration$/)) {
                    spellList[spellID].concentration = (current!='0'?1:0);
               } else if(name.match(/_spellconcentrationflag$/)) {
                    spellList[spellID].concentration = (current=='Yes'?1:0);
                }
            });


            // Attacks
            var attackList = {};
            var spellattackXML = {};
            var attacks = filterObjs(function(obj){
                if(obj.get('type') === 'attribute'
                    && obj.get('characterid') === character.id
                    && obj.get('name').indexOf('repeating_attack_') !== -1
                    && obj.get('name').indexOf('_hidden_') === -1
                ) {
                    return true;
                }
                return false;
            });
            
            attacks.forEach(function(attack, index) {
                var attackID = attack.get('name').replace(/^repeating_attack_(.*?)_.*$/, '$1').toLowerCase();
                if(typeof attackList[attackID] != 'object') {
                    attackList[attackID] = {};
                }
                
                var name = attack.get('name');
                var current = stripTags(attack.get('current'));
                
                if(name.indexOf('_atkname')!==-1) {
                    attackList[attackID].name = current;
                } else if(name.indexOf('_itemid')!==-1) {
                    attackList[attackID].itemid = current.toLowerCase();
                } else if(name.indexOf('_atk_desc')!==-1) {
                    attackList[attackID].description = current;
                } else if(name.indexOf('_atkbonus')!==-1) {
                    attackList[attackID].hit = current;
                    attackList[attackID].hit = attackList[attackID].hit.replace(/\+/, '');
                } else if(name.indexOf('_dmgbase')!==-1) {
                    var dmg = current;
                    var m;
                    if(m=dmg.match(/^(\d*)(d\d+)\s*([-+]\s*\d+)?$/i)) {
                        attackList[attackID].damage = dmg;
                        if(typeof m[1] != 'undefined') {
                            attackList[attackID].damage_dicecount = m[1].replace(/\s/g, '');
                        } else {
                            attackList[attackID].damage_dicecount = 1;
                        }
                        if(typeof m[2] != 'undefined') {
                            attackList[attackID].damage_dicetype = m[2].replace(/\s/g, '');
                        }
                        // damage_bonus may already be set by _atkdmgtype. only overwrite if m[3] has an actual value
                        // maybee don't overwrite at all, if _atkdmgtype proves to be more accurate
                        if(typeof m[3] != 'undefined' && m[3] != '') {
                            attackList[attackID].damage_bonus = m[3].replace(/\s/g, '');
                        }
                    } else {
                        attackList[attackID].damage_complex = 1;
                    }
                    // try interpreting roll20 dmg formula and make it human readable
                    var formula = attack.get('current').replace(/\[\[(.*?)\]\]/g, '[$1]');
                    if(m=formula.match(/^(\d+d\d+([-+]\d+)?)(.*)$/i)) {
                        var dice_plus = m[1];
                        var formula_c = m[3];
                        if(typeof formula_c != 'undefined') {
                            var human;
                            var m2;
                            // reroll
                            if(m2 = formula_c.match(/^r<(\d+)$/)) {
                                human = dice_plus+' reroll lower than '+m2[1];
                            } else if(m2 = formula_c.match(/^r$/)) {
                                human = dice_plus+' reroll natural 1';
                            } else if(m2 = formula_c.match(/^ro<(\d+)$/)) {
                                human = dice_plus+' reroll lower than '+m2[1]+' once';
                            } else if(m2 = formula_c.match(/^(r\d+)+/)) {
                                var r = m2[1].split('r');
                                human = dice_plus+' reroll every natural ' + r.join(', ');
                            // drop
                                } else if(m2 = formula_c.match(/^d(\d+)/)) {
                                human = dice_plus+' drop lowest '+m2[1];
                            // critical success
                            } else if(m2 = formula_c.match(/^cs>(\d+)/)) {
                                human = dice_plus+' (crit with min '+m2[1]+')';
                            }
                            attackList[attackID].damage_formula_human = human;
                        }
                    }
                    attackList[attackID].damage_formula = formula.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // don't strip tags here
               } else if(name.indexOf('_atkdmgtype')!==-1) {
                    var dmg = current;
                    var m;
                    if(m=dmg.match(/^(\d+)(d\d+)([-+]\d+)?\s*(.*?)(\+|$)/i)) {
                        attackList[attackID].damage = dmg;
                        if(typeof m[1] != 'undefined') {
                            attackList[attackID].damage_dicecount = m[1].replace(/\s/g, '');
                        }
                        if(typeof m[2] != 'undefined') {
                            attackList[attackID].damage_dicetype = m[2].replace(/\s/g, '');
                        }
                        if(typeof m[3] != 'undefined') {
                            attackList[attackID].damage_bonus = m[3].replace(/\s/g, '');
                        }
                        if(typeof m[4] != 'undefined') {
                            attackList[attackID].dmgtype = m[4].replace(/\s/g, '');
                        }
                    }
                } else if(name.indexOf('_dmgtype')!==-1) {
                    attackList[attackID].dmgtype = current;
                } else if(name.indexOf('_dmg2flag')!==-1) {
                    attackList[attackID].dmgflag2 = current;
                } else if(name.indexOf('_dmg2base')!==-1) {
                    var dmg = current;
                    if(m=dmg.match(/^(\d+)(d\d+)([-+]\d+)?$/i)) {
                        attackList[attackID].damage2 = dmg;
                        if(typeof m[1] != 'undefined') {
                            attackList[attackID].damage2_dicecount = m[1];
                        }
                        if(typeof m[2] != 'undefined') {
                            attackList[attackID].damage2_dicetype = m[2];
                        }
                        if(typeof m[3] != 'undefined') {
                            attackList[attackID].damage2_bonus = m[3];
                        }
                    }
                } else if(name.indexOf('_dmg2type')!==-1) {
                    attackList[attackID].dmgtype2 = current;
                } else if(name.indexOf('_atkrange')!==-1) {
                    attackList[attackID].range = current;
                } else if(name.indexOf('_dmgattr')!==-1) {
                    var dmgattr = current;
                    var m;
                    if(m=dmgattr.match(/^@\{(.*?)_mod\}$/)) {
                        attackList[attackID].damagestat = m[1];
                    } else if(m=dmgattr.match(/^@\{(.*?)\}$/)) {
                        attackList[attackID].damage_bonus = getAttribute(character.id, m[1]);
                    }
                } else if(name.indexOf('_atkprofflag')!==-1) {
                    attackList[attackID].proficiency = attack.get('current');
                } else if(name.indexOf('_atkflag')!==-1) {
                    attackList[attackID].isattack = attack.get('current');
                } else if(name.indexOf('_atkattr_base')!==-1) {
                    var atkattr = current;
                    var m;
                    if(m=atkattr.match(/^@\{(.*?)_mod\}$/)) {
                        attackList[attackID].attackstat = m[1];
                    }
                } else if(name.indexOf('_atkmod')!==-1) {
                    attackList[attackID].attackmod = current;
                } else if(name.indexOf('_atkmagic')!==-1) {
                    attackList[attackID].attackmagic = current;
                } else if(name.indexOf('_spellid')!==-1) {
                    attackList[attackID].spellid = current.toLowerCase();
                    attackList[attackID].spellid = attackList[attackID].spellid.replace(/^-(cantrip|\d+)_/, '');
                } else if(name.indexOf('_saveflag')!==-1) {
                    var saveflag = current
                    if(saveflag.match(/strength|dexterity|constitution|intelligence|wisdom|charisma/i)) {
                        attackList[attackID].saveflag = saveflag;
                    } else {
                        attackList[attackID].saveflag = '1';
                    }
                } else if(name.indexOf('_saveattr')!==-1) {
                    var saveattr = current;
                    if(saveattr.match(/strength|dexterity|constitution|intelligence|wisdom|charisma/i)) {
                        attackList[attackID].saveattr = saveattr;
                    } else {
                        attackList[attackID].saveattr = '1';
                    }
                } else if(name.indexOf('_saveflat')!==-1) {
                    attackList[attackID].saveflat = current;
                } else if(name.indexOf('_saveeffect')!==-1) {
                    attackList[attackID].saveeffect = current;
                } else if(name.indexOf('_savedc')!==-1) {
                    var m;
                    attackList[attackID].savedcattr = current;
                    if(m = attackList[attackID].savedcattr.match(/(strength|dexterity|constitution|intelligence|wisdom|charisma)/i)) {
                        attackList[attackID].savedcattr = m[1].toLowerCase();
                    }
                }
            });
            
            tagid=0;
            xml += '<weaponlist>';
            for(var key in attackList) {
                if(typeof attackList[key] != 'undefined') {
                    var attack = attackList[key];
                    
                    tagid++;
                    xml +=  '<id-'+tagid+'>';
                    xml +=      '<name type="string">'+attack.name;
                    // CoreRPG has no element for the attack description
                    if(typeof attack.description != 'undefined' && attack.description != '') {
                        xml +=      ' ['+attack.description+']';
                    }
                    xml +=      '</name>';
                    xml +=      '<maxammo type="number">0</maxammo>';
                    
                    
                    // normal Attacks
                    if(typeof attack.isattack == 'undefined' || attack.isattack != '0') {
                        // properties of a linked item
                        if(typeof attack.itemid != 'undefined' && typeof itemList[attack.itemid] != 'undefined') {
                            xml +=  '<properties type="string">' +itemList[attack.itemid].properties+ '</properties>'; // ?
                            xml +=  '<carried type="number">'+(itemList[attack.itemid].equipped == '0' ? '1':'2')+'</carried>';
                            xml +=  '<type type="number">' +itemList[attack.itemid].type+ '</type>';
                        }

                        // attackbonus
                        if(typeof attack.attackmod != 'undefined' || typeof attack.attackmagic != 'undefined') {
                            var bonus = 0;
                            if(typeof attack.attackmod != 'undefined') {
                                bonus += attack.attackmod*1;
                            }
                            if(typeof attack.attackmagic != 'undefined') {
                                bonus += attack.attackmagic*1;
                            }
                            xml +=  '<attackbonus type="number">'+bonus+'</attackbonus>';
                        }
                        // proficiency
                        if(typeof attack.proficiency == 'undefined' || attack.proficiency != '0') {
                            xml +=  '<prof type="number">1</prof>';
                        } else {
                            xml +=  '<prof type="number">0</prof>';
                        }
                        // attackstat
                        if(typeof attack.attackstat != 'undefined') {
                            xml +=  '<attackstat type="string">'+attack.attackstat+'</attackstat>';
                        }
                    
                    
                    // Spells vs DC
                    } else {
                        if(typeof attack.saveeffect != 'undefined' && typeof attack.saveattr!= 'undefined') {
                            var dcattr;
                            var dc;
                            if(typeof attack.saveflat == 'undefined') {
                                if(typeof attack.savedcattr != 'undefined') {
                                    // spell has own dc attribute
                                    dcattr = attack.savedcattr;
                                } else {
                                    // use general dc attribute
                                    var spellcastability = getAttribute(character.id, 'spellcasting_ability');
                                    if(typeof spellcastability != 'undefined') {
                                        dcattr = spellcastability.replace(/@\{(.*?)_mod\}.*/, '$1');
                                    }
                                }
                                var dcmod = getAttribute(character.id, dcattr+"_mod");
                                if(typeof dcmod != 'undefined') {
                                    dc = 8 + getAttribute(character.id, 'pb')*1 + getAttribute(character.id, dcattr+"_mod")*1;
                                }
                            } else {
                                // flat DC
                                dcattr = fixed;
                                dc = attack.saveflat;
                            }
                            xml += '<type type="number">Spell</type>'
                                +  '<properties type="string">'+attack.saveattr.substr(0,3)+' vs DC'+dc+' ('+ucfirst(dcattr).substr(0,3)+'), no attackroll</properties>';
                        } else {
                            xml += '<type type="number">Other</type>'
                                +  '<properties type="string">no attackroll</properties>';
                        }
                        
                        // simulate a spell attack. this is necessary to list attacks without attack roll on the PDF
                        // they have atk +0 and a comment "no attackroll" in their properties
                        // strength_mod is used to calculate atk +0, because the pdf does automatic calc of atk based on <attackstat> and <attackbonus>
                        // TODO: check this in FG!
                        xml +=      '<attackbonus type="number">'+String(getAttribute(character.id, "strength_mod")*-1)+'</attackbonus>'
                            +       '<prof type="number">0</prof>'
                            +       '<attackstat type="string">strength</attackstat>'
                            +       '<carried type="number">2</carried>';
                    }



                    // damage
                    xml +=      '<damagelist>';
                    if(typeof attack.damage != 'undefined' || attack.damage_complex==1) {
                        xml +=      '<id-1>';
                        if(typeof attack.damage_bonus != 'undefined') {
                            xml +=      '<bonus type="number">'+attack.damage_bonus+'</bonus>';
                        }
                        var dice = attack.damage_dicetype;
                        if(attack.damage_dicecount>1) {
                            dice = (dice+',').repeat(attack.damage_dicecount-1) + dice;
                        }
                        if(typeof dice != 'undefined') {
                            xml +=          '<dice type="dice">'+dice+'</dice>';
                        }
                        xml +=          '<type type="string">';
                        if(attack.damage_complex == 1) {
                            xml += '(Roll20-Formula: ' + attack.damage_formula;
                            if(typeof attack.damage_formula_human != 'undefined') {
                                xml += ' ('+attack.damage_formula_human+') ';
                            }
                            xml += ') ';
                        }
                        if(typeof attack.dmgtype != 'undefined') {
                            xml +=      attack.dmgtype;
                        }
                        xml +=          '</type>';
                        xml +=      '</id-1>';
                    }
                    if(typeof attack.damage2 != 'undefined' && typeof attack.dmgflag2 != 'undefined' && attack.dmgflag2 != '0') {
                        xml +=      '<id-2>';
                        if(typeof attack.damage2_bonus != 'undefined') {
                            xml +=          '<bonus type="number">'+attack.damage2_bonus+'</bonus>';
                        }
                        var dice = attack.damage2_dicetype;
                        if(attack.damage2_dicecount>1) {
                            dice = (dice+',').repeat(attack.damage2_dicecount-1) + dice;
                        }
                        xml +=              '<dice type="dice">'+dice+'</dice>';
                        if(typeof attack.dmgtype2 != 'undefined') {
                            xml +=          '<type type="string">'+attack.dmgtype2+'</type>';
                        }
                        xml +=      '</id-2>';
                    }
                    xml +=      '</damagelist>';
                    xml +=  '</id-'+tagid+'>';





                    // Spellattacks - XML to insert into Spells-Section
                    if(typeof attack.spellid != 'undefined') {
                        var spellID = attack.spellid;
                        spellattackXML[spellID] = '<actions>'
                                            +   '<id-1>';
                        
                        if(typeof attack.saveeffect != 'undefined' && typeof attack.saveattr!= 'undefined') {
                            spellattackXML[spellID] += '<order type="number">1</order>'
                                            +       '<savemagic type="number">1</savemagic>' // always 1?
                                            +       '<type type="string">cast</type>'
                                            +       '<onmissdamage type="string">'+attack.saveeffect+'</onmissdamage>';
                            
                            if(typeof attack.saveflat == 'undefined') {
                                // saving throw
                                spellattackXML[spellID] += '<savedcbase type="string">ability</savedcbase>'
                                            +       '<savedcprof type="number">1</savedcprof>';
                                 
                                var dcattr;
                                if(typeof attack.savedcattr != 'undefined') {
                                    // spell has own dc attribute
                                    dcattr = attack.savedcattr;
                                } else {
                                    // use general dc attribute
                                    var spellcastability = getAttribute(character.id, 'spellcasting_ability');
                                    if(typeof spellcastability != 'undefined') {
                                        dcattr = spellcastability.replace(/@\{(.*?)_mod\}.*/, '$1');
                                    }
                                }
                                var dcmod = getAttribute(character.id, dcattr+"_mod");
                                if(typeof dcmod != 'undefined') {
                                    spellattackXML[spellID] += '<savedcmod type="number">'+getAttribute(character.id, dcattr+"_mod")+'</savedcmod>';
                                }
                            } else {
                                // flat DC
                                spellattackXML[spellID] += '<savedcmod type="number">'+attack.saveflat+'</savedcmod>'
                                                    + '<savedcbase type="string">fixed</savedcbase>';
                                // AlOnlineTools seems to handle flat DCs wrong, therefore add a note to the spells description
                                spellList[spellID].description += ' - - Flat DC: '+attack.saveflat+' (the value displayed below might be wrong)';
                            }
                        } else if(typeof spellList[spellID].attack != 'undefined') {
                            // spellattack
                            spellattackXML[spellID] += '<order type="number">1</order>'
                                            +       '<savemagic type="number">1</savemagic>' // always 1?
                                            +       '<type type="string">cast</type>'
                                            +       '<atkmod type="number">0</atkmod>'
                                            +       '<atkprof type="number">1</atkprof>'
                                            +       '<atkstat type="string">' +attack.attackstat+ '</atkstat>'
                                            +       '<atktype type="string">' +(typeof spellList[spellID] != 'undefined'?spellList[spellID].attack:'fixed').toLowerCase()+ '</atktype>';
                            var bonus=0;
                            spellattackXML[spellID] += '<attackbonus type="number">'+bonus+'</attackbonus>';
                        }

                        if(typeof attack.saveattr != 'undefined' && typeof attack.saveflag != 'undefined' && attack.saveflag != '0') {
                            spellattackXML[spellID] += '<savetype type="string">' + attack.saveattr.toLowerCase() + '</savetype>';
                        }
                                            
                        spellattackXML[spellID] += '</id-1>'
                                            +   '<id-2>'
                                            +       '<damagelist>';
                        if(typeof attack.damage != 'undefined') {
                            spellattackXML[spellID] +=      '<id-1>';
                            if(typeof attack.damage_bonus != 'undefined') {
                                spellattackXML[spellID] +=      '<bonus type="number">'+attack.damage_bonus+'</bonus>';
                            }
                            var dice = attack.damage_dicetype;
                            if(attack.damage_dicecount>1) {
                                dice = (dice+',').repeat(attack.damage_dicecount-1) + dice;
                            }
                            spellattackXML[spellID] +=          '<dice type="dice">'+dice+'</dice>';
                            if(typeof attack.dmgtype != 'undefined') {
                                spellattackXML[spellID] +=      '<type type="string">'+attack.dmgtype+'</type>';
                            }
                            spellattackXML[spellID] +=      '</id-1>';
                        }
                        if(typeof attack.damage2 != 'undefined' && typeof attack.dmgflag2 != 'undefined' && attack.dmgflag2 != '0') {
                            spellattackXML[spellID] +=      '<id-2>';
                            if(typeof attack.damage2_bonus != 'undefined') {
                                spellattackXML[spellID] +=          '<bonus type="number">'+attack.damage2_bonus+'</bonus>';
                            }
                            var dice = attack.damage2_dicetype;
                            if(attack.damage2_dicecount>1) {
                                dice = (dice+',').repeat(attack.damage2_dicecount-1) + dice;
                            }
                            spellattackXML[spellID] +=              '<dice type="dice">'+dice+'</dice>';
                            if(typeof attack.dmgtype2 != 'undefined') {
                                spellattackXML[spellID] +=          '<type type="string">'+attack.dmgtype2+'</type>';
                            }
                            spellattackXML[spellID] +=      '</id-2>';
                        }
                                            
                        spellattackXML[spellID] +=      '</damagelist>'
                                            +       '<order type="number">2</order>'
                                            +       '<type type="string">damage</type>'
                                            +   '</id-2>'
                                            + '</actions>';
                        
                    }
               }
            }
            xml += '</weaponlist>';   
            
            
            
            // Spellcasting
            
            // Spellslots
            xml += '<powermeta>';
            for(var slot=1; slot<=9; slot++) {
                xml +=  '<pactmagicslots'+slot+'><max type="number">0</max></pactmagicslots'+slot+'>';
            }
            for(var slot=1; slot<=9; slot++) {
                xml +=  '<spellslots'+slot+'><max type="number">'+getAttribute(character.id, 'lvl'+slot+'_slots_total')+'</max></spellslots'+slot+'>';
            }
            xml += '</powermeta>';

            // Spells        
            xml += '<powers>';
            tagid=0;
            for(var key in spellList) {
                if(typeof spellList[key] != 'undefined' && typeof spellList[key].name != 'undefined') {
                    tagid++;
                    xml +=  '<id-'+tagid+'>';
                    xml +=      '<name type="string">'+ spellList[key].name +'</name>';
                    xml +=      '<group type="string">Spells</group>';
                    
                    if(typeof spellList[key].castingtime != 'undefined') {
                        xml +=  '<castingtime type="string">'+ spellList[key].castingtime +'</castingtime>';
                    }
                    
                    if(typeof spellList[key].vocal != 'undefined' || typeof spellList[key].sensory != 'undefined' || typeof spellList[key].material != 'undefined') {
                        xml +=  '<components type="string">';
                        var component = new Array();
                        if(typeof spellList[key].vocal == 'undefined' || spellList[key].vocal != '0') {
                            component.push('V');
                        }
                        if(typeof spellList[key].sensory == 'undefined' || spellList[key].sensory != '0') {
                            component.push('S');
                        }
                        if(typeof spellList[key].material == 'undefined' || spellList[key].material != '0') {
                            component.push('M');
                        }
                        xml += component.join(', ');
                        if(typeof spellList[key].materials != 'undefined') {
                            xml += ' (' + spellList[key].materials + ')';
                        }
                        xml +=  '</components>';
                    }
                    
                    xml +=  '<description type="formattedtext">';
                    if(typeof spellList[key].description != 'undefined') {
                        var desc = spellList[key].description.replace(/\[\[(.*?)\]\]/, '[$1]');
                        xml += '<p>' + desc + '</p>'; //.replace(/\n|\\n/g, '</p><p>');
                    }
                    // since there is no concentration element in corerpg I add a note to the description (and duration, see below)
                    if(typeof spellList[key].concentration != 'undefined' && spellList[key].concentration == 1) {
                        xml += ' <p>(Concentration)</p>';
                    }
                    xml +=  '</description>';
                    if(typeof spellList[key].duration != 'undefined') {
                        xml +=  '<duration type="string">'+ spellList[key].duration;
                        // since there is no concentration element in corerpg I add a note to the duration, if it's not already included therein (and description, see above)
                        if(typeof spellList[key].concentration != 'undefined' && spellList[key].concentration == 1 && !spellList[key].duration.match(/concentration/i)) {
                            xml += ' (Concentration)';
                        }
                        xml += '</duration>'
                    }
                    if(typeof spellList[key].level != 'undefined') {
                        xml +=  '<level type="number">'+ spellList[key].level +'</level>';
                        
                        if(spellList[key].level*1>0) {
                            if(typeof spellList[key].prepared != 'undefined' && spellList[key].prepared=='0') {
                                xml +=  '<prepared type="number">0</prepared>';
                            } else {
                                xml +=  '<prepared type="number">1</prepared>';
                                prepared++;
                            }
                        }
                    }

                    if(typeof spellList[key].range != 'undefined') {
                        xml +=  '<range type="string">'+ spellList[key].range +'</range>';
                    }
                    if(typeof spellList[key].school != 'undefined') {
                        var school = ucfirst(spellList[key].school);
                        xml +=  '<school type="string">'+ school +'</school>';
                    }
                    xml +=      '<locked type="number">1</locked>';
                    
                    if(typeof spellattackXML[key] != 'undefined') {
                        xml += spellattackXML[key];
                    }
                    xml +=  '</id-'+tagid+'>';
                }
            }
            xml += '</powers>';
            
            xml += '<powergroup>';
            xml +=  '<id-1>';
            xml +=      '<name type="string">Spells</name>';
            xml +=      '<prepared type="number">'+prepared+'</prepared>';
            var spellcastability = getAttribute(character.id, 'spellcasting_ability');
            if(typeof spellcastability != 'undefined') {
                spellcastability = spellcastability.replace(/@\{(.*?)_mod\}.*/, '$1');
                xml += '<stat type="string">' +spellcastability+ '</stat>';
            }
            xml +=      '<atkprof type="number">1</atkprof>';
            xml +=      '<saveprof type="number">1</saveprof>';
            xml +=      '<castertype type="string">memorization</castertype>';
            xml +=  '</id-1>';
            xml += '</powergroup>';
            

            // Notes
            var features = getAttribute(character.id, "features_and_traits");
            var proficiencies = getAttribute(character.id, "other_proficiencies_and_languages");
            var story = getAttribute(character.id, "character_backstory");
            var orga = getAttribute(character.id, "allies_and_organizations");
            var addfeatures = getAttribute(character.id, "additional_feature_and_traits");
            var treasure = getAttribute(character.id, "treasure");
            
            if(getAttribute(character.id, "simpletraits") != 'complex' && typeof features != 'undefined' && features.length > 0) {
                notes += 'FEATURES: ' + features + '\n\n';
            }
            if(getAttribute(character.id, "simpleproficencies") != 'complex' && typeof proficiencies != 'undefined' && proficiencies.length > 0) {
                notes += 'OTHER PROFICIENCIES AND LANGUAGES: ' + proficiencies + '\n\n';
            }
            
            if(typeof story != 'undefined' && story.length > 0) {
                notes += 'BACKSTORY: ' + story + "\n\n";
            }
            if(typeof orga != 'undefined' && orga.length > 0) {
                notes += 'ORGANIZATIONS: ' + orga + "\n\n";
            }
            if(typeof addfeatures != 'undefined' && addfeatures.length > 0) {
                notes += 'ADDITIONAL FEATURES AND TRAITS: ' + addfeatures + "\n\n";
            }
            if(typeof treasure != 'undefined' && treasure.length > 0) {
                notes += 'TREASURE: ' + treasure + "\n\n";
            }

            xml+= '<notes type="string">' + notes + '</notes>';
            
            xml += '</character>'
                + '</root>';
            
        sendChat('CoreRPG-XML-Export', 'Export of Character ' +character.get('name')+ ' to CoreRPG-XML. Copy everything below and save to an .xml-file: ');
        xmlChat(xml);
        sendChat('CoreRPG-XML-Export', 'Done');
    }
});

function xmlChat(text) {
    if(typeof text == 'string') {
        text = text.replace(/&/g, '&amp;amp;');
        
        // convert all non ASCII characters to an ASCII compatible representation
        // https://stackoverflow.com/a/1354491
        text = text.replace(/[\u00A0-\u2666]/g, function(c) {
            return '&amp;#'+c.charCodeAt(0)+';';
        });
               
        sendChat('CoreRPG-XML-Export', '<pre>'+text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '&amp;#10;')+'</pre>' );
    }
}

function stripTags(text) {
    if(typeof text != 'undefined') {
        text += ''; // convert number and boolean to string
        return text.replace(/</g, ' ').replace(/>/g, ' ').trim();
    }
}

function getAttribute(characterid, attr, options) {
    return stripTags(getAttrByName(characterid, attr, options));
}

function ucfirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
// Prerequisites:
//  use Compendium Compatible Features, Traits and Proficiencies, otherwise they will only be printed to the NOTES block
// Known Bugs:
//  AlOnlineTools seems to handle flat DCs wrong, therefore added a note to the spells description
// TODO:
//  complex damage formula for damage2

});