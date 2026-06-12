BUILD_PATH = build/src
ZYGISK_PATH = $(BUILD_PATH)/zygisk
CMD_PATH = $(BUILD_PATH)/cmd

CFILES_ZYGISK = src/lib/elf_util.c src/lib/hiding.c src/lib/main.c src/lib/rz_daemon.c src/lib/utils.c
CFILES_CMD = src/cmd/main.c src/cmd/utils.c src/lib/utils.c src/system_properties/src/*.c

CFLAGS = -llog -fvisibility=hidden -fvisibility-inlines-hidden -Wpedantic     \
         -Wall -Wextra -Werror -Wformat -Wuninitialized -Wshadow -std=c99     \
         -Wno-unused-function -D_GNU_SOURCE -fPIC -Wno-c2x-extensions         \
         -Wno-gnu-zero-variadic-macro-arguments                               \
		 -Wno-gnu-statement-expression-from-macro-expansion

.PHONY: all build debug pushToDevice installKsuOnly installApatchOnly installKsu installApatch installKsuDebug installApatchDebug updateWebUI

ifeq ($(IS_GITHUB_ACTION),true)
CC := $(ANDROID_NDK_HOME)/toolchains/llvm/prebuilt/linux-x86_64/bin/clang
STRIP := $(ANDROID_NDK_HOME)/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip
CLANG := $(CC)
else
ANDROID_HOME := $(HOME)/Android/Sdk
CC := $(ANDROID_HOME)/ndk/29.0.14206865/toolchains/llvm/prebuilt/linux-x86_64/bin/clang
STRIP := $(ANDROID_HOME)/ndk/29.0.14206865/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip
CLANG := $(CC)
endif

all: CFLAGS += -flto=full -s -Wl,--strip-all -Wl,--exclude-libs,ALL -Wl,--as-needed 
all: build

build:
	@echo Creating zygisk directories...
	@mkdir -p $(ZYGISK_PATH) > /dev/null
	@mkdir -p $(ZYGISK_PATH)/arm64-v8a > /dev/null
	@mkdir -p $(ZYGISK_PATH)/armeabi-v7a > /dev/null
	@mkdir -p $(ZYGISK_PATH)/x64 > /dev/null
	@mkdir -p $(ZYGISK_PATH)/x86 > /dev/null

	@echo Creating command-line directories...
	@mkdir -p $(CMD_PATH) > /dev/null
	@mkdir -p $(CMD_PATH)/arm64-v8a > /dev/null
	@mkdir -p $(CMD_PATH)/armeabi-v7a > /dev/null
	@mkdir -p $(CMD_PATH)/x64 > /dev/null
	@mkdir -p $(CMD_PATH)/x86 > /dev/null

	@echo Compiling zygisk module...
	@$(CLANG) --target=aarch64-linux-android34    -fPIC -DIS_ZYGISK_LIB $(CFILES_ZYGISK) $(CFLAGS) -nostartfiles -shared -o $(ZYGISK_PATH)/arm64-v8a/libexample.so
	@$(CLANG) --target=armv7a-linux-androideabi34 -fPIC -DIS_ZYGISK_LIB $(CFILES_ZYGISK) $(CFLAGS) -nostartfiles -shared -o $(ZYGISK_PATH)/armeabi-v7a/libexample.so
	@$(CLANG) --target=x86_64-linux-android34     -fPIC -DIS_ZYGISK_LIB $(CFILES_ZYGISK) $(CFLAGS) -nostartfiles -shared -o $(ZYGISK_PATH)/x64/libexample.so
	@$(CLANG) --target=i686-linux-android34       -fPIC -DIS_ZYGISK_LIB $(CFILES_ZYGISK) $(CFLAGS) -nostartfiles -shared -o $(ZYGISK_PATH)/x86/libexample.so

	@echo Stripping zygisk module...
	@$(STRIP) --strip-all $(ZYGISK_PATH)/arm64-v8a/libexample.so
	@$(STRIP) --strip-all $(ZYGISK_PATH)/armeabi-v7a/libexample.so
	@$(STRIP) --strip-all $(ZYGISK_PATH)/x64/libexample.so
	@$(STRIP) --strip-all $(ZYGISK_PATH)/x86/libexample.so

	@echo Compiling command-line assistance...
	@$(CLANG) --target=aarch64-linux-android34    -fPIC -DIS_CMD $(CFILES_CMD) $(CFLAGS) -Isrc/system_properties/include -DUTILS_NO_SSL -o $(CMD_PATH)/arm64-v8a/treat-wheel
	@$(CLANG) --target=armv7a-linux-androideabi34 -fPIC -DIS_CMD $(CFILES_CMD) $(CFLAGS) -Isrc/system_properties/include -DUTILS_NO_SSL -o $(CMD_PATH)/armeabi-v7a/treat-wheel
	@$(CLANG) --target=x86_64-linux-android34     -fPIC -DIS_CMD $(CFILES_CMD) $(CFLAGS) -Isrc/system_properties/include -DUTILS_NO_SSL -o $(CMD_PATH)/x64/treat-wheel
	@$(CLANG) --target=i686-linux-android34       -fPIC -DIS_CMD $(CFILES_CMD) $(CFLAGS) -Isrc/system_properties/include -DUTILS_NO_SSL -o $(CMD_PATH)/x86/treat-wheel

	@echo Stripping command-line assistance...
	@$(STRIP) --strip-all $(CMD_PATH)/arm64-v8a/treat-wheel
	@$(STRIP) --strip-all $(CMD_PATH)/armeabi-v7a/treat-wheel
	@$(STRIP) --strip-all $(CMD_PATH)/x64/treat-wheel
	@$(STRIP) --strip-all $(CMD_PATH)/x86/treat-wheel

	@echo Copying module.prop file...
	@cp $(BUILD_PATH)/../module.prop $(BUILD_PATH)/module.prop

	@echo Creating zip...

	@rm -rf $(BUILD_PATH)/webroot
	@cp -r src/webroot $(BUILD_PATH)

	@if [ "$(IS_GITHUB_ACTION)" = "true" ]; then \
		echo Detected CI environment. Modifying web UI for CI build...; \
		sed -i 's/ display: none;//g' $(BUILD_PATH)/webroot/js/pages/home/index.html; \
	fi

	@rm -rf ../build/BreWheel.zip
	@(cd $(BUILD_PATH) && zip -r ../BreWheel.zip .) > /dev/null

clean:
	@echo Cleaning build artifacts...
	@rm -rf $(BUILD_PATH)/cmd
	@rm -rf $(BUILD_PATH)/zygisk
	@rm -rf $(BUILD_PATH)/webroot
	@rm -rf ../build/BreWheel.zip > /dev/null

debug: CFLAGS += -DDEBUG -O0 -g
debug: build

pushToDevice:
	@echo Pushing to device...
	@adb push build/BreWheel.zip /data/local/tmp/BreWheel.zip

installKsuOnly: pushToDevice
	@echo Installing with KSU...
	@adb shell su -c /data/adb/ksu/bin/ksud module install /data/local/tmp/BreWheel.zip
	@echo Rebooting...
	@adb reboot

installApatchOnly: pushToDevice
	@echo Installing with Apatch...
	@adb shell su -c /data/adb/apd module install /data/local/tmp/BreWheel.zip
	@echo Rebooting...
	@adb reboot

installKsu: all
installKsu: installKsuOnly

installApatch: all
installApatch: installApatchOnly

installKsuDebug: debug
installKsuDebug: installKsuOnly

installApatchDebug: debug
installApatchDebug: installApatchOnly

updateWebUI:
	@echo Updating web UI...
	@adb shell su -c "rm -rf /data/local/tmp/webroot"
	@adb push src/webroot /data/local/tmp/webroot
	@adb shell su -c "rm -rf /data/adb/modules/treat_wheel/webroot"
	@adb shell su -c "cp -r /data/local/tmp/webroot /data/adb/modules/treat_wheel"