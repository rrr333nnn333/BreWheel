import { exec, toast } from '../../kernelsu.js'

import { whichCurrentPage } from '../navbar.js'
import { getStrings } from '../pageLoader.js'

globalThis.rootInfo = {
  impl: null
}

globalThis.incompatibleModules = []

async function _fileExists(path) {
  let result = await exec(`stat "${path}"`)

  return result.errno === 0
}

async function _isModuleDisabled() {
  return await _fileExists('/data/adb/modules/treat_wheel/disable')
}

async function _isModuleIgnoring() {
  let state = await exec('cat /data/adb/treat_wheel/state')
  if (state.errno !== 0) {
    toast('Error getting state of Treat Wheel!')

    return;
  }

  let isIgnoring = false
  state.stdout.split('\n').forEach((line) => {
    if (line.startsWith('ignoring=')) isIgnoring = line.split('=')[1] === 'true'
  })

  return isIgnoring
}

async function _getVersion() {
  let moduleProp = await exec('cat /data/adb/modules/treat_wheel/module.prop')
  if (moduleProp.errno !== 0) {
    toast('Error getting state of Treat Wheel!')

    return;
  }

  let version = '???'
  moduleProp.stdout.split('\n').forEach((line) => {
    if (line.startsWith('version=')) version = line.split('=')[1]
  })

  return version
}

async function _usedRootImpl() {
  let providers = {
    KSU: false
  }

  /* TODO: Use cmd to do prctl KSU detection */
  {
    /* INFO: See if /data/adb/ksud exists */
    const ksuVersion = await exec('/data/adb/ksud debug version')
    if (ksuVersion.errno === 0 && ksuVersion.stdout !== 'Kernel Version: 0') providers.KSU = true
  }

  if (providers.KSU) return 'KernelSU'

  return false
}

export async function loadOnce() {

}

let lastStrings = null

export async function loadOnceView() {
  document.getElementById('version_code').innerHTML = await _getVersion()

  const strings = await getStrings(whichCurrentPage())

  let root_impl = globalThis.rootInfo.impl = await _usedRootImpl()
  if (!root_impl) root_impl = strings.unknown
  if (root_impl === 'Multiple') root_impl = strings.rootImpls.multiple

  document.getElementById('root_impl').innerHTML = root_impl
}

export async function onceViewAfterUpdate() {
  /* INFO: Update translations */
  const strings = await getStrings(whichCurrentPage())

  const tw_state = document.getElementById('tw_state')
  if (globalThis.incompatibleModules.length > 0)
    tw_state.innerHTML = strings.workingModes.incompatibleModules.replace('%s', globalThis.incompatibleModules.join(', '))

  if (tw_state.innerHTML === lastStrings.workingModes.disabled)
    tw_state.innerHTML = strings.workingModes.disabled
  else if (tw_state.innerHTML === lastStrings.workingModes.unknown)
    tw_state.innerHTML = strings.workingModes.unknown
  else if (tw_state.innerHTML === lastStrings.workingModes.sigcheckFailed)
    tw_state.innerHTML = strings.workingModes.sigcheckFailed
  else if (tw_state.innerHTML === lastStrings.workingModes.ignoring)
    tw_state.innerHTML = strings.workingModes.ignoring
  else if (tw_state.innerHTML === lastStrings.workingModes.crashed)
    tw_state.innerHTML = strings.workingModes.crashed
  else if (tw_state.innerHTML === lastStrings.workingModes.working)
    tw_state.innerHTML = strings.workingModes.working

  lastStrings = strings
}

export async function load() {
  if (lastStrings !== null) return;

  const rootCss = document.querySelector(':root')
  const tw_state = document.getElementById('tw_state')
  const tw_icon_state = document.getElementById('tw_icon_state')

  const status = await exec('cat /data/adb/treat_wheel/status')

  const hasZygiskAssistant = await _fileExists('/data/adb/modules/zygisk_assistant') || await _fileExists('/data/adb/modules_update/zygisk_assistant')
  const hasNoHello = await _fileExists('/data/adb/modules/nohello') || await _fileExists('/data/adb/modules_update/nohello')


  const isIgnoring = await _isModuleIgnoring()

  const strings = await getStrings(whichCurrentPage())
  lastStrings = strings

  if (hasZygiskAssistant || hasNoHello) {
    if (hasZygiskAssistant) globalThis.incompatibleModules.push('Zygisk Assistant')
    if (hasNoHello) globalThis.incompatibleModules.push('NoHello')

    tw_state.innerHTML = strings.workingModes.incompatibleModules.replace('%s', globalThis.incompatibleModules.join(', '))

    rootCss.style.setProperty('--bright', '#ff0000')
    tw_icon_state.innerHTML = '<img class="brightc" src="assets/mark.svg">'
  } else if (await _isModuleDisabled()) {
    tw_state.innerHTML = strings.workingModes.disabled

    rootCss.style.setProperty('--bright', '#808080')
    tw_icon_state.innerHTML = '<img class="brightc" src="assets/warn.svg">'
  } else if (status.errno !== 0) {
    tw_state.innerHTML = strings.workingModes.unknown

    rootCss.style.setProperty('--bright', '#766000')
    tw_icon_state.innerHTML = '<img class="brightc" src="assets/warn.svg">'
  } else if (isIgnoring) {
    tw_state.innerHTML = strings.workingModes.ignoring

    rootCss.style.setProperty('--bright', '#808080')
    tw_icon_state.innerHTML = '<img class="brightc" src="assets/warn.svg">'
  } else if (status.stdout === 'crashed') {
    tw_state.innerHTML = strings.workingModes.crashed

    rootCss.style.setProperty('--bright', '#766000')
    tw_icon_state.innerHTML = '<img class="brightc" src="assets/warn.svg">'
  } else {
    tw_state.innerHTML = strings.workingModes.working

    rootCss.style.setProperty('--bright', '#3a4857')
    tw_icon_state.innerHTML = '<img class="brightc" src="assets/tick.svg">'
  }

  /* INFO: This hides the throbber screen */
  loading_screen.style.display = 'none'
}
