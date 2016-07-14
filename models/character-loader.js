const CharacterLoader = function() {
  const requireDir = require('require-dir');
  const characters = requireDir('./character');

  return {
    characters: characters
  };
}();
module.exports = CharacterLoader;