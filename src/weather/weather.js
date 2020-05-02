import {settings} from '../settings'
import {Simple1DNoise} from './noise'
import {addWidget} from '../widgets'
import {default as weatherDescriptions} from '../../res/descriptions/weather.json'
import {clearEffects, displayRain, displaySnow} from './effects'
import {default as climates} from '../../res/configs/climates.json'
import {isCurrentMapOutdoor} from '../utility-functions'
import {loadOnEveryMap} from '../game-integration/loaders'



function getMapsClimate(mapId)
{
    for (const climateName in climates.maps)
        if (climates.maps[climateName].indexOf(mapId) >= 0)
            return climateName
    return false
}

function getClimateVariation(characteristic, date, climate)
{
    if (!characteristic[climate]) climate = 'default'

    const now = new Date()
    const start = new Date(now.getFullYear(), 3, 20) // start of spring
    if (start > now) start.setUTCFullYear(now.getFullYear() - 1)
    const day = Math.ceil((now - start) / (1000 * 60 * 60 * 24))
    const firstSeason = Math.floor(day / 90)
    const secondSeason = firstSeason === 3 ? 0 : firstSeason + 1
    return characteristic[climate][firstSeason] * (1 - ((day / 90) - firstSeason)) +
        characteristic[climate][secondSeason] * ((day / 90) - firstSeason)
}

const cloudinessNoise = new Simple1DNoise(2020)

function getClimateCloudiness(date, climate)
{
    const pointInTime = date.getTime() / 3600000

    const ret = cloudinessNoise.getVal(pointInTime) * getClimateVariation(climates.characteristics.cloudiness, date, climate)
    return ret > 1 ? 1 : ret
}

const humidityNoise = new Simple1DNoise(420)

function getClimateHumidity(date, climate)
{
    const pointInTime = date.getTime() / 3600000

    const ret = humidityNoise.getVal(pointInTime) * getClimateVariation(climates.characteristics.humidity, date, climate)
    return ret > 1 ? 1 : ret
}

const temperatureNoise = new Simple1DNoise(666)

function getGlobalTemperature(date)
{
    const month = date.getUTCMonth()
    const day = date.getUTCDate()

    // f(x) = 15 * Math.sin(0.52 * x - 1.5) + 9 is a graph that resembles average temperature graph in poland
    // https://en.climate-data.org/north-america/united-states-of-america/ohio/poland-137445/#climate-graph
    const x = month + (day / 31) //minor difference in 28 day month probably not noticeable
    const dayTemperature = 15 * Math.sin(0.52 * x - 1.5) + 9

    const pointInTime = date.getTime() / 3600000
    const hourTemperatureChange = temperatureNoise.getVal(pointInTime) * 14 - 7

    return dayTemperature + hourTemperatureChange
}


function getClimateTemperature(date, climate)
{
    return getGlobalTemperature(date) + getClimateVariation(climates.characteristics.temperature, date, climate)
}

function getCurrentRegionCharacteristic(date) // todo naming???
{
    if (INTERFACE === 'NI')
    {

    }
    else
    {
        const adjacentClimates = []
        const gatewaysIds = []
        for (let mapId in g.gwIds)
        {
            if (typeof g.gw[g.gwIds[mapId]] !== 'undefined') // some fast map switchers don't reset g.gwIds
            {
                mapId = parseInt(mapId)
                const mapClimate = getMapsClimate(mapId)
                if (mapClimate && gatewaysIds.indexOf(mapId) < 0)
                {
                    adjacentClimates.push(mapClimate)
                    gatewaysIds.push(mapId)
                }
            }
        }

        const currentMapClimate = getMapsClimate(map.id)
        let adjacentHumidity = 0
        let adjacentCloudiness = 0
        let adjacentTemperature = 0
        const adjacentAmount = adjacentClimates.length
        if (adjacentAmount > 0)
        {
            for (let i = 0; i < adjacentAmount; i++)
            {
                adjacentHumidity += getClimateHumidity(date, adjacentClimates[i])
                adjacentCloudiness += getClimateCloudiness(date, adjacentClimates[i])
                adjacentTemperature += getClimateTemperature(date, adjacentClimates[i])
            }
            adjacentHumidity /= adjacentAmount
            adjacentCloudiness /= adjacentAmount
            adjacentTemperature /= adjacentAmount

            return {
                'humidity': 0.5 * getClimateHumidity(date, currentMapClimate) + 0.5 * adjacentHumidity,
                'cloudiness': 0.5 * getClimateCloudiness(date, currentMapClimate) + 0.5 * adjacentCloudiness,
                'temperature': 0.5 * getClimateTemperature(date, currentMapClimate) + 0.5 * adjacentTemperature
            }
        }
        else return {
            'humidity': getClimateHumidity(date, currentMapClimate),
            'cloudiness': getClimateCloudiness(date, currentMapClimate),
            'temperature': getClimateTemperature(date, currentMapClimate)
        }
    }
}

/**
 * Table holding names of weathers based on cloudiness and humidity thresholds.
 * First variable (rows) is cloudiness and second (columns) is humidity
 * There should be 52.5% to get a value without any rain if both variables are random.
 * @type {string[][]}
 */
const WEATHER_TABLE =
    [   //   15%             20%               25%           40%
        ['clear-day', 'day-cloud-small', 'day-cloud-big', 'overcast'  ], // 25%
        ['clear-day', 'day-cloud-small', 'day-cloud-big', 'rain-light'], // 25%
        ['clear-day', 'day-cloud-small', 'day-rain'     , 'rain'      ], // 25%
        ['clear-day', 'day-rain'       , 'day-storm'    , 'storm'     ]  // 25%
    ]

const RAIN_STRENGTH = {
    'rain-light': 0.5,
    'day-rain': 0.6,
    'day-storm': 1,
    'rain': 0.9,
    'storm': 1
}

const SNOW_STRENGTH = {
    'day-snow': 1,
    'day-rain-with-snow': 1,
    'snow': 1,
    'snow-storm': 1
}


export function getWeather(date)
{
    const characteristics = getCurrentRegionCharacteristic(date)

    if (characteristics.temperature > 25) // really hot, less cloudiness and humidity
    {
        characteristics.cloudiness *= 0.8
        characteristics.humidity *= 0.8
    }

    let cloudinessPart
    if (characteristics.cloudiness <= 0.15) cloudinessPart = 0
    else if (characteristics.cloudiness <= 0.35) cloudinessPart = 1
    else if (characteristics.cloudiness <= 0.60) cloudinessPart = 2
    else cloudinessPart = 3

    let humidityPart
    if (characteristics.humidity <= 0.25) humidityPart = 0
    else if (characteristics.humidity <= 0.50) humidityPart = 1
    else if (characteristics.humidity <= 0.75) humidityPart = 2
    else humidityPart = 3

    let weather = WEATHER_TABLE[cloudinessPart][humidityPart]

    if (characteristics.temperature < -3)
        weather = weather
            .replace('rain', 'snow')
            .replace(/^storm$/, 'snow-storm')
            .replace(/^day-storm$/, 'day-snow')
    else if (characteristics.temperature < 5)
        weather = weather
            .replace('rain', 'rain-with-snow')
            .replace(/^day-storm$/, 'day-rain-with-snow')

    let rain = 0
    if (RAIN_STRENGTH[weather]) rain = RAIN_STRENGTH[weather]

    let snow = 0
    if (SNOW_STRENGTH[weather]) snow = SNOW_STRENGTH[weather]

    if (date.getHours() < 6 || date.getHours() > 20)
        weather = weather.replace('day', 'night')

    return {
        name: weather,
        rainStrength: rain,
        snowStrength: snow,
        temperature: characteristics.temperature,
        humidity: characteristics.humidity,
        cloudiness: characteristics.cloudiness
    }
}

function displayWeatherEffects($widget)
{
    const currentWeather = getWeather(new Date())
    $widget.children('.nerthus__widget-image')
        .css('background-image', 'url(' + FILE_PREFIX + 'res/img/weather/icons/' + currentWeather.name + '.png)')

    const descId = Math.floor(Math.random() * weatherDescriptions[currentWeather.name].length)
    $widget.children('nerthus__widget-desc')
        .text(weatherDescriptions[currentWeather.name][descId])

    clearEffects()
    if (isCurrentMapOutdoor())
    {
        if (currentWeather.rainStrength) displayRain(currentWeather.rainStrength)
        if (currentWeather.snowStrength) displaySnow(currentWeather.snowStrength)
    }
}

function startChangeTimer($widget)
{
    const date = new Date()
    const hour = Math.floor((date.getUTCHours()) + 1)
    date.setUTCHours(hour, 0, 0)
    const timeout = date - new Date()
    setTimeout(function ()
    {
        displayWeatherEffects($widget)
        startChangeTimer($widget)
    }, timeout)
}

export function initWeather()
{
    if (settings.weather)
    {
        const currentWeather = getWeather(new Date())
        const descId = Math.floor(Math.random() * weatherDescriptions[currentWeather.name].length)
        const $widget = addWidget(
            'weather',
            FILE_PREFIX + 'res/img/weather/icons/' + currentWeather.name + '.png',
            weatherDescriptions[currentWeather.name][descId]
        )

        loadOnEveryMap(displayWeatherEffects, $widget)

        startChangeTimer($widget)
        for (let i = 0; i < 20; i++)
        {
            let date = new Date().getTime()
            date += 1000 * 60 * 60 * i
            let newDate = new Date(date)
            console.log(getWeather(newDate))
        }
    }
}