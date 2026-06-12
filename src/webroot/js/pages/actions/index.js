import utils from '../utils.js'

import { exec, toast } from '../../kernelsu.js'

function _writeState(HidingState) {
  let state = ''

  if (HidingState.isIgnoring) state += 'ignoring=true\n'
  if (HidingState.isSpoofingProps) state += 'disable_prop_spoofing=true\n'
  if (HidingState.isHidingGSI) state += 'disable_gsi_hiding=true\n'
  if (HidingState.isHidingZygoteLeak) state += 'disable_zygote_mountinfo_leak_fixing=true\n'
  if (HidingState.isMapsHiding) state += 'disable_maps_hiding=true\n'
  if (HidingState.isRevancedMountsUmount) state += 'disable_revanced_mounts_umount=true\n'
  if (HidingState.isCustomFontLoading) state += 'disable_custom_font_loading=true\n'
  if (HidingState.isModuleLoadingTracesHiding) state += 'disable_module_loading_traces_hiding=true\n'
  if (HidingState.isFridaTracesHiding) state += 'disable_frida_traces_hiding=true\n'

  return exec(`echo "${state}" > /data/adb/treat_wheel/state`)
}

const HidingState = {
  isIgnoring: false,
  isSpoofingProps: false,
  isHidingGSI: false,
  isHidingZygoteLeak: false,
  isMapsHiding: false,
  isRevancedMountsUmount: false,
  isCustomFontLoading: false,
  isModuleLoadingTracesHiding: false,
  isFridaTracesHiding: false
}

export async function loadOnce() {
  let state = await exec('cat /data/adb/treat_wheel/state')
  if (state.errno !== 0) {
    toast('Error getting state of Treat Wheel!')

    return;
  }

  state = state.stdout

  state.split('\n').forEach((line) => {
    if (line.startsWith('ignoring=')) HidingState.isIgnoring = line.split('=')[1] === 'true'
    if (line.startsWith('disable_prop_spoofing=')) HidingState.isSpoofingProps = line.split('=')[1] === 'true'
    if (line.startsWith('disable_gsi_hiding=')) HidingState.isHidingGSI = line.split('=')[1] === 'true'
    if (line.startsWith('disable_zygote_mountinfo_leak_fixing=')) HidingState.isHidingZygoteLeak = line.split('=')[1] === 'true'
    if (line.startsWith('disable_maps_hiding=')) HidingState.isMapsHiding = line.split('=')[1] === 'true'
    if (line.startsWith('disable_revanced_mounts_umount=')) HidingState.isRevancedMountsUmount = line.split('=')[1] === 'true'
    if (line.startsWith('disable_custom_font_loading=')) HidingState.isCustomFontLoading = line.split('=')[1] === 'true'
    if (line.startsWith('disable_module_loading_traces_hiding=')) HidingState.isModuleLoadingTracesHiding = line.split('=')[1] === 'true'
    if (line.startsWith('disable_frida_traces_hiding=')) HidingState.isFridaTracesHiding = line.split('=')[1] === 'true'
  })
}

export async function loadOnceView() {
  const tw_ignore_switch = document.getElementById('tw_ignore_switch')
  const tw_disable_prop_spoofing_switch = document.getElementById('tw_disable_prop_spoofing_switch')
  const tw_disable_gsi_hiding_switch = document.getElementById('tw_disable_gsi_hiding_switch')
  const tw_disable_zygote_mountinfo_leak_fixing_switch = document.getElementById('tw_disable_zygote_mountinfo_leak_fixing_switch')
  const tw_disable_maps_hiding_switch = document.getElementById('tw_disable_maps_hiding_switch')
  const tw_disable_revanced_mounts_umount_switch = document.getElementById('tw_disable_revanced_mounts_umount_switch')
  const tw_disable_custom_font_loading_switch = document.getElementById('tw_disable_custom_font_loading_switch')
  const tw_disable_module_loading_traces_hiding_switch = document.getElementById('tw_disable_module_loading_traces_hiding_switch')
  const tw_disable_frida_traces_hiding_switch = document.getElementById('tw_disable_frida_traces_hiding_switch')

  if (HidingState.isIgnoring) tw_ignore_switch.checked = true
  if (HidingState.isSpoofingProps) tw_disable_prop_spoofing_switch.checked = true
  if (HidingState.isHidingGSI) tw_disable_gsi_hiding_switch.checked = true
  if (HidingState.isHidingZygoteLeak) tw_disable_zygote_mountinfo_leak_fixing_switch.checked = true
  if (HidingState.isMapsHiding) tw_disable_maps_hiding_switch.checked = true
  if (HidingState.isRevancedMountsUmount) tw_disable_revanced_mounts_umount_switch.checked = true
  if (HidingState.isCustomFontLoading) tw_disable_custom_font_loading_switch.checked = true
  if (HidingState.isModuleLoadingTracesHiding) tw_disable_module_loading_traces_hiding_switch.checked = true
  if (HidingState.isFridaTracesHiding) tw_disable_frida_traces_hiding_switch.checked = true

  tw_disable_gsi_hiding_switch.disabled = HidingState.isIgnoring
  tw_disable_prop_spoofing_switch.disabled = HidingState.isIgnoring
  tw_disable_zygote_mountinfo_leak_fixing_switch.disabled = HidingState.isIgnoring
  tw_disable_maps_hiding_switch.disabled = HidingState.isIgnoring
  tw_disable_revanced_mounts_umount_switch.disabled = HidingState.isIgnoring
  tw_disable_custom_font_loading_switch.disabled = HidingState.isIgnoring
  tw_disable_module_loading_traces_hiding_switch.disabled = HidingState.isIgnoring
  tw_disable_frida_traces_hiding_switch.disabled = HidingState.isIgnoring

  const action_card = document.getElementsByClassName('action_card')
  const sliders = document.getElementsByClassName('slider')

  for (let i = 1; i < action_card.length; i++) {
    action_card[i].style.opacity = sliders[i].style.opacity = HidingState.isIgnoring ? 0.5 : 1
  }
}

export async function onceViewAfterUpdate() {

}

export async function load() {
  const tw_ignore_switch = document.getElementById('tw_ignore_switch')
  const tw_disable_prop_spoofing_switch = document.getElementById('tw_disable_prop_spoofing_switch')
  const tw_disable_gsi_hiding_switch = document.getElementById('tw_disable_gsi_hiding_switch')
  const tw_disable_zygote_mountinfo_leak_fixing_switch = document.getElementById('tw_disable_zygote_mountinfo_leak_fixing_switch')
  const tw_disable_maps_hiding_switch = document.getElementById('tw_disable_maps_hiding_switch')
  const tw_disable_revanced_mounts_umount_switch = document.getElementById('tw_disable_revanced_mounts_umount_switch')
  const tw_disable_custom_font_loading_switch = document.getElementById('tw_disable_custom_font_loading_switch')
  const tw_disable_module_loading_traces_hiding_switch = document.getElementById('tw_disable_module_loading_traces_hiding_switch')
  const tw_disable_frida_traces_hiding_switch = document.getElementById('tw_disable_frida_traces_hiding_switch')

  async function _resetStatus() {
    await exec('rm -rf /data/adb/treat_wheel/status')
  }

  function _updateButtonsState() {
    tw_disable_gsi_hiding_switch.disabled = HidingState.isIgnoring
    tw_disable_prop_spoofing_switch.disabled = HidingState.isIgnoring
    tw_disable_zygote_mountinfo_leak_fixing_switch.disabled = HidingState.isIgnoring
    tw_disable_maps_hiding_switch.disabled = HidingState.isIgnoring
    tw_disable_revanced_mounts_umount_switch.disabled = HidingState.isIgnoring
    tw_disable_custom_font_loading_switch.disabled = HidingState.isIgnoring
    tw_disable_module_loading_traces_hiding_switch.disabled = HidingState.isIgnoring
    tw_disable_frida_traces_hiding_switch.disabled = HidingState.isIgnoring

    const action_card = document.getElementsByClassName('action_card')
    const sliders = document.getElementsByClassName('slider')

    for (let i = 1; i < action_card.length; i++) {
      action_card[i].style.opacity = sliders[i].style.opacity = HidingState.isIgnoring ? 0.5 : 1
    }
  }

  utils.addListener(tw_ignore_switch, 'click', async () => {
    HidingState.isIgnoring = !HidingState.isIgnoring

    _updateButtonsState()

    await _writeState(HidingState)
  })

  utils.addListener(tw_disable_prop_spoofing_switch, 'click', async () => {
    HidingState.isSpoofingProps = !HidingState.isSpoofingProps
    _resetStatus()

    await _writeState(HidingState)
  })

  utils.addListener(tw_disable_gsi_hiding_switch, 'click', async () => {
    HidingState.isHidingGSI = !HidingState.isHidingGSI
    _resetStatus()

    await _writeState(HidingState)
  })

  utils.addListener(tw_disable_zygote_mountinfo_leak_fixing_switch, 'click', async () => {
    HidingState.isHidingZygoteLeak = !HidingState.isHidingZygoteLeak
    _resetStatus()

    await _writeState(HidingState)
  })

  utils.addListener(tw_disable_maps_hiding_switch, 'click', async () => {
    HidingState.isMapsHiding = !HidingState.isMapsHiding
    _resetStatus()

    await _writeState(HidingState)
  })

  utils.addListener(tw_disable_revanced_mounts_umount_switch, 'click', async () => {
    HidingState.isRevancedMountsUmount = !HidingState.isRevancedMountsUmount
    _resetStatus()

    await _writeState(HidingState)
  })

  utils.addListener(tw_disable_custom_font_loading_switch, 'click', async () => {
    HidingState.isCustomFontLoading = !HidingState.isCustomFontLoading
    _resetStatus()

    await _writeState(HidingState)
  })

  utils.addListener(tw_disable_module_loading_traces_hiding_switch, 'click', async () => {
    HidingState.isModuleLoadingTracesHiding = !HidingState.isModuleLoadingTracesHiding
    _resetStatus()

    await _writeState(HidingState)
  })

  utils.addListener(tw_disable_frida_traces_hiding_switch, 'click', async () => {
    HidingState.isFridaTracesHiding = !HidingState.isFridaTracesHiding
    _resetStatus()

    await _writeState(HidingState)
  })
}