#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <errno.h>

#include <unistd.h>
#include <android/log.h>

/* INFO: Cross-dependency */
#include "../lib/utils.h"
#include "utils.h"

#include "api/system_properties.h"

int main(void) {
  FILE *fp = fopen("/data/adb/treat_wheel/state", "r");
  if (!fp) {
    PLOGE("Open state file");

    return 1;
  }

  struct module_state state = { 0 };

  char line[128];
  while (fgets(line, sizeof(line), fp)) {
    if (str_starts_with(line, "ignoring=")) {
      state.is_ignoring = strncmp(line + strlen("ignoring="), "true", strlen("true")) == 0;

      LOGI("Found ignoring state: %d", state.is_ignoring);
    } else if (str_starts_with(line, "disable_prop_spoofing=")) {
      state.disable_prop_spoofing = strncmp(line + strlen("disable_prop_spoofing="), "true", strlen("true")) == 0;

      LOGI("Found disable_prop_spoofing state: %d", state.disable_prop_spoofing);
    } else if (str_starts_with(line, "disable_gsi_hiding=")) {
      state.disable_gsi_hiding = strncmp(line + strlen("disable_gsi_hiding="), "true", strlen("true")) == 0;

      LOGI("Found disable_gsi_hiding state: %d", state.disable_gsi_hiding);
    } else if (str_starts_with(line, "disable_zygote_mountinfo_leak_fixing=")) {
      state.disable_zygote_mountinfo_leak_fixing = strncmp(line + strlen("disable_zygote_mountinfo_leak_fixing="), "true", strlen("true")) == 0;

      LOGI("Found disable_zygote_mountinfo_leak_fixing state: %d", state.disable_zygote_mountinfo_leak_fixing);
    } else if (str_starts_with(line, "disable_maps_hiding=")) {
      state.disable_maps_hiding = strncmp(line + strlen("disable_maps_hiding="), "true", strlen("true")) == 0;

      LOGI("Found disable_maps_hiding state: %d", state.disable_maps_hiding);
    } else if (str_starts_with(line, "disable_revanced_mounts_umount=")) {
      state.disable_revanced_mounts_umount = strncmp(line + strlen("disable_revanced_mounts_umount="), "true", strlen("true")) == 0;

      LOGI("Found disable_revanced_mounts_umount state: %d", state.disable_revanced_mounts_umount);
    } else if (str_starts_with(line, "disable_custom_font_loading=")) {
      state.disable_custom_font_loading = strncmp(line + strlen("disable_custom_font_loading="), "true", strlen("true")) == 0;

      LOGI("Found disable_custom_font_loading state: %d", state.disable_custom_font_loading);
    } else if (str_starts_with(line, "disable_module_loading_traces_hiding=")) {
      state.disable_module_loading_traces_hiding = strncmp(line + strlen("disable_module_loading_traces_hiding="), "true", strlen("true")) == 0;

      LOGI("Found disable_module_loading_traces_hiding state: %d", state.disable_module_loading_traces_hiding);
    } else if (str_starts_with(line, "disable_frida_traces_hiding=")) {
      state.disable_frida_traces_hiding = strncmp(line + strlen("disable_frida_traces_hiding="), "true", strlen("true")) == 0;

      LOGI("Found disable_frida_traces_hiding state: %d", state.disable_frida_traces_hiding);
    }
  }

  fclose(fp);

  if (state.is_ignoring) {
    LOGI("Module is set to be ignoring, skipping prop spoofing.");

    return 0;
  }

  if (state.disable_prop_spoofing) {
    LOGI("Prop spoofing is disabled, skipping.");

    return 0;
  }

  init_prop();

  while (true) {
    if (check_prop_equal("sys.boot_completed", "1")) break;
    else sleep(1);
  }

  /* INFO: To fix the shit other modules caused */
  sleep(5);

  set_prop_if_diff("ro.boot.verifiedbootstate", "green");
  set_prop_if_diff("ro.boot.veritymode", "enforcing");
  set_prop_if_diff("ro.boot.vbmeta.device_state", "locked");

  /* INFO: Magisk-specific */
  set_prop_if_match("ro.boot.mode", "unknown", "recovery");
  set_prop_if_match("ro.bootmode", "unknown", "recovery");
  set_prop_if_match("vendor.boot.mode", "unknown", "recovery");

  set_prop_if_diff("ro.build.selinux", "1");
  set_prop_if_diff("ro.boot.selinux", "enforcing");
  // TODO: enforcing file modify

  /* INFO: Sensitive props by PIFork */

  /* INFO: Samsung */
  set_prop_if_diff("ro.boot.warranty_bit", "0");
  set_prop_if_diff("ro.vendor.boot.warranty_bit", "0");
  set_prop_if_diff("ro.vendor.warranty_bit", "0");
  set_prop_if_diff("ro.warranty_bit", "0");

  /* INFO: Realme */
  set_prop_if_diff("ro.boot.realmebootstate", "green");

  /* INFO: OnePlus */
  set_prop_if_diff("ro.is_ever_orange", "0");

  /* INFO: Microsoft START */
  set_prop_if_diff("ro.bootimage.build.tags", "release-keys");
  set_prop_if_diff("ro.build.tags", "release-keys");
  set_prop_if_diff("ro.odm.build.tags", "release-keys");
  set_prop_if_diff("ro.product.build.tags", "release-keys");
  set_prop_if_diff("ro.system.build.tags", "release-keys");
  set_prop_if_diff("ro.system_dlkm.build.tags", "release-keys");
  set_prop_if_diff("ro.system_ext.build.tags", "release-keys");
  set_prop_if_diff("ro.vendor.build.tags", "release-keys");
  set_prop_if_diff("ro.vendor_dlkm.build.tags", "release-keys");
  /* INFO: Microsoft END */

  /* INFO: Others START */
  set_prop_if_diff("ro.bootimage.build.type", "user");
  set_prop_if_diff("ro.build.type", "user");
  set_prop_if_diff("ro.odm.build.type", "user");
  set_prop_if_diff("ro.product.build.type", "user");
  set_prop_if_diff("ro.system.build.type", "user");
  set_prop_if_diff("ro.system_dlkm.build.type", "user");
  set_prop_if_diff("ro.system_ext.build.type", "user");
  set_prop_if_diff("ro.vendor.build.type", "user");
  set_prop_if_diff("ro.vendor_dlkm.build.type", "user");
  /* INFO: Others END */

  delete_prop_if_exist("init.svc.adb_root");
  delete_prop_if_exist("service.adb.root");
  set_prop_if_diff("ro.adb.secure", "1");
  set_prop_if_diff("ro.debuggable", "0");
  set_prop_if_diff("ro.force.debuggable", "0");
  set_prop_if_diff("ro.secure", "1");

  /* INFO: SafetyNet/Play Integrity + OEM */
  set_prop_if_diff("ro.secureboot.lockstate", "locked");

  set_prop("ro.boot.flash.locked", "1");
  set_prop_if_diff("ro.boot.realme.lockstate", "1");

  set_prop_if_diff("ro.boot.vbmeta.device_state", "locked");

  set_prop_if_diff("vendor.boot.verifiedbootstate", "green");

  set_prop_if_diff("sys.oem_unlock_allowed", "0");

  compact_props();
  fix_serials();

  __android_log_print(ANDROID_LOG_INFO, "Treat Wheel", "has set and adjusted system properties successfully.\n");
}
