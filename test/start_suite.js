before(function(){
    log = function(msg){console.log(msg)}

    require("../NN_start.js")
    expect = require("./expect.js")

    VERSION_CURRENT = "CURRENT_VERSION"
    VERSION_OLD = "OLD_VERSION"
    VERSION_MASTER = "master"
    PREFIX_CDN = 'http://cdn.rawgit.com/akrzyz/nerthusaddon'
    PREFIX_MASTER = 'http://rawgit.com/akrzyz/nerthusaddon'
    ADDITIONAL_SCRIPTS = ["ADDITIONAL_SCRIPT_1.js", "ADDITIONAL_SCRIPT_2.js"]

})

beforeEach(function(){

    $ = {}
    $.loaded_scripts = []
    $.loaded_jsons = []
    $.getScript = function(url, callback){this.loaded_scripts.push(url); callback()}
    $.getJSON = function(url, callback){this.loaded_jsons.push(url); callback({version:VERSION_CURRENT})}

    localStorage = {}

    LOAD_HELPER = {}
    LOAD_HELPER.loaded = false;
    LOAD_HELPER.on_load = function(){this.loaded = true}.bind(LOAD_HELPER)

    nerthus.RUNABLE_MODULE = {}
    nerthus.RUNABLE_MODULE.running = false
    nerthus.RUNABLE_MODULE.start = function(){this.running = true}

    nerthus.addon.version = VERSION_MASTER
    nerthus.addon.filesPrefix = PREFIX_CDN
})

suite("start")

test("fileUrl concat filesPrefix, version and file_name into url", function(){
    var FILE = 'SCRIPT.JS'
    var PREFIX = 'PREFIX'
    var VERSION = 'VERSION'
    var FILE_URL = 'PREFIX/VERSION/SCRIPT.JS'

    nerthus.addon.filesPrefix = PREFIX
    nerthus.addon.version = VERSION
    expect(nerthus.addon.fileUrl(FILE)).to.be.equal(FILE_URL)
})

test("ScriptsLoader : load empty script list", function(){
    NerthusAddonUtils.scriptsLoader.load([], LOAD_HELPER.on_load)

    expect(LOAD_HELPER.loaded).to.be.ok()
    expect($.loaded_scripts).to.have.length(0)
})

test("ScriptsLoader : load single script", function(){
    var FILE = "SCRIPT.JS"
    var FILE_URL = nerthus.addon.fileUrl(FILE)

    NerthusAddonUtils.scriptsLoader.load([FILE], LOAD_HELPER.on_load)

    expect(LOAD_HELPER.loaded).to.be.ok()
    expect($.loaded_scripts).to.have.length(1)
    expect($.loaded_scripts[0]).to.be.equal(FILE_URL)
})

test("ScriptsLoader : load multiple scripts", function(){
    var FILE_1 = "SCRIPT_1.JS"
    var FILE_2 = "SCRIPT_2.JS"
    var FILE_URL_1 = nerthus.addon.fileUrl(FILE_1)
    var FILE_URL_2 = nerthus.addon.fileUrl(FILE_2)

    NerthusAddonUtils.scriptsLoader.load([FILE_1, FILE_2], LOAD_HELPER.on_load)

    expect(LOAD_HELPER.loaded).to.be.ok()
    expect($.loaded_scripts).to.have.length(2)
    expect($.loaded_scripts[0]).to.be.equal(FILE_URL_1)
    expect($.loaded_scripts[1]).to.be.equal(FILE_URL_2)
})

test("VersionLoader ", function(){
    var version = { ver : null}
    var version_loaded = function(v){this.ver = v}.bind(version)

    NerthusAddonUtils.versionLoader.load(version_loaded)

    expect($.loaded_jsons).to.have.length(1)
    expect(version.ver).to.be.equal(VERSION_CURRENT)
})

test("GitHubLoader", function(){
    nerthus.scripts = ADDITIONAL_SCRIPTS

    NerthusAddonUtils.gitHubLoader.load(LOAD_HELPER.on_load)

    expect(LOAD_HELPER.loaded).to.be.ok()
    expect($.loaded_scripts).to.have.length(2 + ADDITIONAL_SCRIPTS.length)
    expect($.loaded_scripts[0]).to.be.equal(nerthus.addon.fileUrl("NN_dlaRadnych.js"))
    expect($.loaded_scripts[1]).to.be.equal(nerthus.addon.fileUrl("NN_base.js"))
    expect($.loaded_scripts[2]).to.be.equal(nerthus.addon.fileUrl(ADDITIONAL_SCRIPTS[0]))
    expect($.loaded_scripts[3]).to.be.equal(nerthus.addon.fileUrl(ADDITIONAL_SCRIPTS[1]))
})

test("StorageLoader : load addon in current version, nerthus remain in storage", function(){
    nerthus.addon.version = VERSION_CURRENT

    localStorage.nerthus = NerthusAddonUtils.parser.stringify(nerthus)

    NerthusAddonUtils.storageLoader.load(LOAD_HELPER.on_load)

    expect(LOAD_HELPER.loaded).to.be.ok()
    expect(localStorage.nerthus).to.be.ok()
    expect(nerthus.RUNABLE_MODULE.running).to.be.ok()
})

test("StorageLoader : load addon in old version, nerthus is removed from storage", function(){
    nerthus.addon.version = VERSION_OLD
    localStorage.nerthus = NerthusAddonUtils.parser.stringify(nerthus)

    NerthusAddonUtils.storageLoader.load(LOAD_HELPER.on_load)

    expect(LOAD_HELPER.loaded).to.be.ok()
    expect(nerthus.RUNABLE_MODULE.running).to.be.ok()
    expect(localStorage.nerthus).to.not.be.ok()
})

test("Runner : run in debug mode", function(){
    localStorage.NerthusAddonDebug = true

    NerthusAddonUtils.runner.run()

    expect(nerthus.addon.version).to.be.equal(VERSION_MASTER)
    expect(nerthus.addon.filesPrefix).to.be.equal(PREFIX_MASTER)
})

test("Runner : run from github", function(){

    NerthusAddonUtils.runner.run()

    expect(nerthus.addon.version).to.be.equal(VERSION_CURRENT)
    expect(nerthus.addon.filesPrefix).to.be.equal(PREFIX_CDN)
})

test("Runner : run from localStorage in actual version", function(){
    nerthus.addon.version = VERSION_CURRENT
    localStorage.nerthus = NerthusAddonUtils.parser.stringify(nerthus)
    nerthus = null

    NerthusAddonUtils.runner.run()

    expect(nerthus.addon.version).to.be.equal(VERSION_CURRENT)
    expect(nerthus.addon.filesPrefix).to.be.equal(PREFIX_CDN)
    expect(localStorage.nerthus).to.be.ok() //remain in storage
})

test("Runner : run from localStorage in old version", function(){
    nerthus.addon.version = VERSION_OLD
    localStorage.nerthus = NerthusAddonUtils.parser.stringify(nerthus)
    nerthus = null

    NerthusAddonUtils.runner.run()

    expect(nerthus.addon.version).to.be.equal(VERSION_OLD)
    expect(nerthus.addon.filesPrefix).to.be.equal(PREFIX_CDN)
    expect(localStorage.nerthus).to.not.be.ok() //removed from storege
})
