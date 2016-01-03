var CharacterLoader = function() {
  var requireDir = require('require-dir');
  var characters = requireDir('./character');

  var candidateCharacters = [
    {name: 'SungLa', avatarPath: '/media/arena/character/sung/sung.png'},
    {name: 'Tsai', avatarPath: '/media/arena/character/tsai/tsai.png'},
    {name: 'KerP', avatarPath: '/media/arena/character/kp/kp.png'},
    {name: 'DDL', avatarPath: '/media/arena/character/ddl/ddl.png'},
    {name: 'EJMa', avatarPath: '/media/arena/character/ejma/ejma.png'},
  ];

  return {
    candidateCharacters: candidateCharacters,
    characters: characters
  };
}();
module.exports = CharacterLoader;