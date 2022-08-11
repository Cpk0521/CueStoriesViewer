
var hash = location.hash.replace(/^#/, '');
var allJson;
var currType = ''

var storiesArea = document.getElementById("storylist")

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

    const btntab = document.getElementsByClassName("filter-btn")
    Array.from(btntab).forEach(element => {
        element.classList.remove('btn-selecting'); 
    });
    
    const ele = document.getElementById(`${type}div`)
    ele.classList.add('btn-selecting')

    loadStories(type)
}

const loadStories = (type) => {

    if (type == currType)
        return
    else
        currType = type

    let data = allJson[type]
    
    var inner = ''

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

loadAllJson()


var upToTopbtn = document.getElementById("upToTopBtn");
window.onscroll = () => {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        upToTopbtn.style.display = "block";
      } else {
        upToTopbtn.style.display = "none";
      }
}

const topFunction = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}