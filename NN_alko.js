//==================================================================
// OBSŁUGA PICIA - Autor Godfryd
//==================================================================
// Przystosowanie do NI - Kris Aphalon

nerthus.alko = {}

nerthus.alko.lvl = 0  //stanupojenia alkoholowego 0 trzeźwy 100 urwany film.

nerthus.alko.timer = null

nerthus.alko.run = function()
{
    this.lvl = 0
    if (NerthusAddonUtils.storage() && NerthusAddonUtils.storage().nerthus_alko)
        this.lvl = parseInt(NerthusAddonUtils.storage().nerthus_alko)
    if (this.lvl)
        this.timer = setInterval(this.timer_handler.bind(this), 10000)
}

nerthus.alko.timer_handler = function()
{
    this.lvl--
    if(NerthusAddonUtils.storage())
        NerthusAddonUtils.storage().nerthus_alko = this.lvl
    if (this.lvl < 1)
    {
        this.lvl = 0
        clearInterval(this.timer)
        this.timer = null
    }
}

nerthus.alko.shuffleArray = function(array, cc)
{
    var przestanek = 0
    if(typeof cc == 'undefined' ) cc = 0
    if([".",",","?","!"].lastIndexOf(array[array.length-1]) > -1) przestanek = 1
    for (var i = array.length - 1 - cc - przestanek; i > (0 + cc); i--)
    {
        var j = Math.floor(Math.random() * (i + 1 - cc) + cc)
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

nerthus.alko.shuffleMessage = function(msg)
{

    if(["*/@"].indexOf(msg[0]) >= 0 || (this.lvl <= 0))
        return msg

    let t = []
    switch (Math.floor(this.lvl/10))
    {
        case 10:
        case 9: msg = "/me bełkota coś niezrozumiale."
            break
        case 8:
            msg = this.shuffleArray(msg.split(" ")).join(" ")
        case 7:
            t = msg.split(", ")
            for (const index in t)
                t[index]=this.shuffleArray(t[index].split(" ")).join(" ")
            msg = t.join(", ")
        case 6:
            t = msg.split(", ")
            for (const index in t)
                t[index]=this.shuffleArray(t[index].split(" "),1).join(" ")
            msg = t.join(", ");
        case 5:
            t = msg.split(" ")
            for (const index in t)
                if (t[index].length > 4)
                    t[index]=this.shuffleArray(t[index].split("")).join("")
            msg = t.join(" ")
        case 4:
            t = msg.split(" ")
            for (const index in t)
                if (t[index].length > 5)
                    t[index]=this.shuffleArray(t[index].split("")).join("")
            msg = t.join(" ")
        case 3:
            t = msg.split(" ")
            for (const index in t)
                if (t[index].length > 4)
                    t[index]=this.shuffleArray(t[index].split(""),1).join("")
            msg = t.join(" ")
        case 2:
            t = msg.split(" ");
            for (const index in t)
                if (t[index].length > 5)
                    t[index]=this.shuffleArray(t[index].split(""),1).join("")
            msg = t.join(" ");
        case 1:
            msg = msg.replace(/\.|\,|\:|\?|\!|\-/g," *hik*")
        case 0:
            msg = msg.replace(/\.|\,|\:|\?|\!|\-/g,"")
    }
    return msg
}

nerthus.alko.drink = function (c, d)
{
    // jeżli użyjemy towaru konsumpcyjnego o wymaganiach levelowych 18 to dodaje nam 10% upojenia alkoholowego
    var match = c.match(/^moveitem.*id=(\d+)/)
    if (match)
    {
        const item = g.item[match[1]]
        if (item && (item.cl === 16))
            if (item.stat.search("lvl=") > -1)
                if (parseInt(item.stat.match(/lvl=([0-9]+)/)[1]) === 18)
                {
                    this.lvl += 10
                    if (this.lvl > 100)
                        this.lvl = 100
                    if (!this.timer)
                        this.timer = setInterval(this.timer_handler.bind(this), 10000)
                }
    }
}

nerthus.alko.drink_ni = function (command)
{
    // jeżli użyjemy towaru konsumpcyjnego o wymaganiach levelowych 18 to dodaje nam 10% upojenia alkoholowego
    let match = command.match(/^moveitem.*id=(\d+)/)
    if (match)
    {

        const item = Engine.items.getItemById(match[1])
        if (item && (item.cl === 16)) //16 - konsumpcyjne
            if (item.stat.search("lvl=") > -1)
                if (parseInt(item.stat.match(/lvl=([0-9]+)/)[1]) === 18)
                {
                    this.lvl += 10
                    if (this.lvl > 100)
                        this.lvl = 100
                    if (!this.timer)
                        this.timer = setInterval(this.timer_handler.bind(this), 10000)
                }
    }
}

nerthus.alko.initiateHandlers_ni = function ()
{
    let initSendButton = $._data(document.querySelector(".section.chat-tpl .send-btn.right"), "events").click[0].handler
    $._data(document.querySelector(".section.chat-tpl .send-btn.right"), "events").click[0].handler = function ()
    {
        let $input = $(".section.chat-tpl .input-wrapper input")
        $input.val(nerthus.alko.shuffleMessage($input.val()))
        initSendButton()
    }
    $._data(document.querySelector(".section.chat-tpl .input-wrapper input"), "events").keypress[0].handler = function (e)
    {
        if (e.key === "Enter")
        {
            let $input = $(".section.chat-tpl .input-wrapper input")
            $input.val(nerthus.alko.shuffleMessage($input.val()))
            initSendButton()
        }
    }
}


nerthus.alko.start = function ()
{
    const _nerthg = _g
    _g = function (c, d)
    {
        nerthus.alko.drink(c, d)
        _nerthg(c, d)
    }
    const _chatSendMsg = chatSendMsg
    window.chatSendMsg = function (msg)
    {
        _chatSendMsg(nerthus.alko.shuffleMessage(msg))
    }

    nerthus.defer(this.run.bind(this))
}

nerthus.alko.start_ni = function ()
{
    const _nerthg = _g
    window._g = function (c, d)
    {
        nerthus.alko.drink_ni(c, d)
        _nerthg(c, d)
    }
    nerthus.alko.initiateHandlers_ni()
}
