// Github:   https://github.com/nesges/roll20-char-export
// By:       Thomas Nesges <thomas@nesges.eu>

on("chat:message", function(msg) {
    if (msg.type == "api" && msg.content.indexOf("!export ") === 0) {
        // Create variable for Input Name
        var inputName = _.rest(msg.content.split(" ")).join(" ");
        var list = findObjs({
            _type: "character",
            name: inputName
        });
        
        if (list.length == 0) {
            // There is no matching character
            return;
        }

        var characterId = list[0].id; // Assuming characters in the journal have unique names
        var character = getObj("character", characterId);

        var tagid=0;
        var notes = '';

        var xml = '<?xml version="1.0" encoding="iso-8859-1"?>'
            + '<root version="3.3" release="8|CoreRPG:3">'
            + '<character>'
            +   '<name type="string">' +inputName+ '</name>'
            +   '<level type="number">' +getAttribute(character.id, "level")+ '</level>'
            +   '<race type="string">' +getAttribute(character.id, "race")+ '</race>'
            +   '<speed><base type="number">' +getAttribute(character.id, "speed")+ '</base><total type="number">' +getAttribute(character.id, "speed")+ '</total></speed>'
            +   '<abilities>'
            +     '<charisma>'
            +         '<bonus type="number">' +getAttribute(character.id, "charisma_mod")+ '</bonus>'
            +         '<save type="number">' +getAttribute(character.id, "charisma_save_bonus")+ '</save>'
            +         '<savemodifier type="number"></savemodifier> <!-- TODO -->'
            +         '<saveprof type="number">' +(getAttribute(character.id, "charisma_save_prof")!='0'?'1':'0')+ '</saveprof>'
            +         '<score type="number">' +getAttribute(character.id, "charisma_base")+ '</score>'
            +     '</charisma>'
            +     '<constitution>'
            +         '<bonus type="number">' +getAttribute(character.id, "constitution_mod")+ '</bonus>'
            +         '<save type="number">' +getAttribute(character.id, "constitution_save_bonus")+ '</save>'
            +         '<savemodifier type="number"></savemodifier> <!-- TODO -->'
            +         '<saveprof type="number">' +(getAttribute(character.id, "constitution_save_prof")!='0'?'1':'0')+ '</saveprof>'
            +         '<score type="number">' +getAttribute(character.id, "constitution_base")+ '</score>'
            +     '</constitution>'
            +     '<dexterity>'
            +         '<bonus type="number">' +getAttribute(character.id, "dexterity_mod")+ '</bonus>'
            +         '<save type="number">' +getAttribute(character.id, "dexterity_save_bonus")+ '</save>'
            +         '<savemodifier type="number"></savemodifier> <!-- TODO -->'
            +         '<saveprof type="number">' +(getAttribute(character.id, "dexterity_save_prof")!='0'?'1':'0')+ '</saveprof>'
            +         '<score type="number">' +getAttribute(character.id, "dexterity_base")+ '</score>'
            +     '</dexterity>'
            +     '<intelligence>'
            +         '<bonus type="number">' +getAttribute(character.id, "intelligence_mod")+ '</bonus>'
            +         '<save type="number">' +getAttribute(character.id, "intelligence_save_bonus")+ '</save>'
            +         '<savemodifier type="number"></savemodifier> <!-- TODO -->'
            +         '<saveprof type="number">' +(getAttribute(character.id, "intelligence_save_prof")!='0'?'1':'0')+ '</saveprof>'
            +         '<score type="number">' +getAttribute(character.id, "intelligence_base")+ '</score>'
            +     '</intelligence>'
            +     '<strength>'
            +         '<bonus type="number">' +getAttribute(character.id, "strength_mod")+ '</bonus>'
            +         '<save type="number">' +getAttribute(character.id, "strength_save_bonus")+ '</save>'
            +         '<savemodifier type="number"></savemodifier> <!-- TODO -->'
            +         '<saveprof type="number">' +(getAttribute(character.id, "strength_save_prof")!='0'?'1':'0')+ '</saveprof>'
            +         '<score type="number">' +getAttribute(character.id, "strength_base")+ '</score>'
            +     '</strength>'
            +     '<wisdom>'
            +         '<bonus type="number">' +getAttribute(character.id, "wisdom_mod")+ '</bonus>'
            +         '<save type="number">' +getAttribute(character.id, "wisdom_save_bonus")+ '</save>'
            +         '<savemodifier type="number"></savemodifier> <!-- TODO -->'
            +         '<saveprof type="number">' +(getAttribute(character.id, "wisdom_save_prof")!='0'?'1':'0')+ '</saveprof>'
            +         '<score type="number">' +getAttribute(character.id, "wisdom_base")+ '</score>'
            +     '</wisdom>'
            +   '</abilities>';
            
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
            +           '<casterlevelinvmult type="number">' +getAttribute(character.id, "caster_level")+ '</casterlevelinvmult> <!-- CHECK -->'
            +           '<casterpactmagic type="number"></casterpactmagic> <!-- TODO -->'
            +           '<hddie type="dice">d' +getAttribute(character.id, "hitdietype")+ '</hddie> <!-- CHECK -->'
            +           '<hdused type="number">' +(getAttribute(character.id, "hit_dice","max")-getAttribute(character.id, "hit_dice"))+ '</hdused> <!-- CHECK -->'
            +           '<level type="number">' +getAttribute(character.id, "base_level")+ '</level>'
            +           '<name type="string">' +getAttribute(character.id, "class")+ '</name>'
            +       '</id-00001>';
            // Multiclass
            for(var mcf=1; mcf<=3; mcf++) {
                if(getAttribute(character.id, "multiclass"+mcf+"_flag") == 1) {
                    xml +='<id-0000'+(mcf+1)+'>'
                        +    '<casterlevelinvmult type="number"></casterlevelinvmult>'
                        +    '<casterpactmagic type="number"></casterpactmagic>'
                        +    '<hddie type="dice"></hddie>'
                        +    '<hdused type="number"></hdused>'
                        +    '<level type="number">' +getAttribute(character.id, "multiclass"+mcf+"_lvl")+ '</level>'
                        +    '<name type="string">' +getAttribute(character.id, "multiclass"+mcf)+ '</name>'
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
        
        
            // Skills
            xml +='<skilllist>'
                + '<id-00001>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Perception</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "perception_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">wisdom</stat>'
                +     '<total type="number">' +getAttribute(character.id, "perception_bonus")+ '</total>'
                + '</id-00001>'
                + '<id-00002>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Arcana</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "arcana_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">intelligence</stat>'
                +     '<total type="number">' +getAttribute(character.id, "arcana_bonus")+ '</total>'
                + '</id-00002>'
                + '<id-00003>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Persuasion</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "persuasion_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">charisma</stat>'
                +     '<total type="number">' +getAttribute(character.id, "persuasion_bonus")+ '</total>'
                + '</id-00003>'
                + '<id-00004>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Nature</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "nature_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">intelligence</stat>'
                +     '<total type="number">' +getAttribute(character.id, "nature_bonus")+ '</total>'
                + '</id-00004>'
                + '<id-00005>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Medicine</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "medicine_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">wisdom</stat>'
                +     '<total type="number">' +getAttribute(character.id, "medicine_bonus")+ '</total>'
                + '</id-00005>'
                + '<id-00006>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Survival</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "survival_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">wisdom</stat>'
                +     '<total type="number">' +getAttribute(character.id, "survival_bonus")+ '</total>'
                + '</id-00006>'
                + '<id-00007>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Performance</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "performance_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">charisma</stat>'
                +     '<total type="number">' +getAttribute(character.id, "performance_bonus")+ '</total>'
                + '</id-00007>'
                + '<id-00008>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Acrobatics</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "acrobatics_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">dexterity</stat>'
                +     '<total type="number">' +getAttribute(character.id, "acrobatics_bonus")+ '</total>'
                + '</id-00008>'
                + '<id-00009>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Religion</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "religion_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">intelligence</stat>'
                +     '<total type="number">' +getAttribute(character.id, "religion_bonus")+ '</total>'
                + '</id-00009>'
                + '<id-00010>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Athletics</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "athletics_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">strength</stat>'
                +     '<total type="number">' +getAttribute(character.id, "athletics_bonus")+ '</total>'
                + '</id-00010>'
                + '<id-00011>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Sleight of Hand</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "sleight_of_hand_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">dexterity</stat>'
                +     '<total type="number">' +getAttribute(character.id, "sleight_of_hand_bonus")+ '</total>'
                + '</id-00011>'
                + '<id-00012>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Insight</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "insight_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">wisdom</stat>'
                +     '<total type="number">' +getAttribute(character.id, "insight_bonus")+ '</total>'
                + '</id-00012>'
                + '<id-00013>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Intimidation</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "intimidation_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">charisma</stat>'
                +     '<total type="number">' +getAttribute(character.id, "intimidation_bonus")+ '</total>'
                + '</id-00013>'
                + '<id-00014>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Deception</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "deception_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">charisma</stat>'
                +     '<total type="number">' +getAttribute(character.id, "deception_bonus")+ '</total>'
                + '</id-00014>'
                + '<id-00015>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Investigation</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "investigation_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">intelligence</stat>'
                +     '<total type="number">' +getAttribute(character.id, "investigation_bonus")+ '</total>'
                + '</id-00015>'
                + '<id-00016>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Stealth</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "stealth_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">dexterity</stat>'
                +     '<total type="number">' +getAttribute(character.id, "stealth_bonus")+ '</total>'
                + '</id-00016>'
                + '<id-00017>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">History</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "history_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">intelligence</stat>'
                +     '<total type="number">' +getAttribute(character.id, "history_bonus")+ '</total>'
                + '</id-00017>'
                + '<id-00018>'
                +     '<misc type="number">0</misc>'
                +     '<name type="string">Animal Handling</name>'
                +     '<prof type="number">' +(getAttribute(character.id, "animal_handling_prof")!='0'?'1':'0')+ '</prof>'
                +     '<stat type="string">wisdom</stat>'
                +     '<total type="number">' +getAttribute(character.id, "animal_handling_bonus")+ '</total>'
                + '</id-00018>'
                + '</skilllist>';
        
            // DEBUG
            //var items = filterObjs(function(obj){
            //    if(obj.get('type') === 'attribute'
            //        && obj.get('characterid') === character.id
            //    ) {
            //        log(obj);
            //    }
            //    return false;
            //});
        
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
                    var itemID = item.get('name').replace(/^repeating_inventory_(.*?)_.*$/, '$1');
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
                    }
                }
            });

            xml += '<inventorylist>';
            for(var key in itemList) {
                if(typeof itemList[key].name != 'undefined') {
                    tagid++;
                    xml += '<id-'+tagid+'>';
                    xml +=  '<name type="string">'+itemList[key].name+'</name>';
                    if(itemList[key].equipped == '0') {
                        xml += '<carried type="number">1</carried>';
                    } else {
                        xml += '<carried type="number">2</carried>';
                    }
                    if(typeof itemList[key].count != 'undefined') {
                        xml += '<count type="number">'+itemList[key].count+'</count>';
                    }
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
                        xml += '<description type="formattedtext">'+itemList[key].description+'</description>';
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
                var traitID = trait.get('name').replace(/^repeating_traits_(.*)_.*$/, '$1');
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
                        if(typeof traitList[key].description != 'undefined') {
                            xml += '<text type="formattedtext"><p>'+traitList[key].description;
                            if(typeof traitList[key].source != 'undefined') {
                                xml += ' ('+traitList[key].source;
                                if(typeof traitList[key].sourcetype != 'undefined') {
                                    xml += ', ' + traitList[key].sourcetype;
                                }
                                xml += ')';
                            }
                            xml += '</p></text>';
                        }
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
                if(typeof featureList[key].description != 'undefined') {
                    xml += '<text type="formattedtext"><p>'+featureList[key].description;
                    if(typeof featureList[key].source != 'undefined') {
                        xml += ' ('+featureList[key].source;
                        if(typeof featureList[key].sourcetype != 'undefined') {
                            xml += ', ' + featureList[key].sourcetype;
                        }
                        xml += ')';
                    }
                    xml += '</p></text>';
                }
                xml +='</id-'+tagid+'>';
            };
            xml += '</featurelist>';
            
            tagid=0;
            xml += '<featlist>';
            for(var key in featList) {
                tagid++;
                xml += '<id-'+tagid+'>';
                xml +=  '<name type="string">'+featList[key].name+'</name>';
                if(typeof featList[key].description != 'undefined') {
                    xml += '<text type="formattedtext"><p>'+featList[key].description;
                    if(typeof featList[key].source != 'undefined') {
                        xml += ' ('+featList[key].source;
                        if(typeof featList[key].sourcetype != 'undefined') {
                            xml += ', ' + featList[key].sourcetype;
                        }
                        xml += ')';
                    }
                    xml += '</p></text>';
                }
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
                var toolID = tool.get('name').replace(/^repeating_tool_(.*?)_.*$/, '$1');
                if(typeof toolList[toolID] != 'object') {
                    toolList[toolID] = {};
                }
                if(tool.get('name').indexOf('_toolname')!==-1) {
                    toolList[toolID].name = stripTags(tool.get('current'));
                } else if(tool.get('name').indexOf('_toolbonus')!==-1) {
                    toolList[toolID].bonus = stripTags(tool.get('current'));
                } else if(tool.get('name').indexOf('_toolattr')!==-1) {
                    toolList[toolID].attr = stripTags(tool.get('current'));
                }
            });
            // TODO:  How are tools represented in FG XML?

            
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
                var profID = prof.get('name').replace(/^repeating_proficiencies_(.*?)_.*$/, '$1')
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
            for(var key in profList) {
                if(typeof profList[key].name != 'undefined') {
                    if(profList[key].type == 'ARMOR') {
                        armorList.push(profList[key].name);
                    } else if(profList[key].type == 'WEAPON') {
                        weaponList.push(profList[key].name);
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
                    xml += '<id-'+tagid+'><name type="string">'+langList[k]+'</name></id-'+tagid+'>';
                }
            }
            xml += '</languagelist>';
            
            // weapon, armor, tools
            tagid=0;
            xml += '<proficiencylist>';
            for(var k=0; k<armorList.length; k++) {
                if(typeof armorList[k] != 'undefined') {
                    tagid++;
                    xml += '<id-'+tagid+'><name type="string">'+armorList[k]+'</name></id-'+tagid+'>';
                }
            }
            for(var k=0; k<weaponList.length; k++) {
                if(typeof weaponList[k] != 'undefined') {
                    tagid++;
                    xml += '<id-'+tagid+'><name type="string">'+weaponList[k]+'</name></id-'+tagid+'>';
                }
            }
            for(var key in toolList) {
                if(typeof toolList[key] != 'undefined') {
                    tagid++;
                    xml += '<id-'+tagid+'><name type="string">'+toolList[key].name+'</name></id-'+tagid+'>';
                }
            };
            xml += '</proficiencylist>';
        
        
            // Spells
            var spellList = {};
            var spells = filterObjs(function(obj){
                if(obj.get('type') === 'attribute'
                    && obj.get('characterid') === character.id
                    && obj.get('name').indexOf('repeating_spell-') !== -1
                ) {
                    return true;
                }
                return false;
            });
            
            var prepared=0;
            spells.forEach(function(spell, index) {
                var spellID = spell.get('name').replace(/^repeating_spell-(._.*?)_.*$/, '$1');
                if(typeof spellList[spellID] != 'object') {
                    spellList[spellID] = {};
                }
                if(spell.get('name').indexOf('_spellname')!==-1) {
                    spellList[spellID].name = stripTags(spell.get('current'));
                    spellList[spellID].level = spell.get('name').replace(/^repeating_spell-(.)_.*?_.*$/, '$1');
                } else if(spell.get('name').indexOf('_spellschool')!==-1) {
                    spellList[spellID].school = stripTags(spell.get('current'));
                } else if(spell.get('name').indexOf('_spellcastingtime')!==-1) {
                    spellList[spellID].castingtime = stripTags(spell.get('current'));
                } else if(spell.get('name').indexOf('_spellrange')!==-1) {
                    spellList[spellID].range = stripTags(spell.get('current'));
                } else if(spell.get('name').indexOf('_spellcomp_s')!==-1) {
                    spellList[spellID].sensory = stripTags(spell.get('current'));
                } else if(spell.get('name').indexOf('_spellcomp_m')!==-1) {
                    spellList[spellID].material = stripTags(spell.get('current'));
                } else if(spell.get('name').indexOf('_spellcomp_materials')!==-1) {
                    spellList[spellID].materials = stripTags(spell.get('current'));
                } else if(spell.get('name').indexOf('_spellcomp_v')!==-1) {
                    spellList[spellID].vocal = stripTags(spell.get('current'));
                } else if(spell.get('name').indexOf('_spellconcentration')!==-1) {
                    spellList[spellID].concentration = stripTags(spell.get('current'));
                } else if(spell.get('name').indexOf('_spellduration')!==-1) {
                    spellList[spellID].duration = stripTags(spell.get('current'));
                } else if(spell.get('name').indexOf('_spelldescription')!==-1) {
                    spellList[spellID].description = stripTags(spell.get('current'));
                } else if(spell.get('name').indexOf('_spellprepared')!==-1) {
                    spellList[spellID].prepared = stripTags(spell.get('current'));
                    prepared++;
                } else if(spell.get('name').indexOf('_spellritual')!==-1) {
                    spellList[spellID].ritual = stripTags(spell.get('current'));
                }
            });

		    
            
            // Spellcasting
            
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
			xml +=  '</id-1>';
		    xml += '</powergroup>';
		    
		    //spell_save_dc
		    //spell_attack_bonus
		    
		    // Spellslots
		    xml += '<powermeta>';
			xml +=  '<pactmagicslots1><max type="number">0</max></pactmagicslots1>';
			xml +=  '<pactmagicslots2><max type="number">0</max></pactmagicslots2>';
			xml +=  '<pactmagicslots3><max type="number">0</max></pactmagicslots3>';
			xml +=  '<pactmagicslots4><max type="number">0</max></pactmagicslots4>';
			xml +=  '<pactmagicslots5><max type="number">0</max></pactmagicslots5>';
			xml +=  '<pactmagicslots6><max type="number">0</max></pactmagicslots6>';
			xml +=  '<pactmagicslots7><max type="number">0</max></pactmagicslots7>';
			xml +=  '<pactmagicslots8><max type="number">0</max></pactmagicslots8>';
			xml +=  '<pactmagicslots9><max type="number">0</max></pactmagicslots9>';
			xml +=  '<spellslots1><max type="number">'+getAttribute(character.id, 'lvl1_slots_total')+'</max></spellslots1>';
			xml +=  '<spellslots2><max type="number">'+getAttribute(character.id, 'lvl2_slots_total')+'</max></spellslots2>';
			xml +=  '<spellslots3><max type="number">'+getAttribute(character.id, 'lvl3_slots_total')+'</max></spellslots3>';
			xml +=  '<spellslots4><max type="number">'+getAttribute(character.id, 'lvl4_slots_total')+'</max></spellslots4>';
			xml +=  '<spellslots5><max type="number">'+getAttribute(character.id, 'lvl5_slots_total')+'</max></spellslots5>';
			xml +=  '<spellslots6><max type="number">'+getAttribute(character.id, 'lvl6_slots_total')+'</max></spellslots6>';
			xml +=  '<spellslots7><max type="number">'+getAttribute(character.id, 'lvl7_slots_total')+'</max></spellslots7>';
			xml +=  '<spellslots8><max type="number">'+getAttribute(character.id, 'lvl8_slots_total')+'</max></spellslots8>';
			xml +=  '<spellslots9><max type="number">'+getAttribute(character.id, 'lvl9_slots_total')+'</max></spellslots9>';
		    xml += '</powermeta>';
		
            xml += '<powers>';
            tagid=0;
            for(var key in spellList) {
                if(typeof spellList[key] != 'undefined') {
                    tagid++;
                    xml +=  '<id-'+tagid+'>';
			        xml +=      '<name type="string">'+ spellList[key].name +'</name>';
			        xml +=      '<group type="string">Spells</group>';
			        
			        if(typeof spellList[key].castingtime != 'undefined') {
			            xml +=      '<castingtime type="string">'+ spellList[key].castingtime +'</castingtime>';
			        }
                    
                    if(typeof spellList[key].vocal != 'undefined' || typeof spellList[key].sensory != 'undefined' || typeof spellList[key].material != 'undefined') {
                        xml +=      '<components type="string">';
                        var component = new Array();
                        if(typeof spellList[key].vocal != 'undefined' && spellList[key].vocal != '0') {
                            component.push('V');
                        }
                        if(typeof spellList[key].sensory != 'undefined' && spellList[key].sensory != '0') {
                            component.push('S');
                        }
                        if(typeof spellList[key].material != 'undefined' && spellList[key].material != '0') {
                            component.push('M');
                        }
                        xml += component.join(', ');
                        if(typeof spellList[key].materials != 'undefined') {
                            xml += ' (' + spellList[key].materials + ')';
                        }
                        xml +=      '</components>';
                    }
                    
                    if(typeof spellList[key].description != 'undefined') {
                        xml +=      '<description type="formattedtext">'+ spellList[key].description +'</description>';
                    }
                    if(typeof spellList[key].duration != 'undefined') {
                        xml +=      '<duration type="string">'+ spellList[key].duration +'</duration>';
                    }
                    if(typeof spellList[key].level != 'undefined') {
                        xml +=      '<level type="number">'+ spellList[key].level +'</level>';
                    }
                    if(typeof spellList[key].prepared != 'undefined') {
                        xml +=      '<prepared type="number">'+ spellList[key].prepared +'</prepared>';
                    }
                    if(typeof spellList[key].range != 'undefined') {
                        xml +=      '<range type="string">'+ spellList[key].range +'</range>';
                    }
                    if(typeof spellList[key].school != 'undefined') {
                        xml +=      '<school type="string">'+ spellList[key].school +'</school>';
                    }
                    
                    xml +=  '</id-'+tagid+'>';
                }
            }
            xml += '</powers>';


            // Attacks
            var attackList = {};
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
                var attackID = attack.get('name').replace(/^repeating_attack_(.*?)_.*$/, '$1');
                if(typeof attackList[attackID] != 'object') {
                    attackList[attackID] = {};
                }
                if(attack.get('name').indexOf('_atkname')!==-1) {
                    attackList[attackID].name = stripTags(attack.get('current'));
                } else if(attack.get('name').indexOf('_atk_desc')!==-1) {
                    attackList[attackID].description = stripTags(attack.get('current'));
                } else if(attack.get('name').indexOf('_atkbonus')!==-1) {
                    attackList[attackID].hit = stripTags(attack.get('current'));
                    attackList[attackID].hit = attackList[attackID].hit.replace(/\+/, '');
                } else if(attack.get('name').indexOf('_dmgbase')!==-1) {
                    var dmg = stripTags(attack.get('current'));
                    var m;
                    if(m=dmg.match(/^(\d+)(d\d+)(\+\d+)?$/i)) {
                        attackList[attackID].damage = dmg;
                        if(typeof m[1] != 'undefined') {
                            attackList[attackID].damage_dicecount = m[1];
                        }
                        if(typeof m[2] != 'undefined') {
                            attackList[attackID].damage_dicetype = m[2];
                        }
                        if(typeof m[3] != 'undefined') {
                            attackList[attackID].damage_bonus = m[3];
                        }
                    }
                } else if(attack.get('name').indexOf('_dmgtype')!==-1) {
                    attackList[attackID].dmgtype = stripTags(attack.get('current'));
                } else if(attack.get('name').indexOf('_dmg2flag')!==-1) {
                    attackList[attackID].dmgflag2 = stripTags(attack.get('current'));
                } else if(attack.get('name').indexOf('_dmg2base')!==-1) {
                    var dmg = stripTags(attack.get('current'));
                    if(m=dmg.match(/^(\d+)(d\d+)(\+\d+)?$/i)) {
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
                } else if(attack.get('name').indexOf('_dmg2type')!==-1) {
                    attackList[attackID].dmgtype2 = stripTags(attack.get('current'));
                } else if(attack.get('name').indexOf('_atkrange')!==-1) {
                    attackList[attackID].range = stripTags(attack.get('current'));
                } else if(attack.get('name').indexOf('_dmgattr')!==-1) {
                    var dmgattr = stripTags(attack.get('current'));
                    var m;
                    if(m=dmgattr.match(/^@\{(.*?)\}$/)) {
                        attackList[attackID].damage_bonus = getAttribute(character.id, m[1]);
                    }
                }
            });
            
            tagid=0;
            xml += '<weaponlist>';
            for(var key in attackList) {
                if(typeof attackList[key] != 'undefined') {
                    tagid++;
                    xml +=  '<id-'+tagid+'>';
                    xml +=      '<name type="string">'+attackList[key].name+'</name>';
                    xml +=      '<attackbonus type="number">'+attackList[key].hit+'</attackbonus>';
                    xml +=      '<carried type="number">2</carried>';
                    xml +=      '<prof type="number">1</prof>';
                    xml +=      '<type type="number">0</type>';
                    xml +=      '<damagelist>';
                    if(typeof attackList[key].damage != 'undefined') {
                        xml +=      '<id-1>';
                        xml +=          '<stat type="string">base</stat>';
                        if(typeof attackList[key].damage_bonus != 'undefined') {
                            xml +=          '<bonus type="number">'+attackList[key].damage_bonus+'</bonus>';
                        }
                        var dice = attackList[key].damage_dicetype;
                        if(attackList[key].damage_dicecount>1) {
                            dice = (dice+',').repeat(attackList[key].damage_dicecount-1) + dice;
                        }
                        xml +=          '<dice type="dice">'+dice+'</dice>';
                        if(typeof attackList[key].dmgtype != 'undefined') {
                            xml += '<type type="string">'+attackList[key].dmgtype+'</type>';
                        }
                        xml +=      '</id-1>';
                    }
                    if(typeof attackList[key].damage2 != 'undefined' && typeof attackList[key].dmgflag2 != 'undefined' && attackList[key].dmgflag2 != '0') {
                        xml +=      '<id-2>';
                        if(typeof attackList[key].damage2_bonus != 'undefined') {
                            xml +=          '<bonus type="number">'+attackList[key].damage2_bonus+'</bonus>';
                        }
                        var dice = attackList[key].damage2_dicetype;
                        if(attackList[key].damage2_dicecount>1) {
                            dice = (dice+',').repeat(attackList[key].damage2_dicecount-1) + dice;
                        }
                        xml +=          '<dice type="dice">'+dice+'</dice>';
                        if(typeof attackList[key].dmgtype2 != 'undefined') {
                            xml += '<type type="string">'+attackList[key].dmgtype2+'</type>';
                        }
                        xml +=      '</id-2>';
                    }
                    xml +=      '</damagelist>';
                    xml +=      '<prof type="number">0</prof>';
                    xml +=  '</id-'+tagid+'>';
                }
            };
            xml += '</weaponlist>';   
            

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
                notes += 'BACKSTORY: ' + story + '\n\n';
            }
            if(typeof orga != 'undefined' && orga.length > 0) {
                notes += 'ORGANIZATIONS: ' + orga + '\n\n';
            }
            if(typeof addfeatures != 'undefined' && addfeatures.length > 0) {
                notes += 'ADDITIONAL FEATURES AND TRAITS: ' + addfeatures + '\n\n';
            }
            if(typeof treasure != 'undefined' && treasure.length > 0) {
                notes += 'TREASURE: ' + treasure + '\n\n';
            }

            xml+= '<notes type="string">' + notes + '</notes>';
            
            
            
            xml += '</character>'
                + '</root>';
            
        sendChat('CoreRPG-XML-Export', 'Export of Character ' +inputName+ ' to CoreRPG-XML. Copy everything below and save to an XML-File: ');
        xmlChat(xml);
        sendChat(inputName, 'Export done');
    }
});

function xmlChat(text) {
    if(typeof text == 'string') {
        sendChat('CoreRPG-XML-Export', '<pre>'+text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '\\n')+'</pre>' );
    }
}

function stripTags(text) {
    if(typeof text != 'undefined') {
        text += ''; // convert number and boolean to string
        return text.replace(/</g, ' ').replace(/>/g, ' ').replace(/\n/g, ' ');
    }
}

function getAttribute(characterid, attr, options) {
    return stripTags(getAttrByName(characterid, attr, options));
}


// TODO: Spells, diff. Attack Bonus and Proficiencies, Tool-Proficiencies ok?, Pactmagic