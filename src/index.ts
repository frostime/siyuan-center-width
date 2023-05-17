import { Plugin, Dialog } from "siyuan";
import "./index.scss";

class ChangeWidthDialog extends Dialog {

    value: number;

    constructor(plugin: PluginSample) {
        let dom = `
        <div id="setting" style="margin: 1rem">
            50%
            <input
                class="b3-slider fn__size200" id="centerWidth"
                max="100" min="50" step="1" type="range" value="70"
            />
            100%
            <br/>
        </div>
        `
        super({
            title: `更改中央面板宽度: ${plugin.width}%`,
            content: dom,
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

export default class PluginSample extends Plugin {

    width: number;

    onload() {
        this.width = 70;
        document.documentElement.style.setProperty('--centerWidth', `${this.width}%`);
        const topBarElement = this.addTopBar({
            icon: "iconCalendar",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                let dialog = new ChangeWidthDialog(this);
            }
        });
    }

    onunload() {
        console.log(this.i18n.byePlugin);
    }
}
