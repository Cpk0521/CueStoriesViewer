
var hash = location.hash.replace(/^#/, '');
var allJson;
var currType = ''

var storiesArea = document.getElementById("storylist")

var sp_menu = document.getElementById("sp_menu");
var sp_menu_open_icon = document.getElementById("sp_menu_open");
var sp_menu_close_icon = document.getElementById("sp_menu_close");
var is_sp = false
var isopen = false;
window.onresize = () => {
    if (screen.width > 1023) {
        is_sp = false
    }else {
        is_sp = true
    }

    if(!is_sp) {
        sp_menu.classList.remove('sp-on')
        sp_menu_open_icon.classList.add('sp-on')
        sp_menu_close_icon.classList.remove('sp-on')
        isopen = false
    }
}

const open_sp_menu = () => {
    if(isopen){
        sp_menu_close_icon.classList.remove('sp-on')
        sp_menu_open_icon.classList.add('sp-on')
        sp_menu.classList.remove('sp-on')
    }else{
        sp_menu_close_icon.classList.add('sp-on')
        sp_menu_open_icon.classList.remove('sp-on')
        sp_menu.classList.add('sp-on')
    }
    
    isopen = !isopen
}

var upToTopbtn = document.getElementById("upToTopBtn");
window.onscroll = () => {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        upToTopbtn.style.display = "flex";
      } else {
        upToTopbtn.style.display = "none";
      }
}

const topFunction = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}


const loadAllJson = async () => {
    await fetch('./json/All.json')
        .then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        })
        .then(response => response.json())
        .then(json => {
            allJson = json
            
            hash?hash:hash='Main'
            btnOnclick(hash)

        }).catch(function(error) {
            console.log('failed while loading index.json.');
        });
}

const btnOnclick = (type) => {

    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    if(isopen) {
        open_sp_menu()
    }

    const btntab = document.getElementsByClassName("filter-btn")
    Array.from(btntab).forEach(element => {
        element.classList.remove('btn-selecting'); 
    });
    
    const ele = document.getElementById(`${type}div`)
    ele.classList.add('btn-selecting')

    loadChapterFilter(type)
    loadStories(type)
}

const loadStories = (type, id = -2) => {

    if (type == currType && id == -2)
        return
    else
        currType = type

    let data = allJson[type]

    var inner = ''

    if (id > -1){
        data = data.filter(x => x.id == id)
    }

    data.map((d) => {
        inner += `<div class='storyBlock'>`
        inner += `<div class='storyBlock-contain'>`
        inner += `<div class='${type == 'Link'?'link-icon':''}'>`
        Array.from(d.image).forEach(img => {
            inner += `<img src='./Image/${img}'></img>`
        })
        inner += `</div>`
        inner += `<div class='story-chapter'>`
        Array.from(d.scenarios).forEach(episode => {
            inner += `<a href="./viewer.html?type=${type}&id=${episode.story_id}&phase=${episode.phase}">${episode.title}</a>`
        });
        inner += `</div></div></div>`
    })

    storiesArea.innerHTML = inner
}

const loadChapterFilter = (type) => {

    var chapterFilterlist = document.getElementById("chapterFilter-list")
    
    if(type == 'Link') {
        chapterFilterlist.style.display = 'none';
        return
    }

    chapterFilterlist.style.display = '';

    let data = allJson[type]

    var inner = `<button class="chapterFilter-all jp-font-bold" id='chaper-btn' onclick="loadStories('${type}', -1)">全部</button>`

    data.map((d)=>{
        Array.from(d.image).forEach(img => {
            inner += `<img id='chaper-btn' src='./Image/${img}' onclick="loadStories('${type}',${d.id})" ></img>`
        })
    })

    chapterFilterlist.innerHTML = inner

}

const log = (type, id) => {
    console.log(type, id)
}


loadAllJson()
