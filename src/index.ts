import { Plugin, showMessage, confirm, getFrontend, IEventBusMap } from "siyuan";

// import { changelog } from "sy-plugin-changelog";

import widthStyle from "./width.css?inline";
import { SettingUtils } from "./libs/setting-utils";
import { insertStyle, removeStyle } from "./libs/style";
import { ChangeWidthDialog } from "./libs/dialog";
import { throttle } from "./libs/misc";

const InMiniWindow = () => {
    const body: HTMLElement = document.querySelector('body');
    return body.classList.contains('body--window');
}

export default class WidthPlugin extends Plugin {

    iconEle: HTMLElement

    wysiwygMap: Map<string, WeakRef<HTMLElement>> = new Map();

    observer: MutationObserver;
    updateAllPaddingThrottled: () => void;
    onLoadProtyle: ({ detail }: CustomEvent<IEventBusMap['loaded-protyle-static']>) => void;
    onDestroyProtyle: ({ detail }) => void;

    icon: string = `<svg t="1684328935774" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1746" width="32" height="32"><path d="M180 176h-60c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z m724 0h-60c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8zM785.3 504.3L657.7 403.6c-4.7-3.7-11.7-0.4-11.7 5.7V476H378v-62.8c0-6-7-9.4-11.7-5.7L238.7 508.3c-3.7 2.9-3.7 8.5 0 11.3l127.5 100.8c4.7 3.7 11.7 0.4 11.7-5.7V548h268v62.8c0 6 7 9.4 11.7 5.7l127.5-100.8c3.8-2.9 3.8-8.5 0.2-11.4z" p-id="1747"></path></svg>`

    isFullWidth: boolean;

    settingUtils: SettingUtils;
    // width: number;
    // enableMobile: boolean;


    async onload() {

        try {
            await this.init();
        } catch (e) {
            console.error(e);
        }

        // changelog(
        //     this, 'i18n/changelog.md'
        // ).then(({ Dialog }) => {
        //     if (Dialog) {
        //         Dialog.setFont('1rem');
        //         Dialog.setSize({
        //             width: '40%',
        //             height: '25rem'
        //         })
        //     }
        // }).catch((e) => {
        //     console.error(e);
        // });

    }

    async init() {
        await this.initConfig();

        const enableMobile = this.settingUtils.get('enableMobile');
        const width = this.settingUtils.get('width');
        const mode = this.settingUtils.get('mode');

        console.debug(enableMobile, getFrontend());

        //1. 如果是在移动端模式下，且没有开启移动端模式，则不加载
        let forbidMobile = !enableMobile && getFrontend() === "mobile";
        if (forbidMobile) {
            return;
        }

        //如果是在桌面小窗模式下，则默认定死宽度为 92%, 后面有空再优化
        if (InMiniWindow()) {
            insertStyle("plugin-width", widthStyle);
            document.documentElement.style.setProperty('--centerWidth', `94%`);
            return;
        }

        insertStyle("plugin-width", widthStyle);

        document.documentElement.style.setProperty('--centerWidth', `${width}%`);
        this.iconEle = this.addTopBar({
            icon: this.icon,
            title: this.i18n.title,
            position: "left",
            callback: () => {
                if (forbidMobile) {
                    showMessage(this.i18n.disableOnMobile, 2000, 'info');
                    return;
                }

                let isFullwidth = this.checkFullWidth();
                //开启且没有设置过
                if (isFullwidth === null && this.isFullWidth === undefined) {
                    return;
                } else if (this.isFullWidth) {
                    isFullwidth = this.isFullWidth;
                }
                this.isFullWidth = isFullwidth;

                if (isFullwidth) {
                    confirm(this.i18n.title, this.i18n.fullWidth);
                    return;
                }
                new ChangeWidthDialog(this);
            }
        });

        if (mode === 'simple') {
            return;
        }

        console.debug("Width Plugin: Bind JS Event");

        this.wysiwygMap = new Map();

        //思源会经常更改wysiwyg的padding，所以需要监听变化，一旦变化就重新设置
        //updateAllPadding 本身又会触发 MutationObserver，所以需要节流
        this.updateAllPaddingThrottled = throttle(this.updateAllPadding.bind(this), 2000);
        this.observer = new MutationObserver(() => {
            this.updateAllPaddingThrottled();
        });

        this.onLoadProtyle = (({ detail }: CustomEvent<IEventBusMap['loaded-protyle-static']>) => {
            console.debug("onLoadProtyle", detail);
            const protyle = detail?.protyle;
            let parent = (protyle.element as HTMLElement).parentElement;
            //考虑到性能问题，只对主编辑器进行监听
            if (!parent.classList.contains("layout-tab-container")) {
                console.debug("Not a tab document");
                return;
            }
            const layout = parent?.parentElement?.parentElement?.parentElement;
            if (layout === undefined || !layout.classList.contains("layout__center")) {
                console.debug("Not center layout");
                return;
            }

            let id = protyle?.id;
            if (!id) {
                return;
            }
            console.debug(`Load Protyle with ID = ${id}`)
            if (this.wysiwygMap.has(id)) {
                return;
            }
            let wysiwyg = new WeakRef(protyle.wysiwyg.element);
            this.wysiwygMap.set(id, wysiwyg);

            console.debug("Current WysiwygMap", this.wysiwygMap);

            this.updateWysiwygPadding(wysiwyg);
            //如果当前聚焦的主编辑器宽度变了, 就同步更改所有 protyle 的 padding
            this.observer.observe(protyle.wysiwyg.element, {
                childList: false,
                attributes: true,
                characterData: false,
                subtree: false
            });
        }).bind(this);

        this.onDestroyProtyle = (({ detail }) => {
            console.debug("onDestroyProtyle", detail);

            let id = detail?.protyle?.id;
            console.debug("Destroy Protyle ID = ", id);
            if (this.wysiwygMap.has(id)) {
                this.wysiwygMap.delete(id);
                console.debug("Current WysiwygMap", this.wysiwygMap);
            }

        }).bind(this);

        this.eventBus.on("loaded-protyle-static", this.onLoadProtyle);
        this.eventBus.on("destroy-protyle", this.onDestroyProtyle);

        window.addEventListener('beforeunload', () => {
            this.observer?.disconnect();
            this.eventBus?.off("loaded-protyle-static", this.onLoadProtyle);
            this.eventBus?.off("destroy-protyle", this.onDestroyProtyle);
            this.wysiwygMap.clear();
        });
    }

    onLayoutReady() {
        console.groupCollapsed("Width Plugin: ListenInitialProtyles");
        let protyleList: NodeListOf<HTMLElement> = document.querySelectorAll("#layouts div.layout-tab-container > div.protyle");
        for (let protyle of protyleList) {
            let dataId = protyle.getAttribute("data-id");
            if (!dataId) {
                continue;
            }
            if (this.wysiwygMap.has(dataId)) {
                console.log("Already has", dataId);
                continue;
            }
            let wysiwyg = protyle.querySelector("div.protyle-wysiwyg") as HTMLElement;
            let ref = new WeakRef(wysiwyg);
            this.wysiwygMap.set(dataId, ref);
            console.log("Add", dataId, ref);
        }
        this.updateAllPadding();
        console.groupEnd();
    }

    updateAllPadding() {
        let faildKeys: string[] = [];
        for (let [key, value] of this.wysiwygMap) {
            let flag = this.updateWysiwygPadding(value);
            if (!flag) {
                faildKeys.push(key);
            }
        }
        for (let key of faildKeys) {
            this.wysiwygMap.delete(key);
        }
    }

    /**
     * 更新wysiwyg的内联 padding 样式，以便让 wysiwyg 当中的 iframe 的最大宽度可以和 protyle 的宽度一致
     */
    updateWysiwygPadding(wysiwyg: WeakRef<HTMLElement>) {
        let ele = wysiwyg?.deref();
        if (ele) {
            let parentElement = ele.parentElement;
            if (!parentElement) {
                return;
            }
            let fullWidth = parentElement.getAttribute("data-fullwidth");
            if (fullWidth === 'true') {
                //full width 下不需要设置 padding
                return;
            }

            let parentWidth = ele.parentElement.clientWidth;
            //被关闭的 tab 的 parentElement 宽度为 0
            if (parentWidth === 0) {
                parentWidth = ele?.parentElement?.parentElement?.parentElement?.clientWidth;
                if (!parentWidth) {
                    return;
                }
                //测试发现 tab container 和 wysiwyg 的宽度相差 10px
                parentWidth -= 10;
            }

            const width = this.settingUtils.get('width');
            let padding = parentWidth * (1 - width / 100) / 2;
            ele.style.setProperty('padding-left', `${padding}px`);
            ele.style.setProperty('padding-right', `${padding}px`);
            // console.log("updateWysiwygPadding", padding);
            if (padding < 16) {
                document.documentElement.style.setProperty('--refcountRight', `-${padding}px`);
            } else {
                document.documentElement.style.setProperty('--refcountRight', `-16px`);
            }
            return true;
        }
        return false;
    }

    async initConfig() {

        this.settingUtils = new SettingUtils(this, 'config', async (data) => {
            document.documentElement.style.setProperty('--centerWidth', `${data.width}%`);
            this.settingUtils.save();

        }, '700px', '500px');
        this.settingUtils.addItem({
            key: 'width',
            value: 70,
            type: 'slider',
            title: this.i18n.setting.width.title,
            description: this.i18n.setting.width.description,
            slider: {
                min: 40,
                max: 100,
                step: 1
            }
        });
        this.settingUtils.addItem({
            key: 'enableMobile',
            value: false,
            type: 'checkbox',
            title: this.i18n.setting.enableMobile.title,
            description: this.i18n.setting.enableMobile.description,
        });
        this.settingUtils.addItem({
            key: 'mode',
            value: 'simple',
            type: 'select',
            title: this.i18n.setting.mode.title,
            description: this.i18n.setting.mode.description,
            options:{
                simple: this.i18n.setting.mode.simple,
                advanced: this.i18n.setting.mode.advanced
            }
        });

        await this.settingUtils.load();
    }

    private checkFullWidth() {
        let content = document.querySelector("div.protyle-content");

        if (!content) {
            return null;
        }

        let attr = content.getAttribute("data-fullwidth");
        //has attr data-fullwidth
        if (attr === 'true') {
            this.isFullWidth = true;
            return true;
        } else {
            this.isFullWidth = false;
            return false;
        }
    }

    onunload() {
        removeStyle("plugin-width");
        this.wysiwygMap = null;
        this.eventBus.off("loaded-protyle-static", this.onLoadProtyle);
        this.eventBus?.off("destroy-protyle", this.onDestroyProtyle);
        this.observer.disconnect();
        this.settingUtils.save();
    }
}
