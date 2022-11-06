var params = new URLSearchParams(window.location.search)
var story_type = params.get('type')
var story_id = params.get('id')
var phase = params.get('phase')

var resource_path = 'https://raw.githubusercontent.com/Cpk0521/CueStoryResource/main'

var voicePlayer = new Audio()

var original_Story = {}
var edit_Story = {}
var savetitle = ''
var edit_lan = ''

var isPreview = false

var localStorge = window.localStorage
const StorgeKey = 'StoryEditorStorge_v2'
const StorgeKey_old = 'StoryEditorStorge'
localStorge.removeItem(StorgeKey_old)
var record = JSON.parse(localStorge.getItem(StorgeKey))


// "TXT_NAME":{
//     title : '',
//     record : {
//     }
// }


const loadAllJson = () => {
    fetch('./json/All.json')
        .then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        })
        .then(response => response.json())
        .then(json => {
            
            console.log(story_type, story_id, phase)

            let storylist = json[story_type]?.find(x => {return x.scenarios.find(s => s.story_id == story_id && s.phase == phase)}) 
            let curr = [...storylist.scenarios]?.find(x => {return x.phase == phase && x.story_id == story_id})
            
            // console.log(curr)
            loadStoryLog(curr)

        }).catch(function(error) {
            console.log(error);
        });
}

const loadStoryLog = (curr) => {
    var logtitle = document.getElementById('log-title')
    logtitle.innerText = curr.title
    savetitle = curr.title
    document.title = `${curr.title} | Editor Mode`

    // var logItemList = document.getElementById('log-item-list')

    fetch(`${resource_path}/scenario/${curr.path}`)
        .then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        })
        .then(response => response.json())
        .then(json => {

            original_Story = json
            
            if(record != null) {
                updateRecord()
                if(record[original_Story.Txt_Name]) {
                    edit_Story = record[original_Story.Txt_Name]['Record']
                }else{
                    edit_Story = {...original_Story}    
                }
            }else {
                edit_Story = {...original_Story}
            }

            genEditorStoryLog(json)
            

        }).catch(function(error) {
            console.log(error);
        });
}

const updateRecord = () => {
    let recordList = document.getElementById('record-list')
    recordList.innerHTML = ''
    Object.entries(record).map(([key, value])=>{
        
        let div = document.createElement("div");
        div.className = 'record-item'
    
        let namediv = document.createElement("div");
        namediv.innerHTML = value.Title
        div.append(namediv)
    
        let button = document.createElement("button");
        button.className = 'record-remove-btn'
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>`
        button.onclick = () => {
            console.log(value.Title)
            div.remove();
            delete record[key]
            localStorage.setItem(StorgeKey, JSON.stringify(record))
        }
        div.append(button)
    
        recordList.append(div)
    })

}


const genEditorStoryLog = (EditStory, language = 'default') => {

    if(language === '') {
        language = 'default'
    }

    var logItemList = document.getElementById('log-item-list')
    logItemList.innerHTML = ''

    // var inner = ``
    EditStory.Dialogue?.map(d => {
        // inner += `<div class='Log-item'>`
        // inner += `<div class='dialogue'>`
        // inner += `<div class='dialogue-icon ${d.heroineId.length > 1?`multiple-${d.heroineId.length}`:''}'>` 
        // Array.from(d.heroineId).forEach(i => {
        //     if(i != 0)
        //         inner += `<img src="./Image/CharIcon/CharaIcon_${i.toString().padStart(2, '0')}.png"/>`
        // })
        // inner += `</div>`
        // inner += `<div class='dialogue-name'><input type="text" class="editor-name" value="${d.name[language]}"/></div>`
        // inner += `<textarea class='dialogue-meg editor-meg'>${d.message[language]}</textarea>`
        // inner += `<div class='dialogue-voice'>`
        // // if(d.voice != "")
        // //     inner += `<img src='./Image/Scenario_VoiceButton.png' onclick="playaudio('${d.voice}')"></img>`
        // inner += `</div></div></div>`

        let div = document.createElement("div");
        div.className = 'Log-item'

        let div2 = document.createElement("div");
        div2.className = 'dialogue'
        div.append(div2)

        let div3 = document.createElement("div");
        div3.className = `dialogue-icon ${d.heroineId.length > 1?`multiple-${d.heroineId.length}`:''}`
        div2.append(div3)

        Array.from(d.heroineId).forEach(i => {
            if(i != 0)
                div3.innerHTML += `<img src="./Image/CharIcon/CharaIcon_${i.toString().padStart(2, '0')}.png"/>`
        })

        let div4 = document.createElement("div");
        div4.className = 'dialogue-name'
        div2.append(div4)

        let input = document.createElement("input");
        input.type = 'text'
        input.className = `editor-name ${edit_lan == 'zh'?'zh-font-bold':'jp-font-bold'}`
        input.value = `${d.name[language]}`
        if(edit_lan == '') {
            input.disabled = true
        }
        input.onchange = () => {
            editNameContent(d.index, input.value)
        }
        div4.append(input)

        let textarea = document.createElement("textarea");
        if(edit_lan == '') {
            textarea.disabled = true
        }

        textarea.className = `dialogue-meg editor-meg ${edit_lan == 'zh'?'zh-font':'jp-font'}`
        textarea.innerHTML = `${d.message[language]}`
        textarea.onchange = () => {
            editLogContent(d.index, textarea.value)
        }
        div2.append(textarea)

        logItemList.append(div)

    })

    // logItemList.innerHTML = inner
}

const previewStoryLog = (language) => {

    if(language === '') {
        language = 'default'
    }

    var logItemList = document.getElementById('log-item-list')
    var inner = ``
    edit_Story.Dialogue?.map(d => {
        inner += `<div class='Log-item'>`
        inner += `<div class='dialogue'>`
        inner += `<div class='dialogue-icon ${d.heroineId.length > 1?`multiple-${d.heroineId.length}`:''}'>` 
        Array.from(d.heroineId).forEach(i => {
            if(i != 0)
                inner += `<img src="./Image/CharIcon/CharaIcon_${i.toString().padStart(2, '0')}.png"/>`
        })
        inner += `</div>`
        inner += `<div class='dialogue-name jp-font-bold'>${d.name[language]}</div>`
        inner += `<div class='dialogue-meg ${language == 'zh'?'zh-font':'jp-font'}'>${d.message[language]}</div>`
        inner += `<div class='dialogue-voice'>`
        if(d.voice != "")
            inner += `<img src='./Image/Scenario_VoiceButton.png' onclick="playaudio('${d.voice}')"></img>`
        inner += `</div></div></div>`
    })
    logItemList.innerHTML = inner
}

const preview = () => {
    console.log('preview')
    let btn = document.getElementById('editor-preview-btn')
    isPreview = !isPreview
    if(isPreview){
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-edit" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"></path>
                            <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z"></path>
                            <path d="M16 5l3 3"></path>
                        </svg><div>Edit</div>`
        previewStoryLog(edit_lan)
        // if(edit_lan != '') {
        //     saveEditToLoacl()
        // }
    }else {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        <div>preview</div>`
        genEditorStoryLog(edit_Story, edit_lan)
    }

}

const saveEditToLoacl = () => {
    console.log('save')

    beforeSave()

    if(!record) {
        record = {}
    }

    record[edit_Story.Txt_Name] = {"Title": savetitle, "Record" : edit_Story}
    console.log(record)
    localStorage.setItem(StorgeKey, JSON.stringify(record))

    updateRecord()
}

const downloadJSON = () => {

    beforeSave()
    //remove

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(edit_Story, null, 4));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", edit_Story.Txt_Name + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

const beforeSave = () =>{

    if(edit_lan == ''){
        return
    }

    if(!edit_Story.Language){
        edit_Story.Language = []
        edit_Story.Language.push(edit_lan)
    }else{
        if(!edit_Story.Language.includes(edit_lan)){
            edit_Story.Language.push(edit_lan)
        }
    }

    if(!edit_Story.Translator) {
        edit_Story.Translator = {}   
    }

    let translatorInput = document.getElementById("translator")
    edit_Story.Translator[edit_lan] = translatorInput.value
}

const playaudio = (path) => {

    if (!voicePlayer.paused){
        voicePlayer.pause()
    }

    voicePlayer.src = `${resource_path}/voice/${path}`
    voicePlayer.play()
}

const editNameContent = (index, content) => {
    if((edit_lan === '' || edit_lan === 'default') && !edit_lan) {
        return
    }

    //edit
    edit_Story.Dialogue.forEach(d => {
        if(d.index === index) {
            d.name[edit_lan] = content
        }
    });
}

const editLogContent = (index, content) => {
    if((edit_lan === '' || edit_lan === 'default') && !edit_lan) {
        return
    }

    //edit
    edit_Story.Dialogue.forEach(d => {
        if(d.index === index) {
            d.message[edit_lan] = content
        }
    });
}


loadAllJson()

var option = document.getElementById("editor-option")
option.onchange = (e) => {
    // console.log(e.target.value)
    edit_lan = e.target.value

    if (edit_Story["Language"]) {
        let translatorInput = document.getElementById("translator")
        if(edit_Story.Translator[edit_lan]) {
            translatorInput.value = edit_Story.Translator[edit_lan]
        }else {
            translatorInput.value = ''
        }

        let lan = edit_Story["Language"]
        lan.map((x)=>{
            if (x == e.target.value) {
                return genEditorStoryLog(edit_Story, e.target.value)
            }
        })

    }

    edit_Story.Dialogue.map((d)=>{
        if(!d.name[edit_lan]) {
            d.name[edit_lan] = d.name.default
        }

        if(!d.message[edit_lan]) {
            d.message[edit_lan] = d.message.default
        }
    })

    genEditorStoryLog(edit_Story, e.target.value)
    
}

