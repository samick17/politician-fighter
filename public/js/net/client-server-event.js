var ClientServerEvent = function() {
  return {
    init: 'a',
    createGameRoom: 'c',
    quickJoin: 'd',
    selectCharacter: 'e',
    ensureSelectCharacter: 'f',
    leaveRoom: 'g',
    play: 'h',
    exit: 'i',
    //player command
    move: 'j',
    run: 'k',
    attack: 'l',
    lookAt: 'm',
    requestAttack: 'n',
    requestUseInventoryItem: 'o',
    gameLoadingComplete: 'p',
    changeState: 'q',//normal/special
    bankai: 'r',//(normal/special) -> bankai
    jump: 's',
    doubleJump: 't'
  };
}();