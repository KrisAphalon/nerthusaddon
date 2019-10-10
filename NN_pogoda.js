//pogoda dla nerthusa

if (typeof nerthus.weather === 'undefined')
    nerthus.weather = {id: null, change_timer: null}

nerthus.weather.set_weather = function (id)
{
    console.log("set weather with id: " + id)
  //  id = parseInt(id)
  //  if (0 > id || id > 20)
  //      id = this.calculate()
  //  this.id = id
  //  this.display()
  //  var spot = this.spot.fromId(id)
  //  $('#nWeather').css('background', 'url(' + nerthus.graf.weather + ') -' + spot.x * 55 + 'px -' + spot.y * 55 + 'px')
}

nerthus.weather.set_weather_ni = function (id)
{
    console.log("set weather with id: " + id)
   // id = parseInt(id)
  //  if (0 > id || id > 20)
 //       id = this.calculate()
 //   this.id = id
  //  this.display_ni()
  //  const spot = this.spot.fromId(id)
  //  $("#nWeatherStyle").text("#nWeather{background: url(" + nerthus.graf.weather + ") -" + spot.x * 55 + "px -" + spot.y * 55 + "px !important; background-color: transparent !important;}")
}

nerthus.weather.set_global_weather = function ()
{
    let weatherId = nerthus.weather.calculate()
    nerthus.weather.set_weather(weatherId)
    nerthus.weather.start_change_timer()
}

nerthus.weather.run = function ()
{
    //ikonka #1E90FF
    $('<div id="nWeather" style="z-Index:300; height:55px; width: 55px; opacity: 0.8; position: absolute; top: 0px; left: 0px;"></div>').appendTo('#centerbox2')
        .mouseenter(function ()
        {
            $("#nWeatherDesc").fadeIn(500).html(this.descriptions[this.id][Math.floor(Math.random() * this.descriptions[this.id].length)])
        }.bind(this))
        .mouseleave(function ()
        {
            $("#nWeatherDesc").fadeOut(500)
        })
    //pole opisowe
    $('<div id="nWeatherDesc" style="z-Index:300; width: 410px; opacity: 0.8; position: absolute; top: 5px; left: 60px; font: bold 14px Georgia; color:#F0F8FF"></div>').appendTo('#centerbox2')

    //workaround na pogode ustawianą przez bardów i zapisywanie nerthusa w pamięci
    if (typeof nerthus_weather_bard_id !== 'undefined')
        this.set_weather(nerthus_weather_bard_id)
    else
        this.set_global_weather()
}

nerthus.weather.run_ni = function ()
{
    //ikonka
    let left = $(".game-layer.layer.ui-droppable")[0].style.left
    $("<div id=\"nWeather\" class=\"mini-map\" style=\"z-Index:300; height:55px; width: 55px; opacity: 0.8; position: absolute; top: 55px; left:" + left + "; margin: 5px;pointer-events: auto;display:block\"></div>").appendTo(".layer.interface-layer")
        .mouseover(function ()
        {
            $("#nWeatherDesc").fadeIn(500).html(this.descriptions[this.id][Math.floor(Math.random() * this.descriptions[this.id].length)])
        }.bind(this))
        .mouseleave(function ()
        {
            $("#nWeatherDesc").fadeOut(500)
        })
    //pole opisowe
    $("<div id=\"nWeatherDesc\" style=\"z-Index:300; width: 410px; opacity: 0.8; position: absolute; top: 5px; left: 60px; font: bold 14px Georgia; color:#F0F8FF\"></div>").prependTo(".game-layer.layer.ui-droppable")

    //style for background which is overwritten by Engine
    $("head").append("<style id=\"nWeatherStyle\"></style>")

    //workaround na pogode ustawianą przez bardów i zapisywanie nerthusa w pamięci
    if (typeof nerthus_weather_bard_id === "undefined")
        this.set_global_weather()
    else
        this.set_weather(nerthus_weather_bard_id)
}

nerthus.weather.start_change_timer = function ()
{
    var hour = (Math.floor((new Date().getUTCHours()) / 4) + 1) * 4
    var date = new Date()
    date.setUTCHours(hour, 0, 0)
    var interval = date - new Date()
    this.change_timer = setTimeout(this.set_global_weather.bind(this), interval)
}

nerthus.weather.spot = {}
nerthus.weather.spot.x = {SUN: 0, CLOUD: 1, MOON: 2}
nerthus.weather.spot.y = {CLEAR: 0, CLOUD: 1, HEAVY_CLOUD: 2, RAIN: 3, HEAVY_RAIN: 4, SNOW: 5, HEAVY_SNOW: 6}

nerthus.weather.Climate = function (id, temperatureSpring, temperatureSummer, temperatureAutumn, temperatureWinter, humidityChange)
{
    this.temperature = [
        temperatureSpring,
        temperatureSummer,
        temperatureAutumn,
        temperatureWinter
    ]


    this.calculateDiff = function (month, type)
    {
        switch (month)
        {
            case 0:
                return type[3]
            case 1:
                return type[3] * 2 / 3 + type[0] * 1 / 3
            case 2:
                return type[3] * 1 / 3 + type[0] * 2 / 3
            case 3:
                return type[0]
            case 4:
                return type[0] * 2 / 3 + type[1] * 1 / 3
            case 5:
                return type[0] * 1 / 3 + type[1] * 2 / 3
            case 6:
                return type[1]
            case 7:
                return type[1] * 2 / 3 + type[2] * 1 / 3
            case 8:
                return type[1] * 1 / 3 + type[2] * 2 / 3
            case 9:
                return type[2]
            case 10:
                return type[2] * 2 / 3 + type[3] * 1 / 3
            case 11:
                return type[2] * 1 / 3 + type[3] * 2 / 3
        }
    }

    this.getCurrentTemperature = function ()
    {
        const date = new Date()
        const hour = Math.floor((date.getUTCHours()) / 4) + 1
        const day = date.getUTCDate()
        const month = date.getUTCMonth()
        return nerthus.weather.calculate_global_temperature(month, day, hour) + this.calculateDiff(month, this.temperature)
    }

    this.getCurrentRain = function ()
    {
        const date = new Date()
        return Math.max(nerthus.weather.calculate_global_rain(date) + humidityChange, 0)
    }

    this.getThunderstorm = function ()
    {
        const date = new Date()
        return nerthus.weather.checkThunderstorm(date, id)
    }

}

nerthus.weather.calculate_global_temperature = function (month, day, hour)
{
    // f(x) = 15 * Math.sin(0.52 * x - 1.5) + 9 is a graph that resembles average temperature graph in poland
    // https://en.climate-data.org/north-america/united-states-of-america/ohio/poland-137445/#climate-graph
    const x = month + (day / 31) //minor difference in 28 day month probably not noticeable
    const day_temperature = 15 * Math.sin(0.52 * x - 1.5) + 9
    // 7 w dół i w górę
    const hour_temperature_change = (nerthus.pseudoRandom(hour * day) * 14) - 7
  //  console.log(hour_temperature_change)
   // console.log(day_temperature + hour_temperature_change)
    return day_temperature + hour_temperature_change
}

nerthus.weather.calculate_global_rain = function (date)
{
    const NOISE = new this.Simple1DNoise()

    const pointInTime = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 3600000

    const value = NOISE.getVal(pointInTime)
  //  console.log(value)
    return value
}

nerthus.weather.calculate = function ()
{

}
nerthus.weather.descriptions = {}
nerthus.weather.descriptions.old =
    [
        [ //1. [słońce]
            "Promienie słońca intensywnie rozświetlają horyzont. Czyste, błękitne niebo koi oczy, odrywa od szarej rzeczywistości.",
            "Słońce zawieszone na bezchmurnym niebie świeci niezwykle jasno.",
            "Po bezchmurnym niebie wędruje słońce, otulając wszystkich swoimi ciepłymi promieniami."
        ],

        [ //2. [słońce z małą białą chmurką po lewej stronie]
            "Słońce pięknie świeci, po niebie wędrują małe obłoczki, rzucające na ziemię swe cienie. Słaby wiatr orzeźwia wędrowców.",
            "Na niebie niewielka ilość chmurek. Promienie słoneczne bez trudu przebijają się przez nie, a cienie majestatycznie przesuwają się po ziemi.",
            "Słońce, otuliwszy się pojedynczymi chmurkami, wypuszcza na świat swoje promienie, obdarzając go przyjemnym ciepłem."
        ],

        [ //3. [słońce z białą chmurą po prawej stronie]
            "Słońce skryło się pod pierzyną białych chmur, przez którą tu i ówdzie przebijają się jasne promyki. Delikatny wiatr szeleści liśćmi.",
            "Duże, przejrzyste chmury przesuwają się leniwie po sklepieniu. Promienie słoneczne przebijają się przez obłoki. ",
            "Złociste promienie słońca przebijają się przez śnieżnobiałe chmury. Przyjemny wiatr roznosi cudowny zapach kwiatów."
        ],

        [ //4. [słońce zasłonięte chmurą, słaby deszcz]
            "Słońce częściowo skryło się za chmurami, które swoją szarością pokryły błękit nieba. Krople deszczu ociężale spadają na ziemię.",
            "Słońce jest ledwie widoczne zza ciężkich, deszczowych chmur. Z nieba cieknie słaby deszcz.",
            "Szare, deszczowe chmury starają się zasłonić słońce. Drobne krople deszczu rozpryskują się, opadając na zielone liście drzew."
        ],

        [ //5. [słońce zasłonięte chmurą, błyskawica i mocny deszcz]
            "Z nieba, jak szalone, spadają kolejne krople deszczu. Niebo przeszyła jasna smuga światła, której towarzyszył potężny grzmot.",
            "Ciężkie burzowe chmury spowijają niebo. Dojrzenie słońca przez gęsto padający deszcz i chmury graniczy niemal z cudem.",
            "Słońce usilnie stara się przebić przez gęste, burzowe chmury. Woda deszczowa w rynnach i beczkach się już przelewa, z oddali słychać serię grzmotów."
        ],

        [ //6. [słońce zasłonięte chmurą, deszcz ze śniegiem]
            "Przez szare chmury dostrzec można jeszcze promyki słońca. Kolejnym kroplom deszczu towarzyszy śnieg. Wiatr wesoło kołysze gałęźmi drzew.",
            "Spore zachmurzenie, rzęsiście padający deszcz, mieszający się z płatkami śniegu. Miasto oświetlane przez promienie słońca wygląda przepięknie...",
            "Z szarych chmur zakrywających niebo wydobywa się deszcz ze śniegiem. Powietrze jest bardzo zimne, a wiatr porywisty."
        ],

        [ //.7. [słońce zasłonięte chmurą, śnieg]
            "Mimo kilku promyków słońca, nie jest łatwo odczuć ciepło. Śnieg sypiący z nieba przykrywa doliny i miasta warstwą puchu.",
            "Zamieć śnieżna pokrywa świat białym puchem. Mimo świecącego słońca, panuje mróz, wieją bardzo silne wiatry. Dzikie szlaki i ulice miast opustoszały.",
            "Lekkie chmurki gęsto ścielą niebo. Promienie słoneczne przebijają się przez nie, oświetlając padający w dużej ilości śnieg."
        ],

        [ //8. [biała chmura]
            "Białe chmury pokrywają niebo. Wieje spokojny wiatr porywający opadłe listki drzew. Mimo braku słońca jest dość ciepło.",
            "Błękitne niebo przyozdobiła chmara białych kłębków. Wiatr wesoło hula wśród liści i gałęzi drzew.",
            "Na niebie brak słońca. Jedynie niewielkie chmurki szybko przemierzają sklepienie."
        ],

        [ //9. [chmura, słaby deszcz]
            "Niebo nad krainą zrobiło się szare. Z ciemnych chmur zaczął padać deszcz, a wszelaka zwierzyna schroniła się w jaskiniach, zaś ludzie ukryli się swych domostwach.",
            "Z pozornie małych chmurek wesoło spadają ku ziemi kropelki wody. Wiatr porywa do tańca zarówno liście drzew jak i włosy, kapelusze, płaszcze oraz kaptury podróżników.",
            "Lekkie zachmurzenie. Słońce chowa się już za horyzontem. Deszcz siąpi z nieba."
        ],

        [ //10. [chmura, mocny deszcz]
            "Istne oberwanie chmury. Szary, gęsty puch staje się przyczyną ulewnego deszczu. Porywisty wiatr kołysze drzewami.",
            "Niebem zawładnęła szarość. Z większych i mniejszych chmur pędzą ku ziemi kolejne deszczowe krople.",
            "Ciężkie chmury deszczowe. Z nieba gęsto spadają duże krople wody."
        ],

        [ //11. [chmura burzowa]
            "Rozpętała się prawdziwa burza. Z nieba seriami spadają strugi deszczu, horyzont rozświetlają błyskawice, a opadające krople zagłuszają grzmoty.",
            "Coraz większa ilość chmur przypływa ze wschodu krainy. Ociężałe krople spadają na ziemię. Niebo przeszyła błyskawica, a grzmot jej towarzyszący, rozległ się po całej okolicy.",
            "Burzowe chmury, w oddali słychać grzmoty, niebo rozświetlają błyskawice. Życie mieszkańcom utrudnia ponadto ciężki deszcz i silny wiatr."
        ],

        [ //12. [chmura, deszcz ze śniegiem]
            "Z ciemnych chmur pada ulewny deszcz, któremu towarzyszą nieliczne płatki śniegu. Biały puch topnieje jeszcze przed opadnięciem na ziemię.",
            "Z ciemnych chmur powoli opadają ku ziemi kolejne krople deszczu i płatki śniegu. Wiatr ugina drzewa, a te jakby składają pokłony, chyląc się aż do ziemi.",
            "Wielkie, ciemne chmury zaścielają gęsto sklepienie. Z nieba leje się potężny deszcz, a gdzieniegdzie można dostrzec opadające płatki śniegu."
        ],

        [ //13. [chmura śnieżna]
            "Powietrze staje się bardzo zimne, woda w kałużach zamarza. Obfite opady śniegu znacznie zmniejszają pole widzenia.",
            "Białe, pierzaste chmurki suną po niebie. Płatki śniegu wesoło wirują na wietrze, opadając powoli na ziemię.",
            "Lekko zachmurzone niebo. Słońce już niedługo schowa się za horyzontem. Z nieba gęsto spadają białe płatki śniegu."
        ],

        [ //14. [chmura śnieżna z piorunem]
            "Burza śnieżna znęca się nad miejscową fauną i florą. Mróz, śnieg i pioruny zniechęcają ludzi do opuszczania swych ciepłych, bezpiecznych domów.",
            "Z ciemnych chmur wariacko suną ku ziemi płatki śniegu. Jasna błyskawica od czasu do czasu przeszywa niebo. Wiatr pędzi jak szalony, choć sam nie wie dokąd. Grzmoty słychać w najgłębszych zakątkach krainy.",
            "Ciężkie i ciemne chmury. W oddali słychać potężne grzmoty, którym towarzyszą oślepiające błyski. Brak jednak deszczu, jedynie gęsto sypiący śnieg daje się we znaki."
        ],

        [ //15. [księżyc]
            "Nastała ciepła, bezwietrzna noc. Księżyc świeci jasno, a na czystym niebie ukazują się tysiące gwiazd.",
            "Księżyc tej nocy postanowił pokazać swe lico. Towarzyszące mu gwiazdy iskrzą wesoło na bezchmurnym niebie.",
            "Bezchmurne, gwieździste niebo. Wysoko zawieszony księżyc jasno oświetla całą krainę."
        ],

        [ //16. [księżyc z małą, białą chmurką]
            "Księżyc co jakiś czas ukrywa się za małymi, białymi chmurami, rozświetlając je. Wieje łagodny wiatr, który nikomu nie jest w stanie przerwać snu.",
            "Księżyc nieśmiało wygląda zza chmurki. Ciemne niebo tu i ówdzie przyozdabiają jasne gwiazdy.",
            "Niewielkie zachmurzenie. Księżyc jasno świeci z góry. W tle doskonale są widoczne, przy słabym zachmurzeniu, gwiazdy."
        ],

        [ //17. [księżyc z białą chmurą]
            "Niebo nawiedziły jasne chmury, za którymi sprytnie schował się księżyc i większość gwiazd. Wiatr cicho zawodzi w najskrytszych zakątkach krainy.",
            "Duże, jasne chmury, przez które światło księżyca przebija się bez problemu, nie pozwalają dojrzeć gwiazd.",
            "Mimo przelotnych wiatrów, noc jest pogodna. Chmury skutecznie zakrywają księżyc i wszystkie gwiazdy."
        ],

        [ //18. [księżyc, słaby deszcz]
            "Chmury zakrywają księżyc. Mocny wiatr kołysze drzewami i rzuca liśćmi. Krople deszczu bezwładnie opadają na ziemię.",
            "Księżyc, podobnie jak gwiazdy, schował się pod pierzyną ciemnych chmur, z których spadają ku ziemi krople deszczu.",
            "Spore zachmurzenie. Księżyc prawie niewidoczny, acz jego światło przebija się przez chmury. Siąpi deszcz."
        ],

        [ //19. [księżyc, mocny deszcz i piorun]
            "Nastała burzliwa noc. Pioruny, szum wiatru i rozbijające się o okna oraz dachy krople, mało komu pozwalają zasnąć.",
            "Ciemne chmury skryły granat nieba. Również księżyc i gwiazdy zawieruszyły się gdzieś wśród szarości. Błyskawice przyszywające niebo niosą ze sobą kolejne grzmoty i coraz większe krople deszczu.",
            "Ciężkie burzowe chmury wyglądają przerażająco. Ani śladu księżyca, pada za to gęsty deszcz."
        ],

        [ //20. [księżyc, deszcz ze śniegiem]
            "Z pozornie małych chmurek spadają ku ziemi krople deszczu i śniegu. Księżyc wygląda zza przepływających białych chmur. Wiatr wesoło tańczy wśród gałęzi drzew.",
            "Słabe zachmurzenie. Księżyc jest doskonale widoczny, gwiazdy zaś tylko w niektórych momentach. Niewielkie opady śniegu i deszczu.",
            "Noc jest bardzo chłodna, pada ulewny deszcz ze śniegiem, tworząc wielkie kałuże."
        ],

        [ //21. [księżyc, śnieg]
            "Zamieć śnieżna i mróz towarzyszą tej nocy. Wieje bardzo silny wiatr, a biały puch pokrywa całą krainę.",
            "Księżyc, otuliwszy się pierzynką chmur, skrył się wraz z gwiazdami. Płatki śniegu wesoło tańczą na wietrze, kolejno opadając na ziemię.",
            "Duże ilości niewielkich, jasnych chmurek. Gwiazdy na przemian pojawiają się i znikają, a z nieba gęsto sypie śnieg."
        ]

    ]

nerthus.weather.display = function ()
{
    nerthus.worldEdit.clearWeather()
    if (map.mainid === 0 && map.id !== 3459 && map.id !== 3969) //are we outside? + Mirvenis + Szkoła w Ithan
        this.effects.display(this.id)
}

nerthus.weather.display_ni = function ()
{
    nerthus.worldEdit.clearWeather()
    if (Engine.map.d.mainid === 0 && Engine.map.d.id !== 3459 && Engine.map.d.id !== 3969) //are we outside? + Mirvenis + Szkoła w Ithan
        this.effects.display(this.id)
}

nerthus.weather.effects = {}

nerthus.weather.effects.display = function (id)
{
    if (this.is_raining(id))
        nerthus.worldEdit.displayWeatherEffect("rain", 0.7)
    if (this.is_heavy_raining(id))
        nerthus.worldEdit.displayWeatherEffect("rain", 1)
    if (this.is_snowing(id))
        nerthus.worldEdit.displayWeatherEffect("snow", 1)
}

nerthus.weather.effects.is_raining = function (id)
{
    return [3, 8, 17].indexOf(id) > -1
}

nerthus.weather.effects.is_heavy_raining = function (id)
{
    return [4, 5, 9, 10, 11, 18, 19].indexOf(id) > -1
}

nerthus.weather.effects.is_snowing = function (id)
{
    return [5, 6, 11, 12, 13, 19, 20].indexOf(id) > -1
}



nerthus.weather.effects.display_url_ni = function (url, opacity)
{
    $("<div class='nWeather'/>")
        .css({
            width: "100%",
            height: "100%",
            backgroundImage: "url(" + url + ")",
            zIndex: 200,
            position: "absolute",
            top: "0",
            left: "0",
            pointerEvents: "none",
            opacity: opacity ? opacity : 1
        })
        .appendTo(".game-layer.layer.ui-droppable")
}

nerthus.weather.clouds = {}
nerthus.weather.clouds.createTranslate = function (width)
{
    const css = `
    .cloudContainer {
      animation-direction: alternate;
      animation-timing-function: linear;
      animation-name: cloudAnimation;
      animation-iteration-count:  infinite;

      position: absolute;
      z-index: 2000;
      pointer-events: none;
    }

    .cloudContainer .lightning {
        position: absolute;
        top: 90%;
        left: 45%;
    }

    @keyframes cloudAnimation {
      0% {
        transform: translateX(-250px);
      }
      100% {
        transform: translateX(${width}px);
      }
    }
    `
    const style = document.createElement('style')
    style.appendChild(document.createTextNode(css))
    document.head.appendChild(style)
}


nerthus.weather.clouds.lightningSrc = " data:image/gif;base64,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"

nerthus.weather.clouds.createCloud = function(i)
{
    const seed = nerthus.pseudoRandom(i)
    //cloudContainer is needed to scale clouds
    const cloudContainer = document.createElement("div")
    const cloud = document.createElement("img")
    cloud.src = nerthus.addon.fileUrl("img/weather/cloud.png")

    const seconds = parseInt(100 + (Math.random() * 100))
    cloudContainer.style.animationDuration = seconds + "s"
    cloud.style.transform = "scale(" + (1 + seed) + ")"
    cloudContainer.style.animationDelay = "-" + (2 * Math.random() * seconds) + "s"
    cloudContainer.style.top = Math.random() * map.y * 32 + "px"
    cloud.style.filter = "blur(5px)"

    let opacity = seed

    if (opacity > 0.5)
        opacity = 1 - opacity
    cloud.style.opacity = opacity
    cloudContainer.className = "cloudContainer"
    cloudContainer.appendChild(cloud)


    document.getElementById("ground").appendChild(cloudContainer)
}

nerthus.weather.Simple1DNoise = function (seed)
{
    seed = seed || 2019
    const MAX_VERTICES = 256
    const MAX_VERTICES_MASK = MAX_VERTICES - 1
    let amplitude = 1
    let scale = 0.21

    let r = []

    function Random(seed)
    {
        this._seed = seed % 2147483647
        if (this._seed <= 0) this._seed += 2147483646

        this.next = function next()
        {
            return this._seed = this._seed * 16807 % 2147483647
        }
        this.getFloat = function ()
        {
            return (this.next() - 1) / 2147483646
        }
    }

    const rand = new Random(seed)
    for (let i = 0; i < MAX_VERTICES; ++i)
        r.push(rand.getFloat())

    function getVal(x)
    {
        const scaledX = x * scale
        const xFloor = Math.floor(scaledX)
        const t = scaledX - xFloor
        const tRemapSmoothstep = t * t * (3 - 2 * t)

        const xMin = xFloor % MAX_VERTICES_MASK
        const xMax = (xMin + 1) % MAX_VERTICES_MASK

        const y = lerp(r[xMin], r[xMax], tRemapSmoothstep)

        return y * amplitude
    }

    /**
     * Linear interpolation function.
     * @param a The lower integer value
     * @param b The upper integer value
     * @param t The value between the two
     * @returns {number}
     */
    function lerp(a, b, t)
    {
        return a * (1 - t) + b * t
    }

    // return the API
    return {
        getVal: getVal,
        setAmplitude: function (newAmplitude)
        {
            amplitude = newAmplitude
        },
        setScale: function (newScale)
        {
            scale = newScale
        }
    }
}


nerthus.weather.climates = {
    default: new nerthus.weather.Climate(1, 0, 0, 0, 0, 0),
    andarum: new nerthus.weather.Climate(2, -10, 0, -10, -20, 0.3),
    altepetl: new nerthus.weather.Climate(3, 20, 20, 20, 20, 0.2), //todo pora deszczowa i pora sucha
    mythar: new nerthus.weather.Climate(4, 0, 0, 0, 0, 0.3),
    desert: new nerthus.weather.Climate(5, 20, 15, 15, 20, -0.5),
    nithal: new nerthus.weather.Climate(6, 10, 5, 10, 20, -0.5),
    south: new nerthus.weather.Climate(7, 0, 0, 0, 0, 0),
    coldSwamp: new nerthus.weather.Climate(8, 0, -10, 0, 5, 0.4),
}

nerthus.weather.mapSettings = {
    andarum: [1730, 1387, 2063, 2056, 180],
    altepetl: [3759, 1137, 1141, 1901, 1926, 3597],
    mythar: [257, 246, 339, 3594, 3595, 3596, 1924],
    mytharNorthForest: [3765, 331, 3766, 268, 330, 332, 253],
    nithal: [574, 575, 600, 730, 731, 845, 599, 1761, 1675, 1858, 1860, 1858, 1876, 1984, 2391],
    south: [701, 3758, 500, 576, 4185, 1116, 347, 344, 348, 356, 4155, 223, 222, 214, 33, 361, 4154, 357],
    coldSwamp: [4151, 4152, 2320, 2324, 2308, 2310, 2524, 3402, 111, 708, 712, 1708, 1711, 1712],
    tuzmer: [1233, 630, 1262, 1607, 589, 1349, 1154, 1167, 1348, 3598, 1613, 1159],
    desert: [1350, 3081, 3100, 1368, 3328, 3326, 3327, 3325, 3315],
    cold: [198, 1101, 2761, 2065, 2064, 114, 2020, 2066, 2055, 2782, 140, 150, 122],
    witches: [1293, 1202, 1294, 1297, 4049, 4050, 4048, 4052, 4051],
    warmSwamp: [3136, 3135, 3137, 3138, 3209, 1448, 1449, 1399, 1458],
    north: [229, 2762, 1100, 226, 128, 1058, 1975, 121, 2536, 151, 9, 725, 726, 727, 37, 1057, 10, 84, 38, 8, 2520, 2730, 116, 4, 110, 115, 244],
    karkaHan: [35, 1235, 1084, 36, 1788, 2546, 1230, 1219, 901, 276, 900, 3533, 3535, 3534, 3738, 3737],
    torneg: [137, 1, 138, 11, 3, 631, 632, 2887, 579, 368, 12, 1062, 333, 3300, 3736, 1131, 3734, 3735, 2029, 2, 1111, 1115, 3733, 1060, 1108, 1263, 1285, 3361, 1267]
}

nerthus.weather.checkMapClimate = function (mapId)
{
    for (const climateName in this.mapSettings)
        if (this.mapSettings[climateName].indexOf(mapId) >= 0)
            return this.climates[climateName]
    return false
}

nerthus.weather.getMapClimate = function (mapId)
{

    const mapClimate = nerthus.weather.checkMapClimate(mapId)
    if (mapClimate) return mapClimate
    return this.climates["default"]
}

nerthus.weather.getRainType = function (temperature, humidity)
{
    let temp
    if (temperature < -3) temp = 0
    else if (temperature < 5) temp = 1
    else if (temperature < 25) temp = 2
    else temp = 3

    let hum
    if (humidity < 0.1) hum = 0
    else if (humidity < 0.6) hum = 1
    else if (humidity < 0.75) hum = 2
    else if (humidity < 0.9) hum = 3
    else hum = 4

    return nerthus.weather.types[hum][temp]
}

nerthus.weather.checkThunderstorm = function(date, seed)
{
    const NOISE = new this.Simple1DNoise(seed)

    const pointInTime = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 3600000

    return NOISE.getVal(pointInTime) > 0.5
}
// z: cold/hot
nerthus.weather.types = [
    ["Suchy mróz", "Zimno", "Susza", "Burza piaskowa"],
    ["Mróz", "Przymrozek", "Zwyczajne", "Gorąc"],
    ["Lekki śnieg", "Plucha", "Lekki deszcz", "Lekki gorący deszcz"],
    ["Śnieg", "Śnieg z deszczem", "Deszcz", "Duszący deszcz"],
    ["Śnieżyca", "Grad", "Ulewa", "Tropikalna ulewa"]
]

nerthus.weather.temperatureDesc = [
    [
        "Zimno jak diabli, odmarzają nosy",
        "Jakbyś polizał słup to byś się do niego przykleił"
    ],
    [
        "Zimno, ale nie aż tak.",
        "Nie jest mroźnie, ale przyjemnie też nie"
    ],
    [
        "Zwyczajna tmperatura."
    ],
    [
        "Gorąc"
    ]
]

nerthus.weather.descriptions.moonPhases = [
    ["nów"],
    ["przybywający półksiężyc"],
    ["pierwsza kwarta"],
    ["przybywający wypukły"],
    ["pełnia"],
    ["malejący wypukły"],
    ["ostatnia kwarta"],
    ["malejący półksiężyc"]
]

nerthus.weather.getMoonPhase = function(date)
{
    let year = date.getUTCFullYear()
    let month = date.getUTCMonth() + 1
    let day = date.getUTCDate()

    if (month < 3) {
        year--;
        month += 12;
    }

    ++month;

    const c = 365.25 * year;

    let e = 30.6 * month;

    let jd = (c + e + day - 694039.09) / 29.5305882;

    let phase = parseInt(jd); //int(jd) -> b, take integer part of jd

    jd -= phase; //subtract integer part to leave fractional part of original jd

    phase = Math.round(jd * 8); //scale fraction from 0-8 and round

    phase = phase % 8 //there are 8 phases and 8th would be same as 1st


    // 0 => New Moon                  nów
    // 1 => Waxing Crescent Moon      przybywający półksiężyc
    // 2 => Quarter Moon              pierwsza kwarta
    // 3 => Waxing Gibbous Moon       przybywający wypukły
    // 4 => Full Moon                 pełnia
    // 5 => Waning Gibbous Moon       malejący wypukły
    // 6 => Last Quarter Moon         ostatnia kwarta
    // 7 => Waning Crescent Moon      malejący półksiężyc

    return phase;
}


nerthus.weather.run = function () //todo NI
{
    console.log(map.id)
    const climate = this.getMapClimate(map.id)

    for (const climateName in this.mapSettings)
        if (this.mapSettings[climateName].indexOf(map.id) >= 0)
            console.log(climateName)

    const gateways = []
    const gatewaysIds = []
    for (let mapId in g.gwIds)
    {
        if (typeof g.gw[g.gwIds[mapId]] !== "undefined") // some fast map switchers don't reset g.gwIds
        {
            mapId = parseInt(mapId)
            const mapClimate = nerthus.weather.checkMapClimate(mapId)
            if (mapClimate && gatewaysIds.indexOf(mapId) < 0)
            {
                gateways.push(mapClimate)
                gatewaysIds.push(mapId)
            }
        }
    }

    let gatewaysTemperature = 0 //todo remember when no gateways
    let gatewaysRain = 0 //todo remember when no gateways
    const gatewaysLen = gateways.length
    for (let i = 0; i < gatewaysLen; i++)
    {
        const temp = gateways[i].getCurrentTemperature()
        gatewaysTemperature += temp / gatewaysLen

        const rain = gateways[i].getCurrentRain()
        gatewaysRain += rain / gatewaysLen
    }

    const trueTemperature = 0.5 * climate.getCurrentTemperature() + 0.5 * gatewaysTemperature
    const trueHumidity = 0.5 * climate.getCurrentRain() +  0.5 * gatewaysRain

    console.table([
        {
            temperature: climate.getCurrentTemperature(),
            rain: climate.getCurrentRain(),
            thunderstorm: climate.getThunderstorm(),
            weatherType: nerthus.weather.getRainType(climate.getCurrentTemperature(), climate.getCurrentRain())
        },
        {
            temperature: trueTemperature,
            rain: trueHumidity,
            thunderstorm: climate.getThunderstorm(),
            weatherType: nerthus.weather.getRainType(trueTemperature, trueHumidity)
        }
    ])
    const moonDate = new Date()
    if (moonDate.getHours() > 12)
        moonDate.setDate(moonDate.getDay() + 1)
    const moonPhase = nerthus.weather.getMoonPhase(moonDate)

    const moonDescId = Math.floor(Math.random() * (nerthus.weather.descriptions.moonPhases[moonPhase].length - 1))
    console.log(nerthus.weather.descriptions.moonPhases[moonPhase][moonDescId])



    nerthus.weather.clouds.createTranslate(map.x * 32 + 500)
    const number_of_clouds = 100
    for (let i = 0; i < number_of_clouds; i++)
    {
        //nerthus.weather.clouds.createCloud(i) //todo remove clouds after map change
    }

}

nerthus.weather.start = function ()
{
    if (nerthus.options['weather'])
    {
     //   this.run()
            // nerthus.worldEdit.weatherDisplayOn = true
        // nerthus.defer(this.run.bind(this))
       nerthus.loadOnEveryMap(this.run.bind(this))
    }
}

nerthus.weather.start_ni = function ()
{
    nerthus.onDefined("Engine.map.d.id", () =>
    {
        this.run = this.run_ni
        this.display = this.display_ni
        this.effects.display_url = this.effects.display_url_ni
        this.set_weather = this.set_weather_ni
        if (nerthus.options["weather"])
        {
            nerthus.worldEdit.weatherDisplayOn = true
            nerthus.worldEdit.setWeatherUrls()
            nerthus.worldEdit.setWeatherClock()

            this.run_ni()
            nerthus.loadOnEveryMap(this.run_ni.bind(this))
        }
    })
}
