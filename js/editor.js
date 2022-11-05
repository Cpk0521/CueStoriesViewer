var params = new URLSearchParams(window.location.search)
var story_type = params.get('type')
var story_id = params.get('id')
var phase = params.get('phase')

var EditStory = {}
var localStorge = window.localStorage

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
            genEditorStoryLog(curr)

        }).catch(function(error) {
            console.log(error);
        });
}


const genEditorStoryLog = (curr) => {
    var logtitle = document.getElementById('log-title')
    logtitle.innerText = curr.title
    document.title = `${curr.title} | Editor Mode`

    var logItemList = document.getElementById('log-item-list')

    fetch(`./scenario/${curr.path}`)
        .then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        })
        .then(response => response.json())
        .then(json => {

            EditStory = json

            var inner = ``
            json.Dialogue?.map(d => {
                inner += `<div class='Log-item'>`
                inner += `<div class='dialogue'>`
                inner += `<div class='dialogue-icon ${d.heroineId.length > 1?`multiple-${d.heroineId.length}`:''}'>` 
                Array.from(d.heroineId).forEach(i => {
                    if(i != 0)
                        inner += `<img src="./Image/CharIcon/CharaIcon_${i.toString().padStart(2, '0')}.png"/>`
                })
                inner += `</div>`
                inner += `<div class='dialogue-name'><input type="text" class="editor-name" value="${d.name}"/></div>`
                inner += `<textarea class='dialogue-meg editor-meg'>${d.message}</textarea>`
                inner += `<div class='dialogue-voice'>`
                // if(d.voice != "")
                //     inner += `<img src='./Image/Scenario_VoiceButton.png' onclick="playaudio('${d.voice}')"></img>`
                inner += `</div></div></div>`
            })
            logItemList.innerHTML += inner

        }).catch(function(error) {
            console.log(error);
        });

}

const previewStoryLog = () => {

}

const preview = () => {
    console.log('preview')
}

const saveEditToLoacl = () => {
    console.log('save')
}

const downloadJSON = () => {
    console.log('download')

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(EditStory));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", EditStory.Txt_Name + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}



loadAllJson()