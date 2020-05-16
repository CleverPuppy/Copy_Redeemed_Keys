// ==UserScript==
// @name         Copy redeemed key
// @version      0.91
// @description  A Tampermonkey script for copying redeemed keys of Humble Bundle.com
// @author       行者丁
// @namespace    https://github.com/CleverPuppy/Copy_Redeemed_Keys
// @supportURL   https://github.com/CleverPuppy/Copy_Redeemed_Keys/issues
// @updateURL    https://github.com/CleverPuppy/Copy_Redeemed_Keys/raw/master/CRK.user.js
// @downloadURL  https://github.com/CleverPuppy/Copy_Redeemed_Keys/raw/master/CRK.user.js
// @icon         https://humblebundle-a.akamaihd.net/static/hashed/46cf2ed85a0641bfdc052121786440c70da77d75.png
// @include      https://www.humblebundle.com/downloads*
// @grant        none
// @run-at       document-end
// @require     https://cdn.staticfile.org/html2canvas/0.5.0-beta4/html2canvas.min.js
// ==/UserScript==

(function () {
    const key_list_to_string = function (key_list) {
        var s = "";
        for (var i = 0; i < key_list.length; ++i) {
            var item = key_list[i];
            s = s.concat("游戏名：", item.game_name, " ,Key: ", item.key, "\n");
        }
        return s;
    };
    const getGameName = function (el) {
        var game_name = el.getElementsByClassName('heading-text')[0].innerText;
        if (game_name == '') {
            console.log("error:can't find .heading-text in element :");
            console.log(el);
            return 'Error:未找游戏';
        }
        return game_name;
    }
    const getGameInfo = function (el) {
        var item_name = el.getElementsByClassName('heading-text')[0].innerText;
        var item_key = el.getElementsByClassName('keyfield-value')[0].innerText;
        return { 'game_name': item_name, "key": item_key };
    }
    const mergeCanvas = function (canvasList, baseCanvas) {
        // merge all canvasList to baseCanvas
        var max_height = 0;
        var max_width = 0;
        for (var i =0 ; i< canvasList.length; ++i) {
            max_width = Math.max(max_width, canvasList[i].width);
            max_height += canvasList[i].height;
        }
        baseCanvas.height = max_height;
        baseCanvas.width = max_width;
        const drawCanvas = function (baseCanvas, canvasList, i, x, y) {
            if (i < canvasList.length) {
                baseCanvas.getContext('2d').drawImage(canvasList[i], x, y);
                drawCanvas(baseCanvas,canvasList,i+1,x,y + canvasList[i].height);
            }
        };
        drawCanvas(baseCanvas,canvasList,0,0,0);
    }
    const insertHTML = function () {
        const key_redeemer_list = document.getElementsByClassName('key-redeemer');
        if (key_redeemer_list.length == 0) {
            setTimeout(function () { insertHTML(); }, 500);
            return;
        }


        const total_game_num = key_redeemer_list.length;
        
        //set background to white
        for(var i = 0; i < total_game_num; ++i)
        {
            key_redeemer_list[i].setAttribute('style','background:white');
        }

        const base = document.getElementsByClassName('key-list')[0].parentElement;
        const insertElem = document.createElement("div");
        insertElem.className = 'copy-redeemed-key';
        let CRK_title = document.createElement('h2');
        CRK_title.textContent = "Copy Redeemed Keys Plugin Activated"
        insertElem.appendChild(CRK_title);
        const selectionElem = document.createElement('div');
        selectionElem.id = 'crk-selection';
        for (var i = 0; i < total_game_num; ++i) {
            var _p_elem = document.createElement('p');
            var _selec_elem = document.createElement('input');
            var _selec_label_elem = document.createElement('label');
            _p_elem.appendChild(_selec_elem);
            _p_elem.appendChild(_selec_label_elem);
            _selec_elem.type = 'checkbox'
            _selec_elem.id = 'crk-selection-' + i;
            _selec_elem.className = 'crk-selection checkbox';
            _selec_elem.value = i;
            _selec_label_elem.setAttribute('for', _selec_elem.id);
            if (key_redeemer_list[i].getElementsByClassName('js-keyfield keyfield redeemed enabled').length == 0) {
                // key unvailed
                _p_elem.setAttribute('style', 'boarder:1px solid red');
                _selec_elem.checked = false;
                _selec_elem.disabled = true;
                _selec_label_elem.textContent = "游戏名：" + getGameName(key_redeemer_list[i]) + "!!!KEY不可见!!!";
            }
            else {
                _selec_elem.checked = true;
                _selec_label_elem.textContent = "游戏名：" + getGameName(key_redeemer_list[i]);
            }
            selectionElem.appendChild(_p_elem);
        }
        insertElem.appendChild(selectionElem);

        const hintElem = document.createElement('span');
        hintElem.textContent = 'ALL keys info:';
        insertElem.appendChild(hintElem);
        const contentElem = document.createElement('textarea');
        contentElem.setAttribute('style', 'width: 770px; height: 260px');
        contentElem.textContent = "点击下方按键进行操作：\r [复制到剪贴板] ： 复制当前所有key的文字信息到剪贴板，并展示到这个区域(如果有未刮开的key,则会显示'Reveal xxx'的字样)  \r [生成key的截图] ： 将会生成这个网页当前key的截图，有需要可以自行复制";
        insertElem.appendChild(contentElem);

        const copyBtnPElem = document.createElement('p');
        const copyBtnElem = document.createElement('button');
        copyBtnElem.id='CRK-copy-btn';
        const copyBtnLabel = document.createElement('label');
        copyBtnLabel.setAttribute('for',copyBtnElem.id);
        copyBtnPElem.appendChild(copyBtnElem);
        copyBtnPElem.appendChild(copyBtnLabel);
        copyBtnElem.textContent = "复制到剪贴板";
        copyBtnElem.onclick = function () {
            var checked_games = selectionElem.getElementsByClassName('crk-selection checkbox');
            var key_list = []
            for (var i = 0; i < checked_games.length; ++i) {
                if (checked_games[i].checked == true) {
                    key_list.push(getGameInfo(key_redeemer_list[i]));
                }
            }
            contentElem.textContent = key_list_to_string(key_list);
            contentElem.select();
            document.execCommand('Copy');
            copyBtnLabel.textContent="已复制到剪贴板";
        };
        insertElem.appendChild(copyBtnPElem);

        const imageElem = document.createElement('img');
        imageElem.id = 'key-canvas-img';
        insertElem.appendChild(imageElem);

        const imageButtonP = document.createElement('p');
        const imageButtonElem = document.createElement('button');
        imageButtonElem.id = 'CRK-image-btn';
        const iamgeBtnLabelElem = document.createElement('label');
        iamgeBtnLabelElem.setAttribute('for',imageButtonElem.id);
        imageButtonElem.textContent = "生成Key的截图";
        imageButtonP.appendChild(imageButtonElem);
        imageButtonP.appendChild(iamgeBtnLabelElem);
        imageButtonElem.onclick = function () {
            iamgeBtnLabelElem.textContent = '正在生成截图...';
            imageElem.src='';
            var checkboxes = selectionElem.getElementsByClassName('crk-selection checkbox');
            var canvas_list = [];
            const getCanvasList = function (indice, max_length, checkboxes, canvas_list) {
                if (indice < max_length) {
                    if (checkboxes[indice].checked == true) {
                        html2canvas(key_redeemer_list[indice]).then(canvas => {
                            canvas_list.push(canvas);
                            return getCanvasList(indice + 1, max_length, checkboxes, canvas_list);
                        })
                    } else {
                        return getCanvasList(indice + 1, max_length, checkboxes, canvas_list);
                    }
                } else {
                    const baseCanvas = document.createElement('canvas');
                    mergeCanvas(canvas_list,baseCanvas);
                    imageElem.src = baseCanvas.toDataURL();
                    imageElem.setAttribute('style','border:2px solid black');
                    iamgeBtnLabelElem.textContent='';
                    return;
                }
            };
            getCanvasList(0, checkboxes.length, checkboxes, canvas_list);
        };
        insertElem.appendChild(imageButtonP);

        base.insertBefore(insertElem, base.firstChild);
    };
    insertHTML();
})();