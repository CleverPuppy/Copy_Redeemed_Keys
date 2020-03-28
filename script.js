// ==UserScript==
// @name         Copy rendered key
// @version      0.1
// @description  try to take over the world!
// @author       dph
// @icon         https://humblebundle-a.akamaihd.net/static/hashed/46cf2ed85a0641bfdc052121786440c70da77d75.png
// @include      https://www.humblebundle.com/downloads*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    var key_list_to_string = function(key_list) {
        var s = "";
        for(var i =0; i < key_list.length; ++i){
            var item = key_list[i];
            s = s.concat("游戏名：",item.game_name," ,Key: " ,item.key,"\n");
        }
        return s;
    };
    var get_redeemed_keys = function () {
        var key_list = [];
        var key_redeemer_list = document.getElementsByClassName('key-redeemer');
        if (key_redeemer_list.length == 0) {
            setTimeout(function () { get_redeemed_keys(); }, 500);
            return;
        }
        for (var i = 0; i < key_redeemer_list.length; ++i) {
            var el = key_redeemer_list[i];
            var item_name = el.getElementsByClassName('heading-text')[0].innerText;
            var item_key = el.getElementsByClassName('keyfield-value')[0].innerText;
            key_list.push({ 'game_name': item_name, "key": item_key });
        };
        console.log(key_list_to_string(key_list));
    }
    get_redeemed_keys();
})();