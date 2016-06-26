if (!/\buser_id=/.test(document.cookie)) { //if no 'user_id' in cookies
  document.cookie = 'user_id=' + Utils.generateHash(32);  //add cookie 'user_id'
}