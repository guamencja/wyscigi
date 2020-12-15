let so;
let playerTrains = {};

let devMode = false; // zmiana na true będzie pokazywać wszystkie wiadomości z websocketa w konsoli

function s(name) {
    return document.querySelector(name);
};
function sA(name) {
    return document.querySelectorAll(name);
};


// funkcje: tworzenie gry i dołączanie

function gameJoin() {
    s("#join_prompt").style.display = "none";
    fetch("/api/join_room?room=" + s("#gameid_prompt").value).then(r => {
        r.json().then(j => {
            if(j.ok == true) {
                game();
            } else {
                s("#join_prompt").style.display = "block";
                alert(j.message);
            };
        })
    })
};

function gameCreate() {
    s("#join_prompt").style.display = "none";
    fetch("/api/create_room").then(r => {
        r.json().then(j => {
            s("#gameid_prompt").value = j["room_id"];
            game();
        })
    })
};

// skarpetka
function game() {
    s("#game").style.display = "block";
    let name = s("#name_prompt").value;
    let id = s("#gameid_prompt").value;

    so = new WebSocket('ws://'+ location.hostname +':171');
    so.addEventListener("open", () => {
        // mamy połączenie z webskarpetką, gg
        // wysyłamy tzw. "hello" - podstawowe informacje o graczu
        so.send(JSON.stringify({
            "type": "hello",
            "name": name,
            "join_id": id
        }))
    })
    so.addEventListener("error", function(err) {
        alert("wystąpił problem podczas połączenia.\nF");
        location.reload();
    })
    so.addEventListener("message", function(m) {
        let msg = JSON.parse(m.data);
        if(devMode == true) {
            console.log(msg);
        }

        // robimy coś z wiadomościami od serwera
        // każda z nich to JSON, ma wartości type i value
        switch(msg.type) {
            case "roomChat":
                // dostaliśmy wiadomość chat od serwera, wrzucamy ją do h3
                s("#game-chat").innerHTML += msg.value + "<br>";
                s("#game-chat").scrollTo(0, s("#game-chat").scrollHeight);
                break;
            case "chatClear":
                // czyszczenie czatu
                s("#game-chat").innerHTML = "";
                break;
            case "roomCode":
                // kod do zaproszenia
                s("#game p").innerHTML = "kod do zaproszenia: " + msg.value;
                break;
            case "hostNotif":
                // powiadomienie do hosta, które włącza mu przycisk start
                s("#host-panel").style.display = "block";
                break;
            case "alertMessage":
                // informacja dowolna, określona przez serwer
                alert(msg.value);
                break;
            case "roomStarted":
                // gra się zaczyna
                if(msg.value == true) {
                    s("#game-chat").innerHTML += "host zaczyna grę.<br>";
                    s("#game-chat").scrollTo(0, s("#game-chat").scrollHeight);
                    s("#host-panel").style.display = "none";
                }
                break;
            case "playerTrains":
                // bierzemy informacje o pociągach graczy
                s("#rails").innerHTML = "";
                playerTrains = msg.value;
                break;
            case "playerPositions":
                // dostajemy informacje gdzie są gracze i wizualizujemy je
                s("#rails").innerHTML = "";
                for(let i in msg.value) {
                    let rails = "<img src='/assets/tory.png' width='64' height='64'/>|".repeat(10).split("|");
                    rails[msg.value[i]] = "<img src='/assets/train" + playerTrains[i] + ".png' width='64' height='64'/>";
                    rails = rails.join("");
                    rails = "<div id='rail'>" + "<p id='playername'>" + i + "</p>" + rails + "</div>";
                    s("#rails").innerHTML += rails;
                }
                break;
        }
    })
};

function hoststart() {
    so.send(JSON.stringify({
        "type": "host_start"
    }));
}
