import {removeCollision, setCollision} from './collision'
import {addDialogToDialogList, openDialog} from '../dialog'
import {customNpcs} from '../npc'
import {removeNpc} from './remove'
import {callEvent} from '../../API'

function createClickWrapper(npc, clickHandler)
{
    return function (event)
    {
        if (Math.abs(npc.x - hero.x) > 1 || Math.abs(npc.y - hero.y) > 1)
            hero.mClick(event)
        else
            clickHandler()
    }
}

export function addNpc(npc)
{
    if (INTERFACE === 'NI')
    {
        const data = {}
        data[npc.id] = npc

        const npath = CFG.npath
        const npcIcon = npc.icon
        // Change the npc.icon so that game's GifReader doesn't try to read png/jpg and error
        if (!npcIcon.endsWith('gif')) npc.icon = npath + 'obj/cos.gif'

        CFG.npath = ''
        Engine.npcs.updateData(data)
        CFG.npath = npath

        // Fix for png/jpg npcs
        if (!npcIcon.endsWith('gif'))
        {
            npc.icon = npcIcon
            const gameNpc = Engine.npcs.getById(npc.id)
            gameNpc.staticAnimation = true

            const img = new Image()
            img.onload = function ()
            {
                gameNpc.afterFetch({
                    img: npcIcon,
                    frames: 1,
                    hdr: {
                        width: this.width,
                        height: this.height
                    }
                }, '', npc)
                gameNpc.afterFetch = function () {}
            }
            img.src = npcIcon
        }

        if (npc.dialog) addDialogToDialogList(npc.id, npc.nick, npc.dialog)

        if (npc.collision)
            setCollision(npc.x, npc.y)
        else
            removeCollision(npc.x, npc.y)
        return data
    }
    else
    {
        const $npc = $('<div id="npc' + npc.id + '" class="npc nerthus-npc"></div>')
            .css({
                backgroundImage: 'url(' + npc.icon + ')',
                zIndex: npc.y * 2 + 9,
                left: npc.x * 32,
                top: npc.y * 32 - 16,
                pointerEvents: npc.type === 4 ? 'none' : 'auto'
            })

        const img = new Image()
        img.onload = function ()
        {
            const width = img.width
            const height = img.height

            const tmpLeft = npc.x * 32 + 16 - Math.round(width / 2) + ((npc.type > 3 && !(width % 64)) ? -16 : 0)
            const wpos = Math.round(this.x) + Math.round(this.y) * 256
            let wat
            if (map.water && map.water[wpos])
                wat = map.water[wpos] / 4
            $npc.css({
                left: tmpLeft,
                top: npc.y * 32 + 32 - height + (wat > 8 ? 0 : 0),
                width: (tmpLeft + width > map.x * 32 ? map.x * 32 - tmpLeft : width),
                height: height - (wat > 8 ? ((wat - 8) * 4) : 0)
            })
        }
        img.src = npc.icon
        $npc.appendTo('#base')
        if (npc.nick)
            $npc.attr({
                ctip: 't_npc',
                tip: npc.nick
            })

        if (npc.dialog)
        {
            addDialogToDialogList(npc.id, npc.nick, npc.dialog)
            $npc.click(createClickWrapper(npc, openDialog.bind(null, npc.id, 0)))
        }

        if (npc.collision)
            setCollision(npc.x, npc.y)
        return $npc
    }
}

/**
 * Function adds new NPC to the list and displays him,
 * or replaces NPC on the same coordinates and same map
 * @param npc
 * @param mapId
 */
export function addNpcToList(npc, mapId)
{
    if (!customNpcs[mapId]) customNpcs[mapId] = {}
    if (customNpcs[mapId][npc.id]) removeNpc(npc.x, npc.y, mapId)
    customNpcs[mapId][npc.id] = npc
    if (INTERFACE === 'NI')
    {
        if (Engine.map.d.id === mapId)
            addNpc(npc)
    }
    else
    {
        if (map.id === mapId)
            addNpc(npc)
    }
    callEvent('addTemporaryNpc', {npc: npc, mapId: mapId})
}
