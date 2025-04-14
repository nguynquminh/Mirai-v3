module.exports.config = {
    name: "event",
    version: "1.0.3",
    hasPermssion: 2,
    credits: "Mirai Team",
    description: "Manage and control all bot modules",
    commandCategory: "system",
    usages: "[load/unload/loadAll/unloadAll/info] [module name]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "child_process": "",
        "path": ""
    }
};

module.exports.languages = {
    "vi": {
        "nameExist": "Tên module bị trùng với một module mang cùng tên khác!",
        "notFoundLanguage": "Module %1 không hỗ trợ ngôn ngữ của bạn",
        "notFoundPackage": "Không tìm thấy package %1 hỗ trợ cho module %2, tiến hành cài đặt...",
        "cantInstallPackage": "Không thể cài đặt package %1 cho module %2, lỗi: %3",
        "loadedPackage": "Đã tải thành công toàn bộ package cho module %1",
        "loadedConfig": "Đã tải thành công config cho module %1",
        "cantLoadConfig": "Không thể tải config của module %1, lỗi: %2",
        "cantOnload": "Không thể khởi chạy setup của module %1, lỗi: %1",
        "successLoadModule": "✅ Đã tải thành công module %1",
        "failLoadModule": "❌ Không thể tải thành công module %1, lỗi: %2",
        "moduleError": "⚠️ Có lỗi xảy ra khi tải các module sau: \n\n%1",
        "unloadSuccess": "✅ Đã hủy tải module %1",
        "unloadedAll": "✅ Đã hủy tải %1 module",
        "missingInput": "⚠️ Tên module không được để trống!",
        "moduleNotExist": "⚠️ Module bạn nhập không tồn tại!",
        "dontHavePackage": "Không có",
        "infoModule": "📝 Thông tin module %1:\n👨‍💻 Tác giả: %2\n🔄 Phiên bản: %3\n📦 Package yêu cầu: %4",
        "summary": "📊 Tổng kết: %1/%2 module được tải thành công"
    },
    "en": {
        "nameExist": "Module's name is similar to another module!",
        "notFoundLanguage": "Module %1 does not support your language",
        "notFoundPackage": "Can't find package %1 for module %2, installing...",
        "cantInstallPackage": "Can't install package %1 for module %2, error: %3",
        "loadedPackage": "Successfully loaded package for module %1",
        "loadedConfig": "Successfully loaded config for module %1",
        "cantLoadConfig": "Can't load config for module %1, error: %2",
        "cantOnload": "Can't load setup for module %1, error: %1",
        "successLoadModule": "✅ Successfully loaded module %1",
        "failLoadModule": "❌ Failed to load module %1, error: %2",
        "moduleError": "⚠️ Errors occurred while loading these modules: \n\n%1",
        "unloadSuccess": "✅ Successfully unloaded module %1",
        "unloadedAll": "✅ Successfully unloaded %1 modules",
        "missingInput": "⚠️ Module name can't be empty!",
        "moduleNotExist": "⚠️ Module doesn't exist!",
        "dontHavePackage": "None",
        "infoModule": "📝 Module %1 info:\n👨‍💻 Author: %2\n🔄 Version: %3\n📦 Required packages: %4",
        "summary": "📊 Summary: %1/%2 modules loaded successfully"
    }
};

module.exports.loadCommand = function ({ moduleList, threadID, messageID, getText }) {
    const { execSync } = require('child_process');
    const { writeFileSync, unlinkSync, readFileSync } = require('fs-extra');
    const { join } = require('path');
    const { configPath, mainPath, api } = global.client;
    const logger = require(join(mainPath, 'utils', 'log'))('EventManager');
    
    // Load package.json dependencies
    const packageJson = JSON.parse(readFileSync(join(global.client.clientPath, 'package.json')));
    const listPackage = packageJson.dependencies || {};
    const builtinModules = require('module').builtinModules;

    let errorList = [];
    
    // Create temp config to avoid caching issues
    delete require.cache[require.resolve(configPath)];
    const configValue = require(configPath);
    writeFileSync(configPath + '.temp', JSON.stringify(configValue, null, 4), 'utf8');

    for (const nameModule of moduleList) {
        try {
            const modulePath = join(__dirname, '..', 'events', nameModule + '.js');
            
            // Clear module cache
            delete require.cache[require.resolve(modulePath)];
            const eventModule = require(modulePath);

            // Validate module structure
            if (!eventModule.config || !eventModule.run) {
                throw new Error(getText("nameExist"));
            }

            const { config } = eventModule;
            
            // Handle dependencies
            if (config.dependencies && typeof config.dependencies === 'object') {
                for (const packageName in config.dependencies) {
                    try {
                        if (!global.nodemodule.hasOwnProperty(packageName)) {
                            if (listPackage.hasOwnProperty(packageName) || builtinModules.includes(packageName)) {
                                global.nodemodule[packageName] = require(packageName);
                            } else {
                                const moduleDir = join(global.client.clientPath, 'node_modules', packageName);
                                global.nodemodule[packageName] = require(moduleDir);
                            }
                        }
                    } catch (error) {
                        logger.warn(getText("notFoundPackage", packageName, config.name));
                        
                        // Try to install missing package
                        try {
                            const packageVersion = config.dependencies[packageName];
                            const installCommand = `npm --prefix "${join(global.client.clientPath, 'node_modules')}" install ${packageName}${packageVersion && packageVersion !== '*' ? '@' + packageVersion : ''}`;
                            execSync(installCommand, {
                                stdio: 'inherit',
                                env: process.env,
                                shell: true
                            });
                            
                            // Retry loading after install
                            global.nodemodule[packageName] = require(packageName);
                        } catch (installError) {
                            throw new Error(getText("cantInstallPackage", packageName, config.name, installError));
                        }
                    }
                }
                logger.info(getText("loadedPackage", config.name));
            }

            // Handle environment config
            if (config.envConfig && typeof config.envConfig === 'object') {
                try {
                    for (const key in config.envConfig) {
                        if (!global.config[config.name]) {
                            global.config[config.name] = {};
                        }
                        global.config[config.name][key] = config.envConfig[key] || '';
                    }
                    logger.info(getText("loadedConfig", config.name));
                } catch (error) {
                    throw new Error(getText("cantLoadConfig", config.name, JSON.stringify(error)));
                }
            }

            // Execute onLoad if exists
            if (eventModule.onLoad) {
                try {
                    eventModule.onLoad({ api });
                } catch (error) {
                    throw new Error(getText("cantOnload", config.name, JSON.stringify(error)));
                }
            }

            // Register the module
            if (configValue.eventDisabled.includes(nameModule + '.js') || 
                global.config.eventDisabled.includes(nameModule)) {
                configValue.eventDisabled.splice(configValue.eventDisabled.indexOf(nameModule + '.js'), 1);
                global.config.eventDisabled.splice(global.config.eventDisabled.indexOf(nameModule), 1);
            }

            global.client.events.set(config.name, eventModule);
            logger.success(getText("successLoadModule", config.name));
        } catch (error) {
            errorList.push(getText("failLoadModule", nameModule, error.message));
            logger.error(`Failed to load module ${nameModule}:`, error);
        }
    }

    // Send results
    if (errorList.length > 0) {
        api.sendMessage(getText("moduleError", errorList.join('\n\n')), threadID, messageID);
    }
    
    const successCount = moduleList.length - errorList.length;
    api.sendMessage(getText("summary", successCount, moduleList.length), threadID, messageID);

    // Clean up
    writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8');
    unlinkSync(configPath + '.temp');
};

module.exports.unloadModule = function ({ moduleList, threadID, messageID, getText }) {
    const { writeFileSync, unlinkSync } = require('fs-extra');
    const { configPath, api } = global.client;
    const logger = require(join(global.client.mainPath, 'utils', 'log'))('EventManager');

    // Create temp config to avoid caching issues
    delete require.cache[require.resolve(configPath)];
    const configValue = require(configPath);
    writeFileSync(configPath + '.temp', JSON.stringify(configValue, null, 4), 'utf8');

    for (const nameModule of moduleList) {
        try {
            // Remove module from events
            global.client.events.delete(nameModule);
            
            // Disable in config
            if (!configValue.eventDisabled.includes(nameModule + '.js')) {
                configValue.eventDisabled.push(nameModule + '.js');
            }
            
            if (!global.config.eventDisabled.includes(nameModule)) {
                global.config.eventDisabled.push(nameModule);
            }
            
            logger.info(getText("unloadSuccess", nameModule));
        } catch (error) {
            logger.error(`Failed to unload module ${nameModule}:`, error);
        }
    }

    // Save config and clean up
    writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8');
    unlinkSync(configPath + '.temp');
    
    api.sendMessage(getText("unloadedAll", moduleList.length), threadID, messageID);
};

module.exports.run = function ({ event, args, api, getText }) {
    const { readdirSync } = require('fs-extra');
    const { join } = require('path');
    const { threadID, messageID } = event;
    
    if (args.length === 0) {
        return global.utils.throwError(this.config.name, threadID, messageID);
    }

    const action = args[0].toLowerCase();
    const moduleList = args.slice(1).filter(Boolean);

    switch (action) {
        case "load": {
            if (moduleList.length === 0) {
                return api.sendMessage(getText("missingInput"), threadID, messageID);
            }
            return this.loadCommand({ moduleList, threadID, messageID, getText });
        }
        
        case "unload": {
            if (moduleList.length === 0) {
                return api.sendMessage(getText("missingInput"), threadID, messageID);
            }
            return this.unloadModule({ moduleList, threadID, messageID, getText });
        }
        
        case "loadall": {
            const modules = readdirSync(join(global.client.mainPath, "modules", "events"))
                .filter(file => file.endsWith(".js") && !file.includes('example'))
                .map(file => file.replace(/\.js$/, ''));
            
            return this.loadCommand({ 
                moduleList: modules, 
                threadID, 
                messageID, 
                getText 
            });
        }
        
        case "unloadall": {
            const modules = readdirSync(join(global.client.mainPath, "modules", "events"))
                .filter(file => file.endsWith(".js") && !file.includes('example'))
                .map(file => file.replace(/\.js$/, ''));
            
            return this.unloadModule({ 
                moduleList: modules, 
                threadID, 
                messageID, 
                getText 
            });
        }
        
        case "info": {
            const moduleName = moduleList.join("") || "";
            const eventModule = global.client.events.get(moduleName);
            
            if (!eventModule) {
                return api.sendMessage(getText("moduleNotExist"), threadID, messageID);
            }
            
            const { name, version, credits, dependencies } = eventModule.config;
            const packages = Object.keys(dependencies || {}).join(", ") || getText("dontHavePackage");
            
            return api.sendMessage(
                getText("infoModule", name.toUpperCase(), credits, version, packages),
                threadID,
                messageID
            );
        }
        
        default: {
            return global.utils.throwError(this.config.name, threadID, messageID);
        }
    }
};