import { Plugin, Dialog, showMessage, confirm, getFrontend } from "siyuan";

import { changelog } from "sy-plugin-changelog";

import widthStyle from "./width.css?inline";

class ChangeWidthDialog extends Dialog {

    value: number;

    constructor(plugin: WidthPlugin) {
        let dom = `
        <div id="plugin-width__setting">
            <div style="padding-bottom: 1rem">
                40%
                <input
                    class="b3-slider fn__size200 b3-tooltips b3-tooltips__s"
                    max="100" min="40" step="1" type="range" value="${plugin.width}"
                    aria-label="${plugin.width}%" id=""
                />
                100%
            </div>
            <label class="fn__flex">
                <div class="fn__flex-1">${plugin.i18n.setEnableMobile}</div> 
                <span class="fn__space"></span>
                <input class="b3-switch fn__flex-center" type="checkbox">
            </label>
        </div>
        `
        super({
            title: `${plugin.i18n.title}: ${plugin.width}%`,
            content: dom,
            destroyCallback: () => {
                plugin.save();
                plugin.updateAllPadding();
                console.log("Write width", plugin.width);
            }
        });
        let header: HTMLDivElement = this.element.querySelector('.b3-dialog__header');
        let body: HTMLDivElement = this.element.querySelector('.b3-dialog__body');
        body.style.padding = "1rem";
        header.style.textAlign = "center";

        const inputCenterWidth: HTMLInputElement = this.element.querySelector('input.b3-slider');
        inputCenterWidth.addEventListener("input", (e) => {
            plugin.width = parseInt((e.target as HTMLInputElement).value);
            header.innerText = `${plugin.i18n.title}: ${plugin.width}%`;
            inputCenterWidth.setAttribute("aria-label", `${plugin.width}%`);
            document.documentElement.style.setProperty('--centerWidth', `${plugin.width}%`);
        });

        const inputEnableMobile: HTMLInputElement = this.element.querySelector('input.b3-switch');
        inputEnableMobile.checked = plugin.enableMobile;
        inputEnableMobile.addEventListener("change", (e) => {
            plugin.enableMobile = (e.target as HTMLInputElement).checked;
        });
    }
}

function insertStyle(id: string, style: string) {
    let styleEle = document.createElement("style");
    styleEle.id = id;
    styleEle.innerHTML = style;
    document.head.appendChild(styleEle);
}

function removeStyle(id: string) {
    let styleEle = document.getElementById(id);
    if (styleEle) {
        styleEle.remove();
    }
}

export default class WidthPlugin extends Plugin {

    width: number;
    enableMobile: boolean;
    iconEle: HTMLElement

    wysiwygMap: Map<string, WeakRef<HTMLElement>> = new Map();

    observer: MutationObserver;
    onLoadProtyle: ({ detail }) => void;
    onDestroyProtyle: ({ detail }) => void;

    icon: string = `<svg t="1684328935774" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1746" width="32" height="32"><path d="M180 176h-60c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z m724 0h-60c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8zM785.3 504.3L657.7 403.6c-4.7-3.7-11.7-0.4-11.7 5.7V476H378v-62.8c0-6-7-9.4-11.7-5.7L238.7 508.3c-3.7 2.9-3.7 8.5 0 11.3l127.5 100.8c4.7 3.7 11.7 0.4 11.7-5.7V548h268v62.8c0 6 7 9.4 11.7 5.7l127.5-100.8c3.8-2.9 3.8-8.5 0.2-11.4z" p-id="1747"></path></svg>`

    isFullWidth: boolean;

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
        await this.load();

        this.wysiwygMap = new Map();

        console.debug(this.enableMobile, getFrontend());

        //思源会经常更改wysiwyg的padding，所以需要监听变化，一旦变化就重新设置
        this.observer = new MutationObserver(() => {
            this.updateAllPadding();
        });

        this.onLoadProtyle = (({ detail }) => {
            console.debug("onLoadProtyle", detail);

            let parent = (detail.element as HTMLElement).parentElement;
            if (!parent.classList.contains("layout-tab-container")) {
                console.debug("Not a tab document");
                return;
            }
            let id = (detail.element as HTMLElement).getAttribute("data-id");
            if (!id) {
                console.debug("Not a tab document");
                return;
            }
            if (this.wysiwygMap.has(id)) {
                console.debug("Already has", id);
                return;
            }
            let wysiwyg = new WeakRef(detail.wysiwyg.element);
            this.wysiwygMap.set(id, wysiwyg);

            this.pruneWysiwygMap();
            console.debug("Current WysiwygMap", this.wysiwygMap);

            this.updateWysiwygPadding(wysiwyg);
            this.observer.observe(detail.wysiwyg.element, {
                childList: false,
                attributes: true,
                characterData: false,
                subtree: false
            });
        }).bind(this);

        this.onDestroyProtyle = (({ detail }) => {

        }).bind(this);

        this.eventBus.on("loaded-protyle", this.onLoadProtyle);
        

        let forbidMobile = !this.enableMobile && getFrontend() === "mobile";

        if (forbidMobile) {

        } else {
            insertStyle("plugin-width", widthStyle);
        }


        document.documentElement.style.setProperty('--centerWidth', `${this.width}%`);
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

        window.addEventListener('beforeunload', () => {
            this.observer?.disconnect();
            this.eventBus?.off("loaded-protyle", this.onLoadProtyle);
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

    /**
     * 清理已经不存在的 wysiwyg
     */
    pruneWysiwygMap() {
        console.debug("Prune Destroyed Protyle");
        for (let [key, value] of this.wysiwygMap) {
            if (!value.deref()) {
                this.wysiwygMap.delete(key);
            } else {
                let protyle = document.querySelector(`div.protyle[data-id="${key}"]`);
                if (!protyle) {
                    this.wysiwygMap.delete(key);
                    console.debug("Delete", key, value);
                }
            }
        }
    }

    updateAllPadding() {
        for (let [key, value] of this.wysiwygMap) {
            this.updateWysiwygPadding(value);
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

            let padding = parentWidth * (1 - this.width / 100) / 2;
            ele.style.setProperty('padding-left', `${padding}px`);
            ele.style.setProperty('padding-right', `${padding}px`);
            // console.log("updateWysiwygPadding", padding);
            if (padding < 16) {
                document.documentElement.style.setProperty('--refcountRight', `-${padding}px`);
            } else {
                document.documentElement.style.setProperty('--refcountRight', `-16px`);
            }
        }
    }

    async load() {
        let config = await this.loadData("config");
        console.log("Load config", config);
        if (config) {
            // this.width = result;
            this.data['config'] = config;
            this.width = config.width;
            this.enableMobile = config.enableMobile;
        } else {
            this.width = 70;
            this.enableMobile = false;
            this.save();
        }
    }

    async save() {
        this.data['config'] = {
            width: this.width,
            enableMobile: this.enableMobile
        };
        await this.saveData("config", this.data['config']);
        console.debug("Save config", this.data['config']);
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
        this.eventBus.off("loaded-protyle", this.onLoadProtyle);
        this.observer.disconnect();
    }
}
