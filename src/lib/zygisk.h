#ifndef ZYGISK_H
#define ZYGISK_H

#include <jni.h>

extern int cfd;

struct AppSpecializeArgs {
  jint *uid;
  jint *gid;
  jintArray *gids;
  jint *runtime_flags;
  jobjectArray *rlimits;
  jint *mount_external;
  jstring *se_info;
  jstring *nice_name;
  jstring *instruction_set;
  jstring *app_data_dir;

  jintArray *const fds_to_ignore;
  jboolean *const is_child_zygote;
  jboolean *const is_top_app;
  jobjectArray *const pkg_data_info_list;
  jobjectArray *const whitelisted_data_info_list;
  jboolean *const mount_data_dirs;
  jboolean *const mount_storage_dirs;

  jboolean *const mount_sysprop_overrides;
};

struct ServerSpecializeArgs {
  jint *uid;
  jint *gid;
  jintArray *gids;
  jint *runtime_flags;
  jlong *permitted_capabilities;
  jlong *effective_capabilities;
};

enum zygisk_options {
  FORCE_DENYLIST_UNMOUNT = 0,
  DLCLOSE_MODULE_LIBRARY = 1,
};

enum process_flags {
  PROCESS_GRANTED_ROOT = (1u << 0),
  PROCESS_ON_DENYLIST = (1u << 1),

  PROCESS_IS_MANAGER = (1u << 27),
  PROCESS_ROOT_IS_KSU = (1u << 29),
  PROCESS_IS_SYS_UI = (int)(1u << 31),

  PRIVATE_MASK = PROCESS_IS_SYS_UI
};

struct module_abi {
  long api_version;
  void *impl;

  void (*preAppSpecialize)(void *, struct AppSpecializeArgs *);
  void (*postAppSpecialize)(void *, const struct AppSpecializeArgs *);
  void (*preServerSpecialize)(void *, struct ServerSpecializeArgs *);
  void (*postServerSpecialize)(void *, const struct ServerSpecializeArgs *);
};

struct api_table {
  void *impl;
  bool (*registerModule)(struct api_table *, struct module_abi *);

  void (*hookJniNativeMethods)(JNIEnv *, const char *, JNINativeMethod *, int);
  void (*pltHookRegister)(dev_t, ino_t, const char *, void *, void **);
  bool (*exemptFd)(int);
  bool (*pltHookCommit)(void);
  int  (*connectCompanion)(void *impl);
  void (*setOption)(void *impl, enum zygisk_options);
  int  (*getModuleDir)(void *impl);
  enum process_flags (*getFlags)(void *impl);
};

__attribute__((visibility("default")))
void zygisk_module_entry(struct api_table *, JNIEnv *);

__attribute__((visibility("default")))
void zygisk_companion_entry(int);

#endif /* ZYGISK_H */
