var params = new URLSearchParams(window.location.search)
var story_type = params.get('type')
var story_id = params.get('id')
var phase = params.get('phase')

var StoryMaster = {}
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
            
            let prev = storylist.scenarios.find(x => x.story_id == story_id && x.phase == (+phase-1))
            let next = storylist.scenarios.find(x => x.story_id == story_id && x.phase == (+phase+1))
        
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
                inner += `<div class='dialogue-name'>${d.name}</div>`
                inner += `<div class='dialogue-meg'>${d.message}</div>`
                inner += `<div class='dialogue-voice'>`
                if(d.voice != "")
                    inner += `<img src='./Image/Scenario_VoiceButton.png' onclick="playaudio('${d.voice}')"></img>`
                inner += `</div></div></div>`
            })
            logItemList.innerHTML += inner

        }).catch(function(error) {
            console.log(error);
        });

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


const playaudio = (path) => {

    if (!voicePlayer.paused){
        voicePlayer.pause()
    }

    voicePlayer.src = `./voice/${path}`
    voicePlayer.play()
}


const Hello = (text) => {
    console.log(text)
}

loadAllJson()
