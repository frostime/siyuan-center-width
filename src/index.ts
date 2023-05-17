import { Plugin, Dialog, showMessage } from "siyuan";
import "./index.scss";

class ChangeWidthDialog extends Dialog {

    value: number;

    constructor(plugin: WidthPlugin) {
        let dom = `
        <div id="setting" style="margin: 1rem">
            50%
            <input
                class="b3-slider fn__size200" id="centerWidth"
                max="100" min="50" step="1" type="range" value="${plugin.width}"
            />
            100%
            <br/>
        </div>
        `
        super({
            title: `更改中央面板宽度: ${plugin.width}%`,
            content: dom,
            destroyCallback: () => {
                plugin.saveData("width", plugin.width);
                console.log("Write width", plugin.width);
            }
        });
        let header: HTMLDivElement = this.element.querySelector('.b3-dialog__header');
        header.style.textAlign = "center";
        this.element.querySelector("#centerWidth").addEventListener("input", (e) => {
            plugin.width = parseInt((e.target as HTMLInputElement).value);
            header.innerText = `更改中央面板宽度: ${plugin.width}%`;
            document.documentElement.style.setProperty('--centerWidth', `${plugin.width}%`);
        });
    }
}

export default class WidthPlugin extends Plugin {

    width: number;
    iconEle: HTMLElement

    icon: string = `<svg t="1684328935774" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1746" width="32" height="32"><path d="M180 176h-60c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z m724 0h-60c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8zM785.3 504.3L657.7 403.6c-4.7-3.7-11.7-0.4-11.7 5.7V476H378v-62.8c0-6-7-9.4-11.7-5.7L238.7 508.3c-3.7 2.9-3.7 8.5 0 11.3l127.5 100.8c4.7 3.7 11.7 0.4 11.7-5.7V548h268v62.8c0 6 7 9.4 11.7 5.7l127.5-100.8c3.8-2.9 3.8-8.5 0.2-11.4z" p-id="1747"></path></svg>`

    async onload() {
        await this.load();
        document.documentElement.style.setProperty('--centerWidth', `${this.width}%`);
        this.iconEle = this.addTopBar({
            icon: this.icon,
            title: "调节面板宽度",
            position: "left",
            callback: () => {
                new ChangeWidthDialog(this);
            }
        });
        this.iconEle.addEventListener("contextmenu", (e) => { 
            showMessage("不打扰了，再见", 2000, "info");
            this.iconEle.remove();
        });
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

    onunload() {
        console.log(this.i18n.byePlugin);
    }
}
