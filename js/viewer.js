var params = new URLSearchParams(window.location.search)
var story_type = params.get('type')
var story_id = params.get('id')
var phase = params.get('phase')

var resource_path = 'https://raw.githubusercontent.com/Cpk0521/CueStoryResource/main'

var Story = {}
var language_list = {"zh":"中文", "eng":"English"}
var voicePlayer = new Audio()

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
            
            let prev, next
            
            if(story_type == "Lesson") {
                prev = storylist.scenarios.find(x => x.story_id == (+story_id-1) && x.phase == (+phase-1))
                next = storylist.scenarios.find(x => x.story_id == (+story_id+1) && x.phase == (+phase+1))
            }else {
                prev = storylist.scenarios.find(x => x.story_id == story_id && x.phase == (+phase-1))
                next = storylist.scenarios.find(x => x.story_id == story_id && x.phase == (+phase+1))
            }

            genStory(curr)
            genFooter(prev, next, story_type)

        }).catch(function(error) {
            console.log(error);
        });
}

const genStory = (curr) => {
    var logtitle = document.getElementById('log-title')
    logtitle.innerHTML = curr.title
    document.title = `${curr.title} | Stories Archive Viewer`

    fetch(`${resource_path}/scenario/${curr.path}`)
        .then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        })
        .then(response => response.json())
        .then(json => {

            Story = json
            genStoryLog(json)

            if (json.Language && json.Language.length != 0) {
                genLangOption(json.Language)
            }

        }).catch(function(error) {
            console.log(error);
        });

}


const genStoryLog = (story, language = 'default') => {

    if(language != 'default') {
        if(!story.Language?.includes(language)) {
            return
        }
    }

    var logItemList = document.getElementById('log-item-list')
    var inner = ``
    story.Logs?.map(d => {

        if(d.Type == 0) {

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
        }
        
        if (d.Type == 1) {
            inner += `<div class='Log-item'>`
            inner += `<div class='dialogue2'>`
            inner += `<div class='dialogue-meg ${language == 'zh'?'zh-font':'jp-font'}'>${d.message[language]}</div>`
            inner += `</div></div></div>`
        }
    })
    logItemList.innerHTML = inner
}

const genLangOption = (list) => {
    let info = document.getElementById('lang-info')
    info.style.display = 'block' 
    let langList = document.getElementById('lang-list')

    let def_btn = document.createElement('button')
    def_btn.className = 'lang-btn jp-font-bold'
    def_btn.innerHTML = '日本語'
    def_btn.onclick = ()=>{
        genStoryLog(Story, 'default')
        showTanslator('default')
    }
    langList.append(def_btn)


    list.map((l)=>{
        if (l in language_list) {
            let btn = document.createElement('button')
            btn.className = 'lang-btn jp-font-bold'
            btn.innerHTML = language_list[l]
            btn.onclick = ()=>{
                genStoryLog(Story, l)
                showTanslator(l)
            }
            langList.append(btn)
        }
    })
    
}

const genFooter = (prev, next, story_type) => {
    var logtitle = document.getElementById('log-footer')

    var inner = '';
    if (prev)
        inner += `<div class="prev"><a href="./viewer.html?type=${story_type}&id=${prev.story_id}&phase=${prev.phase}">前の回</a></div>`
    inner += `<div class="main"><a href="./index.html#${story_type}">戻る</a></div>`
    if (next)
        inner += `<div class="next"><a href="./viewer.html?type=${story_type}&id=${next.story_id}&phase=${next.phase}">次の回</a></div>`

    logtitle.innerHTML = inner
}

const showTanslator = (lang)=>{
    let info = document.getElementById('translator-info')
    let translator = document.getElementById('translator')
    if (lang == 'default'){
        info.style.display = 'none'
        translator.innerHTML = ''
    }else{
        info.style.display = 'block'        
        translator.innerHTML = Story['Translator'][lang]
    }

}


const playaudio = (path) => {

    if (!voicePlayer.paused){
        voicePlayer.pause()
    }

    voicePlayer.src = `${resource_path}/voice/${path}`
    voicePlayer.play()
}


const Hello = (text) => {
    console.log(text)
}

loadAllJson()

// document.addEventListener("keydown", function(event) {
//     if (event.key == 'e' || event.key == 'E') {
//         window.open(`./editor.html?type=${story_type}&id=${story_id}&phase=${phase}`,'_blank');
//     }
// });

