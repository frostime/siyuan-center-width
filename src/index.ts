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
                plugin.updateWysiwygPadding();
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

    wysiwyg: WeakRef<HTMLElement>;

    observer: MutationObserver;
    onLoadProtyle: ({ detail }) => void;

    icon: string = `<svg t="1684328935774" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1746" width="32" height="32"><path d="M180 176h-60c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z m724 0h-60c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8zM785.3 504.3L657.7 403.6c-4.7-3.7-11.7-0.4-11.7 5.7V476H378v-62.8c0-6-7-9.4-11.7-5.7L238.7 508.3c-3.7 2.9-3.7 8.5 0 11.3l127.5 100.8c4.7 3.7 11.7 0.4 11.7-5.7V548h268v62.8c0 6 7 9.4 11.7 5.7l127.5-100.8c3.8-2.9 3.8-8.5 0.2-11.4z" p-id="1747"></path></svg>`

    isFullWidth: boolean;

    async onload() {

        try {
            await this.init();
        } catch (e) {
            console.error(e);
        }

        changelog(
            this, 'i18n/changelog.md'
        ).then(({ Dialog }) => {
            if (Dialog) {
                Dialog.setFont('1rem');
                Dialog.setSize({
                    width: '40%',
                    height: '25rem'
                })
            }
        }).catch((e) => {
            console.error(e);
        });

    }

    async init() {
        await this.load();

        console.log(this.enableMobile, getFrontend());

        this.updateWysiwygPadding();

        //思源会经常更改wysiwyg的padding，所以需要监听变化，一旦变化就重新设置
        this.observer = new MutationObserver(() => {
            let ele = this.wysiwyg?.deref();
            if (ele) {
                // console.log(ele.style.padding);
                this.updateWysiwygPadding();
                // console.log(ele.style.padding);
            }
        });

        this.onLoadProtyle = (({ detail }) => {
            let oldEle = this.wysiwyg?.deref();
            if (oldEle) {
                this.observer.disconnect();
            }

            this.wysiwyg = new WeakRef(detail.wysiwyg.element);
            this.updateWysiwygPadding();
            this.observer.observe(detail.wysiwyg.element, {
                childList: false,
                attributes: true,
                characterData: false,
                subtree: false
            });
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
            this.wysiwyg = null;
        });
    }

    /**
     * 更新wysiwyg的内联 padding 样式，以便让 wysiwyg 当中的 iframe 的最大宽度可以和 protyle 的宽度一致
     */
    updateWysiwygPadding() {
        let ele = this.wysiwyg?.deref();
        if (ele) {
            let parentWidth = ele.parentElement.clientWidth;
            let padding = parentWidth * (1 - this.width / 100) / 2;
            ele.style.setProperty('padding-left', `${padding}px`);
            ele.style.setProperty('padding-right', `${padding}px`);
            // console.log("updateWysiwygPadding", padding);
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
        console.log("Save config", this.data['config']);
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
        this.wysiwyg = null;
        this.eventBus.off("loaded-protyle", this.onLoadProtyle);
        this.observer.disconnect();
    }
}
