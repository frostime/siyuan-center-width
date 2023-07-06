import { Plugin, Dialog, showMessage, confirm } from "siyuan";
import "./index.scss";

import { changelog } from "sy-plugin-changelog";

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
                <div class="fn__flex-1">在移动端启用?</div> 
                <span class="fn__space"></span>
                <input class="b3-switch fn__flex-center" type="checkbox">
            </label>
        </div>
        `
        super({
            title: `${plugin.i18n.title}: ${plugin.width}%`,
            content: dom,
            destroyCallback: () => {
                plugin.saveData("width", plugin.width);
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
    }
}

export default class WidthPlugin extends Plugin {

    width: number;
    iconEle: HTMLElement

    icon: string = `<svg t="1684328935774" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1746" width="32" height="32"><path d="M180 176h-60c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z m724 0h-60c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8zM785.3 504.3L657.7 403.6c-4.7-3.7-11.7-0.4-11.7 5.7V476H378v-62.8c0-6-7-9.4-11.7-5.7L238.7 508.3c-3.7 2.9-3.7 8.5 0 11.3l127.5 100.8c4.7 3.7 11.7 0.4 11.7-5.7V548h268v62.8c0 6 7 9.4 11.7 5.7l127.5-100.8c3.8-2.9 3.8-8.5 0.2-11.4z" p-id="1747"></path></svg>`

    isFullWidth: boolean;

    async onload() {
        await this.load();
        document.documentElement.style.setProperty('--centerWidth', `${this.width}%`);
        this.iconEle = this.addTopBar({
            icon: this.icon,
            title: this.i18n.title,
            position: "left",
            callback: () => {
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
        this.iconEle.addEventListener("contextmenu", () => { 
            showMessage(this.i18n.bye, 2000, "info");
            this.iconEle.remove();
        });

        let { Dialog } = await changelog(this, 'i18n/changelog.md');
        if (Dialog) {
            Dialog.setFont('1rem');
            Dialog.setSize({
                width: '40%',
                height: '20rem'
            })
        }

    }

    async load() {
        let result = await this.loadData("width");
        console.log("Load width", result);
        if (result) {
            this.width = result;
        } else {
            this.width = 70;
        }
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
        console.log(this.i18n.byePlugin);
    }
}
