# roll20-char-export

## export.js

Character Export to CoreRPG XML

### Usage

1. select token of a character
2. `!export`
3. copy whole output and save to an .xml-file
3. import file in FantasyGrounds or
4. import file in https://www.alonlinetools.net/FGCharacterSheet.aspx

### Known Limitations

#### Roll20

* no field for faction
* inline rolls aren't substituted (e.g. in spell descriptions)

#### CoreRPG XML

* no elements for eyes, skin, hair 

#### PDF

* all lists are alphabetically reordert 
* limited fieldsize cuts off some textfields (personal trait, bonds, notes etc.) and lists (items, attacks..)
* current hitpoints, temporary hitpoints and used hitdice are not displayed
* only attacks with attackrolls are displayed in the attacks-list


## autogm

### Usage

`!autogm`

Searches for character sheets that have no controlledby-player assigned yet. If the characters name is text1::text2 or text1 (text2) with text2=a players displayname, that sheet is asigned to that player


## handoutsmanger

### Usage

`!hom show Mysterious Note`

adds handout "Mysterious Note" to journals of players that are online

`!hom showid -L1t-XnjlJv0Q7IZwECX`

adds handout with id "-L1t-XnjlJv0Q7IZwECX" to journals of players that are online

`!hom id Mysterious Note`

prints the id of "Mysterious Node"