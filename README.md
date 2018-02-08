# roll20-char-export

Character Export to CoreRPG XML

## Usage

1. select token of a character
2. !export
3. copy whole output and save to an .xml-file
3. import file in FantasyGrounds or
4. import file in https://www.alonlinetools.net/FGCharacterSheet.aspx

## Known Limitations

### Roll20

* no field for faction
* inline rolls aren't substituted (e.g. in spell descriptions)

### CoreRPG XML

* no elements for eyes, skin, hair 

### PDF

* all lists are alphabetically reordert 
* limited fieldsize cuts off some textfields (personal trait, bonds, notes etc.) and lists (items, attacks..)
* current hitpoints, temporary hitpoints and used hitdice are not displayed
* only attacks with attackrolls are displayed in the attacks-list