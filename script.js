// ==UserScript==
// @name         Copy redeemed key
// @version      0.1
// @description  A Tampermonkey script for copying redeemed keys of Humble Bundle.com
// @author       行者丁
// @namespace    https://github.com/CleverPuppy/Copy_Redeemed_Keys
// @supportURL   https://github.com/CleverPuppy/Copy_Redeemed_Keys/issues
// @version      0.1
// @updateURL    https://raw.githubusercontent.com/CleverPuppy/Copy_Redeemed_Keys/master/script.js
// @downloadURL  https://raw.githubusercontent.com/CleverPuppy/Copy_Redeemed_Keys/master/script.js
// @icon         https://humblebundle-a.akamaihd.net/static/hashed/46cf2ed85a0641bfdc052121786440c70da77d75.png
// @include      https://www.humblebundle.com/downloads*
// @grant        none
// @run-at       document-end
// @require     https://cdn.staticfile.org/html2canvas/0.5.0-beta4/html2canvas.min.js
// ==/UserScript==

(function () {
    const key_list_to_string = function(key_list) {
        var s = "";
        for(var i =0; i < key_list.length; ++i){
            var item = key_list[i];
            s = s.concat("游戏名：",item.game_name," ,Key: " ,item.key,"\n");
        }
        return s;
    };
    const get_redeemed_keys = function () {
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
        // console.log(key_list_to_string(key_list));
        insertHTML(key_list_to_string(key_list));
    };
    const insertHTML = function (contentVal){
        const base = document.getElementsByClassName('key-list')[0].parentElement;
        const insertElem = document.createElement("div");
        const hintElem = document.createElement('span');
        hintElem.textContent = 'ALL keys info:';
        insertElem.appendChild(hintElem);
        const contentElem = document.createElement('textarea');
        contentElem.setAttribute('style','width: 770px; height: 260px');
        contentElem.textContent = contentVal;
        insertElem.appendChild(contentElem);

        const buttonElem = document.createElement('button');
        buttonElem.textContent = "复制到剪贴板";
        buttonElem.onclick = function(){
            contentElem.select();
            document.execCommand('Copy');
            alert('已复制到剪贴板');
        };
        insertElem.appendChild(buttonElem);
        
        const imageElem = document.createElement('img');
        imageElem.id = 'key-canvas-img';
        insertElem.appendChild(imageElem);

        const imageButtonElem = document.createElement('button');
        imageButtonElem.textContent = "生成Key的截图";
        imageButtonElem.onclick = function(){
            const keyListElem = document.getElementsByClassName('key-list')[0];
            html2canvas(keyListElem).then(canvas => {
                imageElem.src = canvas.toDataURL();
            });
        };
        insertElem.appendChild(imageButtonElem);

        base.insertBefore(insertElem,base.firstChild);
    };
    get_redeemed_keys();
})();